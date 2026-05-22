"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
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

const passwordLoginSchema = z.object({
  mobile: z
    .string()
    .regex(/^09\d{9}$/, "شماره موبایل باید با 09 شروع شده و 11 رقم باشد"),
  password: z.string().min(1, "رمز عبور را وارد کنید"),
})

const otpLoginSchema = z.object({
  mobile: z
    .string()
    .regex(/^09\d{9}$/, "شماره موبایل باید با 09 شروع شده و 11 رقم باشد"),
})

const otpVerifySchema = z.object({
  code: z.string().length(6, "کد تایید باید 6 رقم باشد"),
})

type PasswordLoginValues = z.infer<typeof passwordLoginSchema>
type OtpLoginValues = z.infer<typeof otpLoginSchema>
type OtpVerifyValues = z.infer<typeof otpVerifySchema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password")
  const [otpStep, setOtpStep] = useState<"request" | "verify">("request")
  const [mobileValue, setMobileValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess("ثبت نام با موفقیت انجام شد. اکنون می‌توانید وارد شوید.")
    }
  }, [searchParams])

  const passwordForm = useForm<PasswordLoginValues>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: {
      mobile: "",
      password: "",
    },
  })

  const otpVerifyForm = useForm<OtpVerifyValues>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: {
      code: "",
    },
  })

  const onPasswordLogin = async (data: PasswordLoginValues) => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await signIn("credentials", {
        mobile: data.mobile,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "خطا در ورود")
    } finally {
      setLoading(false)
    }
  }

  const onOtpRequest = async (mobile: string) => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "خطا در ارسال کد تایید")
      }

      setOtpStep("verify")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onOtpVerify = async (data: OtpVerifyValues) => {
    setLoading(true)
    setError("")

    try {
      const result = await signIn("otp", {
        mobile: mobileValue,
        code: data.code,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "خطا در ورود")
    } finally {
      setLoading(false)
    }
  }

  const handleBackToOtpRequest = () => {
    setOtpStep("request")
    setError("")
    setMobileValue("")
    otpVerifyForm.reset()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cream py-12 px-4 sm:px-6 lg:px-8"
      dir="rtl"
    >
      <Card className="w-full max-w-md shadow-xl border-none rounded-2xl bg-white">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-3xl font-bold text-center text-orange-600">
            ورود به فودآگهی
          </CardTitle>
          <CardDescription className="text-center text-gray-500 leading-7">
            {loginMethod === "password"
              ? "خوش برگشتی! با شماره موبایل و رمز عبور وارد شو"
              : otpStep === "request"
              ? "شماره موبایلت رو برای دریافت کد تایید وارد کن"
              : "کد ۶ رقمی ارسال‌شده رو وارد کن"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
              {success}
            </div>
          )}

          {/* Toggle Login Method */}
          <div className="flex gap-2 mb-6 bg-orange-50 p-1 rounded-xl">
            <Button
              type="button"
              variant="ghost"
              className={`flex-1 rounded-lg transition-all ${
                loginMethod === "password"
                  ? "bg-white shadow-sm text-orange-600"
                  : "text-gray-500"
              }`}
              onClick={() => {
                setLoginMethod("password")
                setOtpStep("request")
                setMobileValue("")
                setError("")
              }}
            >
              رمز عبور
            </Button>

            <Button
              type="button"
              variant="ghost"
              className={`flex-1 rounded-lg transition-all ${
                loginMethod === "otp"
                  ? "bg-white shadow-sm text-orange-600"
                  : "text-gray-500"
              }`}
              onClick={() => {
                setLoginMethod("otp")
                setMobileValue("")
                setError("")
              }}
            >
              کد یکبار مصرف
            </Button>
          </div>

          {loginMethod === "password" ? (
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordLogin)}
                className="space-y-5"
              >
                <FormField
                  control={passwordForm.control}
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
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">رمز عبور</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="رمز عبور"
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
                  {loading ? "در حال ورود..." : "ورود"}
                </Button>
              </form>
            </Form>
          ) : otpStep === "request" ? (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium leading-none text-gray-700 mb-2 block">
                  شماره موبایل
                </label>
                <Input
                  placeholder="09123456789"
                  value={mobileValue || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 11)
                    setMobileValue(val)
                  }}
                  dir="ltr"
                  className="text-left h-12 rounded-xl border-gray-200 focus-visible:ring-orange-500"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>

              <Button
                type="button"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 rounded-xl transition-all"
                disabled={loading || mobileValue.length !== 11}
                onClick={() => onOtpRequest(mobileValue)}
              >
                {loading ? "در حال ارسال..." : "ارسال کد تایید"}
              </Button>
            </div>
          ) : (
            <Form {...otpVerifyForm}>
              <form
                onSubmit={otpVerifyForm.handleSubmit(onOtpVerify)}
                className="space-y-5"
              >
                <div className="text-sm text-gray-600 mb-2 text-center leading-7">
                  کد تایید به شماره <span className="font-bold">{mobileValue}</span> ارسال شد
                </div>

                <FormField
                  control={otpVerifyForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center justify-center space-y-4">
                      <FormLabel className="text-gray-700">کد تایید ۶ رقمی</FormLabel>
                      <FormControl>
                        <div dir="ltr" className="w-full flex justify-center">
                          <InputOTP
                            maxLength={6}
                            value={field.value}
                            onChange={field.onChange}
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
                  {loading ? "در حال تایید..." : "تایید و ورود"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl py-6"
                  onClick={(e) => {
                    e.preventDefault()
                    handleBackToOtpRequest()
                  }}
                  disabled={loading}
                >
                  بازگشت
                </Button>
              </form>
            </Form>
          )}

          <div className="text-center text-sm mt-6">
            <span className="text-gray-600">حساب کاربری ندارید؟ </span>
            <Link href="/register" className="text-orange-600 font-bold hover:underline">
              ثبت‌نام رایگان
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
