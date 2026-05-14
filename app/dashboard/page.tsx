"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ProfileCompletion {
  isComplete: boolean
  hasStudentId: boolean
  hasIban: boolean
  messages: string[]
  remainingSteps: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletion | null>(null)
  const [loadingCompletion, setLoadingCompletion] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // بررسی تکمیل بودن پروفایل
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/profile/completion")
        .then((res) => res.json())
        .then((data) => {
          setProfileCompletion(data)
        })
        .catch((err) => {
          console.error("خطا در بررسی پروفایل:", err)
        })
        .finally(() => {
          setLoadingCompletion(false)
        })
    }
  }, [status])

  if (status === "loading" || loadingCompletion) {
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
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">داشبورد</h1>
          <Button variant="outline" onClick={() => signOut({ callbackUrl: "/login" })}>
            خروج
          </Button>
        </div>

        {/* هشدار تکمیل پروفایل */}
        {!profileCompletion?.isComplete && profileCompletion && (
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900 flex items-center gap-2">
                <span>⚠️</span> تکمیل پروفایل
              </CardTitle>
              <CardDescription>
                لطفاً اطلاعات پروفایل خود را تکمیل کنید تا بتوانید از تمام قابلیت‌های سیستم استفاده نمایید.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {profileCompletion.messages.map((msg, index) => (
                  <li key={index} className="text-amber-800 flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0"></span>
                    {msg}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Button
                  onClick={() => router.push("/dashboard/profile")}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  تکمیل پروفایل
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* پیام تکمیل پروفایل */}
        {profileCompletion?.isComplete && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="py-4">
              <p className="text-green-800 flex items-center gap-2">
                <span>✅</span>
                پروفایل شما به طور کامل تکمیل شده است. از تمام قابلیت‌های سیستم استفاده نمایید.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>خوش آمدید!</CardTitle>
            <CardDescription>
              شماره موبایل: <span className="font-bold">{session.user.mobile}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              به سیستم فوداگاهی خوش آمدید. از منوی زیر می‌توانید به بخش‌های مختلف
              دسترسی داشته باشید.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              <Card 
                className="hover:shadow-lg transition-shadow cursor-pointer ring-2 ring-transparent hover:ring-primary" 
                onClick={() => router.push("/dashboard/profile")}
              >
                <CardHeader>
                  <CardTitle className="text-lg">پروفایل کاربری</CardTitle>
                  {!profileCompletion?.isComplete && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                      در انتظار تکمیل
                    </span>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    مدیریت اطلاعات شخصی، شماره دانشجویی و شبا
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer ring-2 ring-transparent hover:ring-primary" onClick={() => router.push("/dashboard/seller/ads/new")}>
                <CardHeader>
                  <CardTitle className="text-lg">آگهی‌ها</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    مشاهده و ثبت آگهی‌های خرید و فروش غذا
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer ring-2 ring-transparent hover:ring-primary opacity-50">
                <CardHeader>
                  <CardTitle className="text-lg">سفارش‌ها</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    مشاهده و مدیریت سفارش‌های خود
                  </p>
                  <p className="text-xs text-gray-400 mt-2">به زودی...</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer ring-2 ring-transparent hover:ring-primary opacity-50">
                <CardHeader>
                  <CardTitle className="text-lg">کیف پول</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    مدیریت موجودی و تراکنش‌های مالی
                  </p>
                  <p className="text-xs text-gray-400 mt-2">به زودی...</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">راهنما</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-blue-800">
              {profileCompletion?.isComplete ? (
                <>
                  <li>• پروفایل شما تکمیل شده است</li>
                  <li>• برای استفاده از سیستم، منتظر فازهای بعدی باشید</li>
                </>
              ) : (
                <>
                  <li>• ابتدا پروفایل خود را تکمیل کنید</li>
                  <li>• شماره دانشجویی و شبا خود را ثبت کنید</li>
                  <li>• برای استفاده از سیستم، منتظر فازهای بعدی باشید</li>
                </>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
