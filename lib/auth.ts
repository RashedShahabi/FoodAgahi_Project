import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "رمز عبور",
      credentials: {
        mobile: { label: "شماره موبایل", type: "text" },
        password: { label: "رمز عبور", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.mobile || !credentials?.password) {
          throw new Error("لطفاً شماره موبایل و رمز عبور را وارد کنید");
        }

        const user = await prisma.user.findUnique({
          where: { mobile: credentials.mobile },
        });

        if (!user) {
          throw new Error("کاربری با این شماره موبایل یافت نشد");
        }

        if (!user.isActive) {
          throw new Error("حساب کاربری شما غیرفعال است");
        }

        // بررسی قفل بودن اکانت
        if (user.lockUntil && user.lockUntil > new Date()) {
          const remainingMinutes = Math.ceil(
            (user.lockUntil.getTime() - Date.now()) / 60000
          );
          throw new Error(
            `حساب شما به دلیل تلاش‌های ناموفق متعدد قفل شده است. لطفاً ${remainingMinutes} دقیقه دیگر تلاش کنید`
          );
        }

        // بررسی رمز عبور
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          // افزایش تعداد تلاش‌های ناموفق
          const failedAttempts = user.failedLoginAttempts + 1;
          const lockUntil =
            failedAttempts >= 5
              ? new Date(Date.now() + 10 * 60 * 1000) // 10 دقیقه
              : null;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: failedAttempts,
              lockUntil: lockUntil,
            },
          });

          if (failedAttempts >= 5) {
            throw new Error(
              "حساب شما به دلیل 5 بار ورود ناموفق برای 10 دقیقه قفل شد"
            );
          }

          throw new Error(
            `رمز عبور اشتباه است. ${5 - failedAttempts} تلاش باقی مانده`
          );
        }

        // ریست کردن تلاش‌های ناموفق
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockUntil: null,
          },
        });

        return {
          id: user.id,
          mobile: user.mobile,
          role: user.role,
        };
      },
    }),
    CredentialsProvider({
      id: "otp",
      name: "کد یکبار مصرف",
      credentials: {
        mobile: { label: "شماره موبایل", type: "text" },
        code: { label: "کد تایید", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.mobile || !credentials?.code) {
          throw new Error("لطفاً شماره موبایل و کد تایید را وارد کنید");
        }

        const user = await prisma.user.findUnique({
          where: { mobile: credentials.mobile },
        });

        if (!user) {
          throw new Error("کاربری با این شماره موبایل یافت نشد");
        }

        if (!user.isActive) {
          throw new Error("حساب کاربری شما غیرفعال است");
        }

        // بررسی کد OTP
        const otpCode = await prisma.otpCode.findFirst({
          where: {
            mobile: credentials.mobile,
            code: credentials.code,
            isUsed: false,
            expiresAt: {
              gt: new Date(),
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        if (!otpCode) {
          throw new Error("کد تایید نامعتبر یا منقضی شده است");
        }

        // علامت‌گذاری کد به عنوان استفاده شده
        await prisma.otpCode.update({
          where: { id: otpCode.id },
          data: { isUsed: true },
        });

        return {
          id: user.id,
          mobile: user.mobile,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 ساعت
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.mobile = user.mobile;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          mobile: token.mobile as string,
          role: token.role as string,
        };
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
