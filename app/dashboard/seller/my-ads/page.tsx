"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MyAd {
  id: string
  foodName: string
  price: number
  description?: string
  imageUrl?: string
  mealType: "LUNCH" | "DINNER"
  mealDate: string
  isAvailable: boolean
  isSold: boolean
  expiresAt: string
  createdAt: string
  updatedAt: string
  hasActiveOrders: boolean
  canEditDelete: boolean
  orders: {
    id: string
    status: string
    buyerStudentId: string
    transferScreenshot?: string
  }[]
}

export default function MyAdsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [ads, setAds] = useState<MyAd[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)
  const [editingAd, setEditingAd] = useState<MyAd | null>(null)
  const [editForm, setEditForm] = useState({ foodName: "", price: 0, description: "" })
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchAds = useCallback(async () => {
    try {
      const response = await fetch("/api/ads/my-ads")
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
  }, [])

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

  const handleDelete = async () => {
    if (!deleteDialog) return
    setDeleting(true)
    try {
      const response = await fetch(`/api/ads/${deleteDialog}`, {
        method: "DELETE",
      })
      const result = await response.json()
      if (response.ok) {
        setSuccess("آگهی با موفقیت حذف شد")
        fetchAds()
      } else {
        setError(result.error || "خطا در حذف آگهی")
      }
    } catch (err) {
      setError("خطا در اتصال به سرور")
    } finally {
      setDeleting(false)
      setDeleteDialog(null)
    }
  }

  const handleEdit = (ad: MyAd) => {
    setEditingAd(ad)
    setEditForm({ foodName: ad.foodName, price: ad.price, description: ad.description || "" })
  }

  const handleUpdate = async () => {
    if (!editingAd) return
    setUpdating(true)
    try {
      const response = await fetch(`/api/ads/${editingAd.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      const result = await response.json()
      if (response.ok) {
        setSuccess("آگهی با موفقیت ویرایش شد")
        setEditingAd(null)
        fetchAds()
      } else {
        setError(result.error || "خطا در ویرایش آگهی")
      }
    } catch (err) {
      setError("خطا در اتصال به سرور")
    } finally {
      setUpdating(false)
    }
  }

  const getMealTypeLabel = (type: string) => type === "LUNCH" ? "ناهار" : "شام"
  const formatPrice = (price: number) => price.toLocaleString()

  // وضعیت آگهی بر اساس سفارشات
  const getAdStatus = (ad: MyAd): { label: string; color: string; hasOrder: boolean } => {
    if (!ad.isAvailable) return { label: "حذف شده", color: "text-gray-500", hasOrder: false }
    
    const expiresAt = new Date(ad.expiresAt)
    if (expiresAt < new Date()) return { label: "منقضی شده", color: "text-red-500", hasOrder: false }
    
    if (ad.isSold) return { label: "فروخته شده", color: "text-blue-600", hasOrder: false }
    
    // بررسی سفارشات فعال
    const pendingOrder = ad.orders.find(o => o.status === "PENDING")
    const confirmedOrder = ad.orders.find(o => o.status === "CONFIRMED")
    
    if (confirmedOrder) {
      return { label: "در انتظار انتقال", color: "text-amber-600", hasOrder: true }
    }
    if (pendingOrder) {
      return { label: "در انتظار تایید فروشنده", color: "text-blue-600", hasOrder: true }
    }
    
    return { label: "خریداری نشده", color: "text-green-600", hasOrder: false }
  }

  // تایید انتقال برای آگهی
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; adId: string; order: { id: string; buyerStudentId: string } | null }>({ 
    open: false, 
    adId: "", 
    order: null 
  })
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false)
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">آگهی‌های من</h1>
            <p className="text-gray-600 mt-2">مدیریت آگهی‌های فروش غذای شما</p>
          </div>
          <Button onClick={() => router.push("/dashboard/seller/ads/new")}>
            ثبت آگهی جدید
          </Button>
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

        {ads.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">هنوز آگهی ثبت نکرده‌اید</p>
              <Button onClick={() => router.push("/dashboard/seller/ads/new")} className="mt-4">
                اولین آگهی را ثبت کنید
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ads.map((ad) => {
              const status = getAdStatus(ad)
              const pendingOrder = ad.orders.find(o => o.status === "PENDING")
              const confirmedOrder = ad.orders.find(o => o.status === "CONFIRMED")
              
              return (
                <Card key={ad.id} className={ad.isAvailable ? "" : "opacity-60"}>
                  <CardHeader>
                    <CardTitle className="text-lg">{ad.foodName}</CardTitle>
                    <CardDescription>
                      {getMealTypeLabel(ad.mealType)} • {formatPrice(ad.price)} تومان
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className={`font-medium ${status.color}`}>
                        وضعیت: {status.label}
                      </div>
                      <div>تاریخ: {new Date(ad.mealDate).toLocaleDateString("fa-IR")}</div>
                      
                      {/* نمایش شماره دانشجویی خریدار در صورت تایید */}
                      {confirmedOrder && confirmedOrder.buyerStudentId && (
                        <div className="text-blue-600 text-xs mt-1">
                          شماره دانشجویی خریدار: {confirmedOrder.buyerStudentId}
                        </div>
                      )}
                      
                      {/* اسکرین شات تایید انتقال */}
                      {confirmedOrder?.transferScreenshot && (
                        <div className="mt-2">
                          <img 
                            src={confirmedOrder.transferScreenshot} 
                            alt="تایید انتقال" 
                            className="max-w-full h-32 object-cover rounded border"
                          />
                        </div>
                      )}
                    </div>

                    {/* دکمه‌ها بر اساس وضعیت */}
                    <div className="flex flex-wrap gap-2">
                      {ad.canEditDelete && !status.hasOrder && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(ad)}>
                            ویرایش
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setDeleteDialog(ad.id)}>
                            حذف
                          </Button>
                        </>
                      )}
                      
                      {/* دکمه تایید انتقال - فقط برای وضعیت "در انتظار انتقال" */}
                      {confirmedOrder && ad.canEditDelete && (
                        <Dialog 
                          open={confirmDialog.open && confirmDialog.adId === ad.id} 
                          onOpenChange={(open) => setConfirmDialog({ open, adId: ad.id, order: open ? confirmedOrder : null })}
                        >
                          <DialogTrigger asChild>
                            <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700">
                              تایید انتقال
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>تایید انتقال غذا در سامانه دانشگاه</DialogTitle>
                              <DialogDescription>
                                لطفاً شماره دانشجویی خریدار را در سامانه دانشگاه وارد کرده و ثبت نام کنید.
                                سپس اسکرین‌شات تایید را آپلود کنید.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>شماره دانشجویی خریدار</Label>
                                <div className="mt-1 p-2 bg-gray-100 rounded text-sm">
                                  {confirmedOrder.buyerStudentId}
                                </div>
                              </div>
                              <div>
                                <Label>آپلود اسکرین‌شات تایید</Label>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  className="mt-1"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      setUploadingScreenshot(true)
                                      try {
                                        const formData = new FormData()
                                        formData.append("file", file)
                                        
                                        const uploadResponse = await fetch("/api/upload", {
                                          method: "POST",
                                          body: formData,
                                        })
                                        
                                        if (uploadResponse.ok) {
                                          const uploadResult = await uploadResponse.json()
                                          setScreenshotUrl(uploadResult.url)
                                        }
                                      } catch (err) {
                                        console.error("Upload error:", err)
                                      } finally {
                                        setUploadingScreenshot(false)
                                      }
                                    }
                                  }}
                                  disabled={uploadingScreenshot}
                                />
                                {uploadingScreenshot && (
                                  <p className="text-xs text-gray-500 mt-1">در حال آپلود...</p>
                                )}
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setConfirmDialog({ open: false, adId: "", order: null })
                                  setScreenshotUrl(null)
                                }}
                              >
                                انصراف
                              </Button>
                              <Button 
                                onClick={async () => {
                                  if (!screenshotUrl) {
                                    setError("لطفاً ابتدا اسکرین‌شات را آپلود کنید")
                                    return
                                  }
                                  try {
                                    const response = await fetch(`/api/ads/${ad.id}/confirm-transfer`, {
                                      method: "PUT",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ 
                                        orderId: confirmedOrder.id,
                                        screenshotUrl 
                                      }),
                                    })
                                    
                                    if (response.ok) {
                                      setSuccess("انتقال با موفقیت تایید شد")
                                      setConfirmDialog({ open: false, adId: "", order: null })
                                      setScreenshotUrl(null)
                                      fetchAds()
                                    } else {
                                      const result = await response.json()
                                      setError(result.error || "خطا در تایید انتقال")
                                    }
                                  } catch (err) {
                                    setError("خطا در اتصال به سرور")
                                  }
                                }}
                                disabled={uploadingScreenshot || !screenshotUrl}
                              >
                                تایید نهایی
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Dialog حذف */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف آگهی</DialogTitle>
            <DialogDescription>آیا از حذف این آگهی اطمینان دارید؟ این عمل غیرقابل بازگشت است.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>انصراف</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog ویرایش */}
      <Dialog open={!!editingAd} onOpenChange={() => setEditingAd(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ویرایش آگهی</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">نام غذا</label>
              <input
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={editForm.foodName}
                onChange={(e) => setEditForm({ ...editForm, foodName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">قیمت (تومان)</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">توضیحات</label>
              <textarea
                className="w-full mt-1 px-3 py-2 border rounded-md"
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAd(null)}>انصراف</Button>
            <Button onClick={handleUpdate} disabled={updating}>ذخیره تغییرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}