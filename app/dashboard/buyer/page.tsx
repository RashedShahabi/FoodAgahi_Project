"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FoodAd {
  id: string
  foodName: string
  price: number
  description?: string
  imageUrl?: string
  mealType: "LUNCH" | "DINNER"
  mealDate: string
  sellerId: string
  sellerMobile: string
  expiresAt: string
  createdAt: string
}

export default function AdsMarketplacePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [ads, setAds] = useState<FoodAd[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [mealType, setMealType] = useState<string>("")
  const [mealDate, setMealDate] = useState("")

  const fetchAds = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (mealType) params.set("mealType", mealType)
      if (mealDate) params.set("mealDate", mealDate)
      if (search) params.set("search", search)

      const response = await fetch(`/api/ads?${params.toString()}`)
      const result = await response.json()
      if (response.ok) {
        setAds(result.ads)
      } else {
        setError(result.error || "خطا در دریافت آگهی‌ها")
      }
    } catch (err) {
      setError("خطا در اتصال به سرور")
    } finally {
      setLoading(false)
    }
  }, [mealType, mealDate, search])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchAds()
    }
  }, [session, fetchAds])

  // Short-Polling هر ۱۰ ثانیه
  useEffect(() => {
    if (session?.user) {
      const interval = setInterval(fetchAds, 10000)
      return () => clearInterval(interval)
    }
  }, [session, fetchAds])

  const getMealTypeLabel = (type: string) => type === "LUNCH" ? "ناهار" : "شام"
  const formatPrice = (price: number) => price.toLocaleString()
  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expire = new Date(expiresAt)
    const diff = expire.getTime() - now.getTime()
    if (diff <= 0) return "منقضی شده"
    const minutes = Math.floor(diff / 60000)
    return `${minutes} دقیقه دیگر`
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>در حال بارگذاری...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">بازار غذا</h1>
          <p className="text-gray-600 mt-2">غذاهای موجود برای خرید امروز را مشاهده کنید</p>
        </div>

        {/* فیلترها */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">جستجو</label>
                <Input
                  placeholder="نام غذا..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">نوع وعده</label>
                <Select value={mealType} onValueChange={setMealType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="همه" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">همه</SelectItem>
                    <SelectItem value="LUNCH">ناهار</SelectItem>
                    <SelectItem value="DINNER">شام</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">تاریخ</label>
                <Input
                  type="date"
                  value={mealDate}
                  onChange={(e) => setMealDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {ads.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">در حال حاضر آگهی غذایی وجود ندارد</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ads.map((ad) => (
              <Card key={ad.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{ad.foodName}</CardTitle>
                  <CardDescription>
                    {getMealTypeLabel(ad.mealType)} • {formatPrice(ad.price)} تومان
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ad.description && (
                    <p className="text-sm text-gray-600">{ad.description}</p>
                  )}
                  <div className="text-sm text-gray-600">
                    <div>فروشنده: {ad.sellerMobile}</div>
                    <div>تاریخ: {new Date(ad.mealDate).toLocaleDateString("fa-IR")}</div>
                    <div className="text-amber-600">⏰ {getTimeRemaining(ad.expiresAt)}</div>
                  </div>
                  <Button className="w-full" onClick={() => router.push(`/dashboard/buyer/ads/${ad.id}`)}>
                    مشاهده و خرید
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}