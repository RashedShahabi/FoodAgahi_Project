import { Search, ShoppingCart, CheckCircle } from "lucide-react"

export default function HowItWorks() {
  return (
    <section className="py-20 bg-[#fffaf5]">
      <div className="max-w-6xl mx-auto px-4">

        <h2 className="text-3xl font-bold text-center mb-12">
          فودآگهی چطور کار می‌کند؟
        </h2>

        <div className="grid md:grid-cols-3 gap-10 text-center">

          <div className="space-y-4">
            <Search className="mx-auto text-orange-500 w-10 h-10"/>
            <h3 className="font-bold">جستجوی غذا</h3>
            <p className="text-gray-500 text-sm">
              غذای مورد نظر خود را در بین آگهی‌ها پیدا کنید
            </p>
          </div>

          <div className="space-y-4">
            <ShoppingCart className="mx-auto text-orange-500 w-10 h-10"/>
            <h3 className="font-bold">ثبت سفارش</h3>
            <p className="text-gray-500 text-sm">
              غذای دلخواه را انتخاب و سفارش دهید
            </p>
          </div>

          <div className="space-y-4">
            <CheckCircle className="mx-auto text-orange-500 w-10 h-10"/>
            <h3 className="font-bold">تحویل غذا</h3>
            <p className="text-gray-500 text-sm">
              غذا را دریافت کنید و لذت ببرید
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
