"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
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

const studentIdSchema = z.object({
  studentNumber: z
    .string()
    .min(1, "شماره دانشجویی را وارد کنید")
    .regex(/^\d+$/, "شماره دانشجویی باید فقط شامل اعداد باشد"),
})

const ibanSchema = z.object({
  ibanDigits: z
    .string()
    .min(24, "شماره شبا باید 24 رقم باشد")
    .regex(/^\d+$/, "شماره شبا باید فقط شامل اعداد باشد"),
})

const changeMobileSchema = z.object({
  newMobile: z
    .string()
    .regex(/^09\d{9}$/, "شماره موبایل باید با 09 شروع شده و 11 رقم باشد"),
})

const otpSchema = z.object({
  code: z.string().length(6, "کد تایید باید 6 رقم باشد"),
})

type StudentIdValues = z.infer<typeof studentIdSchema>
type IbanValues = z.infer<typeof ibanSchema>
type ChangeMobileValues = z.infer<typeof changeMobileSchema>
type OtpValues = z.infer<typeof otpSchema>

interface StudentId {
  id: string
  studentNumber: string
}

interface Iban {
  id: string
  ibanNumber: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [studentIds, setStudentIds] = useState<StudentId[]>([])
  const [ibans, setIbans] = useState<Iban[]>([])
  const [changeMobileStep, setChangeMobileStep] = useState<"idle" | "otp">("idle")
  const [newMobile, setNewMobile] = useState("")

  const studentIdForm = useForm<StudentIdValues>({
    resolver: zodResolver(studentIdSchema),
    defaultValues: { studentNumber: "" },
  })

  const ibanForm = useForm<IbanValues>({
    resolver: zodResolver(ibanSchema),
    defaultValues: { ibanDigits: "" },
  })

  const changeMobileForm = useForm<ChangeMobileValues>({
    resolver: zodResolver(changeMobileSchema),
    defaultValues: { newMobile: "" },
  })

  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchUserData()
    }
  }, [session])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/profile")
      const data = await response.json()
      
      if (response.ok) {
        setStudentIds(data.studentIds || [])
        setIbans(data.ibans || [])
      }
    } catch (err) {
      console.error("Error fetching user data:", err)
    }
  }

  const onAddStudentId = async (data: StudentIdValues) => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/user/student-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "خطا در افزودن شماره دانشجویی")
      }

      setSuccess("شماره دانشجویی با موفقیت اضافه شد")
      studentIdForm.reset()
      fetchUserData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onDeleteStudentId = async (id: string) => {
    if (!confirm("آیا از حذف این شماره دانشجویی اطمینان دارید؟")) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/user/student-id/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "خطا در حذف شماره دانشجویی")
      }

      setSuccess("شماره دانشجویی با موفقیت حذف شد")
      fetchUserData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onAddIban = async (data: IbanValues) => {
    setLoading(true)
    setError("")
    setSuccess("")

    // Add IR prefix to the digits
    const fullIban = "IR" + data.ibanDigits

    try {
      const response = await fetch("/api/user/iban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ibanNumber: fullIban }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "خطا در افزودن شماره شبا")
      }

      setSuccess("شماره شبا با موفقیت اضافه شد")
      ibanForm.reset()
      fetchUserData()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onDeleteIban = async (id: string) => {
    if (!confirm("آیا از حذف این شماره شبا اطمینان دارید؟")) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/user/iban/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "خطا در حذف شماره شبا")
      }

      setSuccess("شماره شبا با موفقیت حذف شد")
      fetchUserData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onRequestMobileChange = async (data: ChangeMobileValues) => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: data.newMobile }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "خطا در ارسال کد تایید")
      }

      setNewMobile(data.newMobile)
      setChangeMobileStep("otp")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onVerifyMobileChange = async (data: OtpValues) => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/user/change-mobile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newMobile,
          otpCode: data.code,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "خطا در تغییر شماره موبایل")
      }

      setSuccess("شماره موبایل با موفقیت تغییر یافت. لطفاً دوباره وارد شوید.")
      setTimeout(() => {
        signOut({ callbackUrl: "/login" })
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onDeleteAccount = async () => {
    if (
      !confirm(
        "آیا از حذف حساب کاربری خود اطمینان دارید؟ این عمل غیرقابل بازگشت است."
      )
    )
      return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "خطا در حذف حساب کاربری")
      }

      alert("حساب کاربری شما با موفقیت حذف شد")
      signOut({ callbackUrl: "/login" })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>در حال بارگذاری...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">پروفایل کاربری</h1>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
            {success}
          </div>
        )}

        {/* Mobile Number Section */}
        <Card>
          <CardHeader>
            <CardTitle>شماره موبایل</CardTitle>
            <CardDescription>شماره موبایل فعلی شما</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold" dir="ltr">
                {session.user.mobile}
              </div>
              {changeMobileStep === "idle" && (
                <Button
                  variant="outline"
                  onClick={() => setChangeMobileStep("otp")}
                >
                  تغییر شماره
                </Button>
              )}
            </div>

            {changeMobileStep === "otp" && (
              <div className="mt-4 space-y-4">
                <Form {...changeMobileForm}>
                  <form
                    onSubmit={changeMobileForm.handleSubmit(onRequestMobileChange)}
                    className="space-y-4"
                  >
                    <FormField
                      control={changeMobileForm.control}
                      name="newMobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>شماره موبایل جدید</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="09123456789"
                              {...field}
                              dir="ltr"
                              className="text-left"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <Button type="submit" disabled={loading}>
                        ارسال کد تایید
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setChangeMobileStep("idle")}
                      >
                        انصراف
                      </Button>
                    </div>
                  </form>
                </Form>

                {newMobile && (
                  <Form {...otpForm}>
                    <form
                      onSubmit={otpForm.handleSubmit(onVerifyMobileChange)}
                      className="space-y-4"
                    >
                      <FormField
                        control={otpForm.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>کد تایید</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="- - - - - -"
                                type="text"
                                inputMode="numeric"
                                {...field}
                                dir="ltr"
                                className="text-center text-2xl tracking-widest"
                                maxLength={6}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={loading}>
                        تایید و تغییر شماره
                      </Button>
                    </form>
                  </Form>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student IDs Section */}
        <Card>
          <CardHeader>
            <CardTitle>شماره‌های دانشجویی</CardTitle>
            <CardDescription>
              می‌توانید چند شماره دانشجویی ثبت کنید
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md text-sm">
              ⚠️ مسئولیت صحت شماره دانشجویی ثبت شده بر عهده شماست
            </div>

            {studentIds.length > 0 && (
              <div className="space-y-2">
                {studentIds.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <span className="font-mono">{item.studentNumber}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteStudentId(item.id)}
                      disabled={loading}
                    >
                      حذف
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Form {...studentIdForm}>
              <form
                onSubmit={studentIdForm.handleSubmit(onAddStudentId)}
                className="space-y-4"
              >
                <FormField
                  control={studentIdForm.control}
                  name="studentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>افزودن شماره دانشجویی جدید</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="مثال: 401234567"
                          {...field}
                          dir="ltr"
                          className="text-left"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading}>
                  افزودن
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* IBAN Section */}
        <Card>
          <CardHeader>
            <CardTitle>شماره شبا</CardTitle>
            <CardDescription>
              برای دریافت وجه از کیف پول، شماره شبا خود را ثبت کنید
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-md text-sm">
              ℹ️ شماره شبا باید به نام خود شما (صاحب حساب) باشد.
            </div>

            {ibans.length > 0 && (
              <div className="space-y-2">
                {ibans.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <span className="font-mono" dir="ltr">
                      {item.ibanNumber}
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteIban(item.id)}
                      disabled={loading}
                    >
                      حذف
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Form {...ibanForm}>
              <form
                onSubmit={ibanForm.handleSubmit(onAddIban)}
                className="space-y-4"
              >
                <FormField
                  control={ibanForm.control}
                  name="ibanDigits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>افزودن شماره شبا جدید</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-r-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                            IR
                          </span>
                          <Input
                            placeholder="000000000000000000000000"
                            {...field}
                            dir="ltr"
                            className="text-left rounded-l-none"
                            maxLength={24}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        شماره شبا را بدون IR وارد کنید (فقط اعداد)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading}>
                  افزودن
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Delete Account Section */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">حذف حساب کاربری</CardTitle>
            <CardDescription>
              با حذف حساب، تمام اطلاعات شما پاک خواهد شد
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={onDeleteAccount}
              disabled={loading}
            >
              حذف حساب کاربری
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}