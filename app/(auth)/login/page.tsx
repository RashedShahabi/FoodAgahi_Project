"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// --- Schema & Types ---
const passwordLoginSchema = z.object({
  mobile: z.string().regex(/^09\d{9}$/, "شماره موبایل باید با 09 شروع شده و 11 رقم باشد"),
  password: z.string().min(1, "رمز عبور را وارد کنید"),
});

const otpVerifySchema = z.object({
  code: z.string().length(6, "کد تایید باید 6 رقم باشد"),
});

type PasswordLoginValues = z.infer<typeof passwordLoginSchema>;
type OtpVerifyValues = z.infer<typeof otpVerifySchema>;

// --- کامپوننت داخلی که از هوک‌ها استفاده می‌کند ---
function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [otpStep, setOtpStep] = useState<"request" | "verify">("request");
  const [mobileValue, setMobileValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess("ثبت نام با موفقیت انجام شد. اکنون می‌توانید وارد شوید.");
    }
  }, [searchParams]);

  const passwordForm = useForm<PasswordLoginValues>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: { mobile: "", password: "" },
  });

  const otpVerifyForm = useForm<OtpVerifyValues>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: { code: "" },
  });

  const onPasswordLogin = async (data: PasswordLoginValues) => {
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", { mobile: data.mobile, password: data.password, redirect: false });
      if (result?.error) throw new Error(result.error);
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) { setError(err.message || "خطا در ورود"); } finally { setLoading(false); }
  };

  const onOtpRequest = async (mobile: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      if (!response.ok) throw new Error("خطا در ارسال کد تایید");
      setOtpStep("verify");
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const onOtpVerify = async (data: OtpVerifyValues) => {
    setLoading(true);
    try {
      const result = await signIn("otp", { mobile: mobileValue, code: data.code, redirect: false });
      if (result?.error) throw new Error(result.error);
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) { setError(err.message || "خطا در ورود"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream py-12 px-4" dir="rtl">
      <Card className="w-full max-w-md shadow-xl border-none rounded-2xl bg-white">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-3xl font-bold text-center text-orange-600">ورود به فودآگهی</CardTitle>
          <CardDescription className="text-center text-gray-500">
            {loginMethod === "password" ? "خوش برگشتی! با شماره موبایل و رمز عبور وارد شو" : otpStep === "request" ? "شماره موبایل را وارد کن" : "کد ۶ رقمی را وارد کن"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm">{success}</div>}
          
          <div className="flex gap-2 mb-6 bg-orange-50 p-1 rounded-xl">
            <Button variant="ghost" className={`flex-1 ${loginMethod === "password" ? "bg-white text-orange-600" : ""}`} onClick={() => setLoginMethod("password")}>رمز عبور</Button>
            <Button variant="ghost" className={`flex-1 ${loginMethod === "otp" ? "bg-white text-orange-600" : ""}`} onClick={() => setLoginMethod("otp")}>کد یکبار مصرف</Button>
          </div>

          {loginMethod === "password" ? (
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordLogin)} className="space-y-5">
                <FormField control={passwordForm.control} name="mobile" render={({ field }) => <FormItem><FormLabel>شماره موبایل</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>} />
                <FormField control={passwordForm.control} name="password" render={({ field }) => <FormItem><FormLabel>رمز عبور</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>} />
                <Button type="submit" className="w-full bg-orange-500" disabled={loading}>ورود</Button>
              </form>
            </Form>
          ) : otpStep === "request" ? (
            <div className="space-y-5">
              <Input placeholder="09..." value={mobileValue} onChange={(e) => setMobileValue(e.target.value.replace(/\D/g, "").slice(0, 11))} dir="ltr" />
              <Button className="w-full bg-orange-500" onClick={() => onOtpRequest(mobileValue)} disabled={loading || mobileValue.length !== 11}>ارسال کد</Button>
            </div>
          ) : (
            <Form {...otpVerifyForm}>
              <form onSubmit={otpVerifyForm.handleSubmit(onOtpVerify)} className="space-y-5">
                <FormField control={otpVerifyForm.control} name="code" render={({ field }) => <FormItem><FormControl><div dir="ltr" className="flex justify-center"><InputOTP maxLength={6} value={field.value} onChange={field.onChange}><InputOTPGroup><InputOTPSlot index={0}/><InputOTPSlot index={1}/><InputOTPSlot index={2}/><InputOTPSlot index={3}/><InputOTPSlot index={4}/><InputOTPSlot index={5}/></InputOTPGroup></InputOTP></div></FormControl><FormMessage /></FormItem>} />
                <Button type="submit" className="w-full bg-orange-500">تایید</Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// --- کامپوننت اصلی که با Suspense پوشانده شده ---
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">در حال بارگذاری...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
