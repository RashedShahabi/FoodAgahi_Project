"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

type FAQItemProps = {
  question: string
  answer: string
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border rounded-xl p-5 bg-white shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full text-right"
      >
        <span className="font-semibold text-gray-800">
          {question}
        </span>

        <ChevronDown
          className={`transition-transform duration-300 ${
            open ? "rotate-180 text-orange-500" : ""
          }`}
        />
      </button>

      {open && (
        <p className="mt-4 text-gray-600 text-sm leading-7">
          {answer}
        </p>
      )}
    </div>
  )
}

export default function FAQ() {
  return (
    <section className="py-20 bg-[#fffaf5]">
      <div className="max-w-4xl mx-auto px-4">

        <h2 className="text-3xl font-bold text-center mb-10">
          سوالات متداول
        </h2>

        <div className="space-y-4">

          <FAQItem
            question="چطور می‌توانم غذا سفارش دهم؟"
            answer="بعد از ورود به حساب کاربری، آگهی غذای مورد نظر را انتخاب کرده و سفارش خود را ثبت کنید."
          />

          <FAQItem
            question="پرداخت چگونه انجام می‌شود؟"
            answer="پرداخت از طریق کیف پول داخل سامانه یا درگاه پرداخت بانکی انجام می‌شود."
          />

          <FAQItem
            question="چطور می‌توانم غذای خودم را بفروشم؟"
            answer="بعد از ثبت‌نام، می‌توانید یک آگهی غذا ایجاد کنید و سفارش‌ها را دریافت کنید."
          />

          <FAQItem
            question="آیا این سامانه فقط مخصوص دانشجویان است؟"
            answer="بله، این سامانه برای تبادل غذای دانشجویی بین دانشجویان طراحی شده است."
          />

        </div>

      </div>
    </section>
  )
}
