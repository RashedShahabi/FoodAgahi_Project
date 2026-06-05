"use client"

import { useState } from "react"

export default function ReportButton({ adId, userId }: { adId: string, userId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(true)}
        className="text-red-600 text-sm"
      >
        گزارش تخلف
      </button>

      {open && (
        <form
          action="/actions/reportAd"
          method="post"
          className="mt-3 border p-3 rounded"
        >
          <input type="hidden" name="foodAdId" value={adId} />
          <input type="hidden" name="reporterId" value={userId} />

          <select name="reason" className="border p-2 w-full mb-2">
            <option value="fraud">کلاهبرداری</option>
            <option value="fake">آگهی جعلی</option>
            <option value="inappropriate">محتوای نامناسب</option>
          </select>

          <textarea
            name="description"
            placeholder="توضیح بیشتر"
            className="border p-2 w-full mb-2"
          />

          <button
            type="submit"
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            ارسال گزارش
          </button>
        </form>
      )}
    </div>
  )
}
