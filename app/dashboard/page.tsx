"use client";

import { useState, useEffect } from "react";
import { getProfileCompletion } from "./actions/profile"; // مسیر فایل اکشن شما
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    async function loadCompletion() {
      try {
        const percentage = await getProfileCompletion();
        setProfileCompletion(percentage);
      } catch (error) {
        console.error("خطا در دریافت درصد پروفایل:", error);
      }
    }
    loadCompletion();
  }, []);

  return (
    <div className="space-y-8 p-6" dir="rtl">
      {/* هدر خوش‌آمدگویی */}
      <header>
        <h1 className="text-3xl font-bold">سلام، خوش آمدید</h1>
        <p className="text-gray-600">به پنل مدیریت فوداگاهی خوش آمدید.</p>
      </header>

      {/* نوار پیشرفت پروفایل */}
      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="flex justify-between mb-2">
            <span className="font-medium text-sm">تکمیل پروفایل کاربری</span>
            <span className="text-orange-600 font-bold">{profileCompletion}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div 
              className="bg-orange-500 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* شبکه کارت‌ها */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ۱. تکمیل پروفایل */}
        <Card>
          <CardHeader>
            <CardTitle>تکمیل پروفایل کاربری</CardTitle>
            <CardDescription>اطلاعاتت رو با دقت ثبت کن</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
              <Link href="/dashboard/profile">پروفایل</Link>
            </Button>
          </CardContent>
        </Card>

        {/* ۲. ثبت آگهی جدید */}
        <Card>
          <CardHeader>
            <CardTitle>ثبت آگهی جدید</CardTitle>
            <CardDescription>ثبت غذای جدید برای فروش</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
              <Link href="/dashboard/seller/new">ثبت آگهی</Link>
            </Button>
          </CardContent>
        </Card>

        {/* ۳. سفارش‌های من */}
        <Card>
          <CardHeader>
            <CardTitle>سفارش‌های من</CardTitle>
            <CardDescription>نمایش آگهی‌ها و خریدهای انجام شده</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
              <Link href="/dashboard/seller/my-ads">مشاهده سفارش‌ها</Link>
            </Button>
          </CardContent>
        </Card>

        {/* ۴. کیف پول */}
        <Card>
          <CardHeader>
            <CardTitle>کیف پول</CardTitle>
            <CardDescription>مدیریت موجودی و تراکنش‌ها</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
              <Link href="/dashboard/wallet">مشاهده کیف پول</Link>
            </Button>
          </CardContent>
        </Card>

        {/* ۵. مشاهده آگهی‌ها */}
        <Card>
          <CardHeader>
            <CardTitle>مشاهده آگهی ها</CardTitle>
            <CardDescription>مدیریت آگهی‌های ثبت شده شما</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
              <Link href="/dashboard/buyer">دیدن لیست آگهی های موجود</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
