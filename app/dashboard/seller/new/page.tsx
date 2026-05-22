"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
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
import { getTodayJalaaliDate, toPersianDigits, formatJalaaliDate } from "@/lib/jalaali"
import { JalaliDatePicker } from "@/components/jalali-date-picker"

interface MenuItem {
  id: string
  name: string
  price: number
  mealType: string
}

interface CreatedAd {
  id: string
  foodName: string
  price: number
  description?: string
  mealType: "LUNCH" | "DINNER"
  mealDate: string
  isAvailable: boolean
  isSold: boolean
  expiresAt: string
  createdAt: string
  orders?: {
    id: string
    status: string
    buyerStudentId: string
    transferScreenshot?: string
  }[]
}

const createAdSchema = z.object({
  mealType: z.enum(["LUNCH", "DINNER"]).refine((val) => val !== undefined, {
    message: "نوع وعده را انتخاب کنید",
  }),
  foodId: z.string().min(1, "غذا را انتخاب کنید"),
  price: z
    .number()
    .positive("قیمت باید یک عدد مثبت باشد")
    .refine(
      (val) => val <= 1000000,
      "قیمت نباید بیشتر از ۱,۰۰۰,۰۰۰ تومان باشد"
    ),
  mealDate: z.string().min(1, "تاریخ وعده را انتخاب کنید"),
  description: z.string().optional(),
})

type CreateAdValues = z.infer<typeof createAdSchema>

export default function NewAdPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedMealType, setSelectedMealType] = useState<string>("")
  const [selectedFood, setSelectedFood] = useState<MenuItem | null>(null)
  const [myAds, setMyAds] = useState<CreatedAd[]>([])
  const [timeWarning, setTimeWarning] = useState<string>("")

  const todayJalaali = getTodayJalaaliDate()

  const form = useForm<CreateAdValues>({
    resolver: zodResolver(createAdSchema),
    defaultValues: {
      mealType: undefined,
      foodId: "",
      price: 0,
      mealDate: todayJalaali,
      description: "",
    },
  })

  const fetchMyAds = useCallback(async () => {
    try {
      const response = await fetch("/api/ads/my-ads")
      const result = await response.json()
      if (response.ok) {
        setMyAds(result.ads || [])
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (session?.user) {
      fetchMyAds()
    }
  }, [session, fetchMyAds])

  useEffect(() => {
    if (selectedMealType) {
      fetch(`/api/menu?mealType=${selectedMealType}`)
        .then((res) => res.json())
        .then((data) => {
          setMenuItems(data.items || [])
        })
        .catch(() => {
          // ignore
        })
    }
  }, [selectedMealType])

  const checkTimeRestriction = useCallback(async () => {
    const mealType = form.getValues("mealType")
    const mealDate = form.getValues("mealDate")
    
    if (mealType && mealDate) {
      const { getIranTime, getMealTimeRestriction } = await import("@/lib/jalaali")
      const iranTime = getIranTime()
      const jToday = getTodayJalaaliDate()
      
      if (mealDate === jToday) {
        const restriction = getMealTimeRestriction(mealType)
        const currentMinutes = iranTime.getHours() * 60 + iranTime.getMinutes()
        const limitMinutes = restriction.limitHour * 60 + restriction.limitMinute
        
        if (currentMinutes > limitMinutes) {
          setTimeWarning(restriction.errorMsg)
        } else {
          const remainingMinutes = limitMinutes - currentMinutes
          if (remainingMinutes <= 30) {
            setTimeWarning(`فقط ${toPersianDigits(remainingMinutes.toString())} دقیقه تا پایان زمان ثبت آگهی ${mealType === "LUNCH" ? "ناهار" : "شام"} فرصت دارید`)
          } else {
            setTimeWarning("")
          }
        }
      } else {
        setTimeWarning("")
      }
    }
  }, [form])

  useEffect(() => {
    checkTimeRestriction()
  }, [checkTimeRestriction])

  const handleFoodChange = (foodId: string) => {
    const food = menuItems.find((item) => item.id === foodId)
    if (food) {
      setSelectedFood(food)
      form.setValue("foodId", food.id)
      form.setValue("price", food.price)
    }
  }

  const onSubmit = async (data: CreateAdValues) => {
    setLoading(true)
    setError("")
    setSuccess("")

    const food = menuItems.find((item) => item.id === data.foodId)

    try {
      const response = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodName: food?.name || "غذا",
          price: data.price,
          mealType: data.mealType,
          mealDate: data.mealDate,
          description: data.description,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "خطا در ثبت آگهی")
      }

      setSuccess("آگهی با موفقیت ثبت شد!")
      
      await fetchMyAds()

      form.reset({
        mealType: undefined,
        foodId: "",
        price: 0,
        mealDate: getTodayJalaaliDate(),
        description: "",
      })
      setSelectedMealType("")
      setSelectedFood(null)

      setTimeout(() => {
        setSuccess("")
      }, 3000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "خطایی در ثبت آگهی رخ داد"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAd = async (adId: string) => {
    if (!confirm("آیا از حذف این آگهی اطمینان دارید؟")) return
    
    try {
      const response = await fetch(`/api/ads/${adId}`, {
        method: "DELETE",
      })
      const result = await response.json()
      
      if (response.ok) {
        setMyAds((prev) => prev.filter((ad) => ad.id !== adId))
      } else {
        setError(result.error || "خطا در حذف آگهی")
      }
    } catch {
      setError("خطا در اتصال به سرور")
    }
  }

  const handleEditAd = async (adId: string, updatedData: { foodName: string; price: number; description?: string }) => {
    try {
      const response = await fetch(`/api/ads/${adId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      })
      const result = await response.json()
      
      if (response.ok) {
        await fetchMyAds()
      } else {
        setError(result.error || "خطا در ویرایش آگهی")
      }
    } catch {
      setError("خطا در اتصال به سرور")
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

  const maxPrice = selectedFood ? selectedFood.price * 2 : 1000000

  const formatAdDate = (isoDate: string): string => {
    const date = new Date(isoDate)
    return formatJalaaliDate(date)
  }

  const getMealTypeLabel = (type: string): string => type === "LUNCH" ? "ناهار" : "شام"

  // وضعیت آگهی بر اساس سفارشات
  const getAdStatus = (ad: CreatedAd): { label: string; color: string; hasOrder: boolean } => {
    if (!ad.isAvailable) return { label: "حذف شده", color: "text-gray-500", hasOrder: false }
    
    const expiresAt = new Date(ad.expiresAt)
    if (expiresAt < new Date()) return { label: "منقضی شده", color: "text-red-500", hasOrder: false }
    
    if (ad.isSold) return { label: "فروخته شده", color: "text-blue-600", hasOrder: false }
    
    // بررسی سفارشات فعال
    const orders = ad.orders || []
    const pendingOrder = orders.find(o => o.status === "PENDING")
    const confirmedOrder = orders.find(o => o.status === "CONFIRMED")
    
    if (confirmedOrder) {
      return { label: "در انتظار انتقال", color: "text-amber-600", hasOrder: true }
    }
    if (pendingOrder) {
      return { label: "در انتظار تایید فروشنده", color: "text-blue-600", hasOrder: true }
    }
    
    return { label: "خریداری نشده", color: "text-green-600", hasOrder: false }
  }

  const getStatusLabel = (ad: CreatedAd): string => {
    const status = getAdStatus(ad)
    return status.label
  }

  const getStatusColor = (ad: CreatedAd): string => {
    const status = getAdStatus(ad)
    return status.color
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">ثبت آگهی جدید</h1>
          <p className="text-gray-600 mt-2">
            غذای خود را از منوی دانشگاه انتخاب کنید
          </p>
        </div>

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

        {timeWarning && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-md text-sm">
            ⚠️ {timeWarning}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>اطلاعات غذا</CardTitle>
            <CardDescription>
              ابتدا نوع وعده، سپس غذا و در نهایت قیمت فروش را وارد کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="mealType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع وعده</FormLabel>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={field.value === "LUNCH" ? "default" : "outline"}
                          onClick={() => {
                            field.onChange("LUNCH")
                            setSelectedMealType("LUNCH")
                            setMenuItems([])
                            setSelectedFood(null)
                            form.setValue("foodId", "")
                          }}
                        >
                          ناهار
                        </Button>
                        <Button
                          type="button"
                          variant={field.value === "DINNER" ? "default" : "outline"}
                          onClick={() => {
                            field.onChange("DINNER")
                            setSelectedMealType("DINNER")
                            setMenuItems([])
                            setSelectedFood(null)
                            form.setValue("foodId", "")
                          }}
                        >
                          شام
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedMealType && (
                  <FormField
                    control={form.control}
                    name="foodId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>انتخاب غذا</FormLabel>
                        <FormControl>
                          <select
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={field.value}
                            onChange={(e) => {
                              field.onChange(e.target.value)
                              handleFoodChange(e.target.value)
                            }}
                          >
                            <option value="">-- غذا را انتخاب کنید --</option>
                            {menuItems.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} - {toPersianDigits(item.price.toLocaleString())} تومان
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedFood && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-md space-y-2">
                    <h3 className="font-semibold text-blue-900">{selectedFood.name}</h3>
                    <div className="text-sm text-blue-700">
                      <p>قیمت پایه: {toPersianDigits(selectedFood.price.toLocaleString())} تومان</p>
                      <p>حداکثر قیمت فروش: {toPersianDigits(maxPrice.toLocaleString())} تومان</p>
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>قیمت فروش (تومان)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder={`حداکثر ${toPersianDigits(maxPrice.toLocaleString())}`}
                            min={selectedFood?.price || 0}
                            max={maxPrice}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="w-full"
                          />
                          <span className="text-sm text-gray-500 whitespace-nowrap">تومان</span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        {selectedFood
                          ? `بین ${toPersianDigits(selectedFood.price.toLocaleString())} تا ${toPersianDigits(maxPrice.toLocaleString())} تومان`
                          : "قیمت باید یک عدد مثبت باشد"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mealDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاریخ وعده (شمسی)</FormLabel>
                      <FormControl>
                        <JalaliDatePicker
                          value={field.value || todayJalaali}
                          onChange={(newValue) => field.onChange(newValue)}
                          minDate={todayJalaali}
                        />
                      </FormControl>
                      <FormDescription>
                        وعده باید برای امروز یا فردا باشد
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>توضیحات (اختیاری)</FormLabel>
                      <FormControl>
                        <textarea
                          placeholder="توضیحاتی درباره غذا بنویسید..."
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          rows={3}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading || !!timeWarning} className="flex-1">
                    {loading ? "در حال ثبت..." : "ثبت آگهی"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/seller/ads/my-ads")}
                  >
                    مشاهده آگهی‌های من
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>آگهی‌های من</CardTitle>
            <CardDescription>
              لیست آگهی‌هایی که ثبت کرده‌اید
            </CardDescription>
          </CardHeader>
          <CardContent>
            {myAds.length === 0 ? (
              <p className="text-gray-600 text-center py-4">هنوز آگهی ثبت نکرده‌اید</p>
            ) : (
              <div className="space-y-3">
                {myAds.map((ad) => (
                  <AdCardCard
                    key={ad.id}
                    ad={ad}
                    getStatusLabel={getStatusLabel}
                    getStatusColor={getStatusColor}
                    getMealTypeLabel={getMealTypeLabel}
                    formatAdDate={formatAdDate}
                    toPersianDigits={toPersianDigits}
                    onDelete={() => handleDeleteAd(ad.id)}
                    onEdit={handleEditAd}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function formatJalaaliDisplay(dateStr: string): string {
  const { jalaaliToDate, formatJalaaliDate: formatFn } = require("@/lib/jalaali")
  if (dateStr && dateStr.length >= 10) {
    try {
      const date = jalaaliToDate(dateStr)
      return formatFn(date)
    } catch {
      return dateStr
    }
  }
  return dateStr
}

interface AdCardProps {
  ad: CreatedAd
  getStatusLabel: (ad: CreatedAd) => string
  getStatusColor: (ad: CreatedAd) => string
  getMealTypeLabel: (type: string) => string
  formatAdDate: (isoDate: string) => string
  toPersianDigits: (str: string) => string
  onDelete: () => void
  onEdit: (adId: string, data: { foodName: string; price: number; description?: string }) => void
}

function AdCardCard({ 
  ad, 
  getStatusLabel, 
  getStatusColor, 
  getMealTypeLabel, 
  formatAdDate, 
  toPersianDigits,
  onDelete,
  onEdit
}: AdCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    foodName: ad.foodName,
    price: ad.price,
    description: ad.description || ""
  })

  const handleSaveEdit = async () => {
    await onEdit(ad.id, editForm)
    setIsEditing(false)
  }

  const expiresAt = new Date(ad.expiresAt)
  const isExpired = expiresAt < new Date()
  const isAvailable = ad.isAvailable && !ad.isSold && !isExpired

  return (
    <div className={`p-4 border rounded-md ${!isAvailable ? "bg-gray-50 opacity-70" : "bg-white"}`}>
      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">نام غذا</label>
            <input
              className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
              value={editForm.foodName}
              onChange={(e) => setEditForm({ ...editForm, foodName: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">قیمت (تومان)</label>
            <input
              type="number"
              className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
              value={editForm.price}
              onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">توضیحات</label>
            <textarea
              className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
              rows={2}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveEdit}>ذخیره</Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>انصراف</Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{ad.foodName}</h4>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">
                {getMealTypeLabel(ad.mealType)}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <span>قیمت: {toPersianDigits(ad.price.toLocaleString())} تومان</span>
            </div>
            <div className="text-xs text-gray-500">
              <div>تاریخ: {formatAdDate(ad.mealDate)}</div>
              <div className={`font-medium ${getStatusColor(ad)}`}>
                وضعیت: {getStatusLabel(ad)}
              </div>
              {isExpired && (
                <div className="text-red-500 font-medium">منقضی شده</div>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            {isAvailable && (
              <>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  ویرایش
                </Button>
                <Button size="sm" variant="destructive" onClick={onDelete}>
                  حذف
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}