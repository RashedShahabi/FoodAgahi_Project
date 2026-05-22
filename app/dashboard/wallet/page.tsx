"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function WalletPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto" dir="rtl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" asChild>
          <Link href="/dashboard"><ArrowRight className="w-5 h-5 ml-2" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">کیف پول</h1>
      </div>

      <Card className="text-center py-10">
        <CardHeader>
          <CardTitle>موجودی حساب</CardTitle>
          <CardDescription className="text-lg mt-2">۰ تومان</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 mt-4">
            در حال حاضر تراکنشی برای نمایش وجود ندارد. موجودی کیف پول شما به زودی در این بخش نمایش داده خواهد شد.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
