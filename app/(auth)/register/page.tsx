"use client"

import Link from "next/link"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const registerSchema = z
  .object({
    mobile: z
      .string()
      .regex(/^09\d{9}$/, "شماره موبایل باید با 09 شروع شده و 11 رقم باشد"),
    password: z
      .string()
      .min(8, "رمز عبور باید حداقل 8 کاراکتر باشد")
      .regex(/[A-Za-z]/, "رمز عبور باید حداقل یک حرف داشته باشد")
      .regex(/[0-9]/, "رمز عبور باید حداقل یک عدد داشته باشد"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تکرار آن یکسان نیستند",
    path: ["confirmPassword"],
  })

const otpSchema = z.object({
  code: z.string().length(6, "کد تایید باید 6 رقم باشد"),
})

type RegisterFormValues = z.infer<typeof registerSchema>
type OtpFormValues = z.infer<typeof otpSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<"register" | "otp">("register")
  const [mobile, setMobile] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [otpValue, setOtpValue] = useState("")

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      mobile: "",
      password: "",
      confirmPassword: "",
    },
  })

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: "",
    },
  })

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: data.mobile,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "خطا در ارسال کد تایید")
      }

      setMobile(data.mobile)
      setStep("otp")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onOtpSubmit = async (data: OtpFormValues) => {
    setLoading(true)
    setError("")

    try {
      const registerData = registerForm.getValues()

      const registerResponse = await fetch("/api/auth/register", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile,
          password: registerData.password,
          code: data.code,
        }),
      })

      const registerResult = await registerResponse.json()

      if (!registerResponse.ok) {
        throw new Error(registerResult.error || "خطا در ثبت نام")
      }

      const loginResult = await signIn("credentials", {
        mobile: mobile,
        password: registerData.password,
        redirect: false,
      })

      if (loginResult?.error) {
        throw new Error("خطا در ورود خودکار. لطفاً دستی وارد شوید.")
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "خطا در ثبت نام")
    } finally {
      setLoading(false)
    }
  }

  const handleBackToRegister = () => {
    setStep("register")
    setError("")
    otpForm.reset()
    setOtpValue("")
  }

  const handleOtpChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, "").slice(0, 6)
    setOtpValue(cleanValue)
    otpForm.setValue("code", cleanValue, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cream py-12 px-4 sm:px-6 lg:px-8"
      dir="rtl"
    >
      <Card className="w-full max-w-md shadow-xl border-none rounded-2xl bg-white">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-3xl font-bold text-center text-orange-600">
            ثبت‌نام در فودآگهی
          </CardTitle>
          <CardDescription className="text-center text-gray-500 leading-7">
            {step === "register"
              ? "برای ساخت حساب کاربری، شماره موبایل و رمز عبورت رو وارد کن"
              : "کد تایید ارسال‌شده به شماره موبایلت رو وارد کن"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          {step === "register" ? (
            <Form {...registerForm}>
              <form
                onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={registerForm.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">شماره موبایل</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="09123456789"
                          {...field}
                          dir="ltr"
                          className="text-left h-12 rounded-xl border-gray-200 focus-visible:ring-orange-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">رمز عبور</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="حداقل 8 کاراکتر"
                          {...field}
                          className="h-12 rounded-xl border-gray-200 focus-visible:ring-orange-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">تکرار رمز عبور</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="تکرار رمز عبور"
                          {...field}
                          className="h-12 rounded-xl border-gray-200 focus-visible:ring-orange-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 rounded-xl transition-all"
                  disabled={loading}
                >
                  {loading ? "در حال ارسال..." : "ارسال کد تایید"}
                </Button>

                <div className="text-center text-sm mt-4">
                  <span className="text-gray-600">قبلاً ثبت‌نام کرده‌ای؟ </span>
                  <Link href="/login" className="text-orange-600 font-bold hover:underline">
                    ورود
                  </Link>
                </div>
              </form>
            </Form>
          ) : (
            <Form {...otpForm}>
              <form
                onSubmit={otpForm.handleSubmit(onOtpSubmit)}
                className="space-y-5"
              >
                <div className="text-sm text-gray-600 text-center leading-7">
                  کد تایید به شماره <span className="font-bold">{mobile}</span> ارسال شد
                </div>

                <FormField
                  control={otpForm.control}
                  name="code"
                  render={() => (
                    <FormItem className="flex flex-col items-center justify-center space-y-4">
                      <FormLabel className="text-gray-700">کد تایید ۶ رقمی</FormLabel>
                      <FormControl>
                        <div dir="ltr" className="w-full flex justify-center">
                          <InputOTP
                            maxLength={6}
                            value={otpValue}
                            onChange={handleOtpChange}
                            dir="ltr"
                          >
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 rounded-xl transition-all"
                  disabled={loading}
                >
                  {loading ? "در حال تایید..." : "تایید و ثبت‌نام"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl py-6"
                  onClick={(e) => {
                    e.preventDefault()
                    handleBackToRegister()
                  }}
                  disabled={loading}
                >
                  بازگشت
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
