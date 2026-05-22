"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toJalaali, toGregorian } from "jalaali-js"
import { toPersianDigits } from "@/lib/jalaali"

// Days of the week in Persian
const WEEKDAYS_FA = ["ش", "ی", "د", "س", "چ", "پ", "ج"]

// Month names in Persian
const MONTH_NAMES_FA = [
  "فروردین", "اردیبهشت", "خرداد",
  "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر",
  "دی", "بهمن", "اسفند"
]

// Days in each Jalaali month (first 6 months have 31 days, next 5 have 30, last has 29/30)
function getDaysInMonth(jYear: number, jMonth: number): number {
  if (jMonth <= 6) return 31
  if (jMonth <= 11) return 30
  // Esfand - check for leap year
  return isJalaaliLeapYear(jYear) ? 30 : 29
}

function isJalaaliLeapYear(jYear: number): boolean {
  // Simplified leap year calculation
  const breakYears = [1, 5, 9, 13, 17, 22, 26, 30]
  const cycle = jYear % 2830
  const pos = breakYears.findIndex(b => cycle < b * 100 + 2830)
  if (pos === -1) return true
  return false
}

function getFirstDayOfWeek(jYear: number, jMonth: number): number {
  // Get the day of the week for the first day of the month
  // 0 = Saturday (first day of Jalaali week), 6 = Friday
  // Use a known reference date: 1403/01/01 = Monday (Gregorian 2024/03/20)
  // Monday in our 0=Saturday system is 2
  const gDate = new Date(2024, 2, 20) // March 20, 2024 = 1403/01/01 = Monday
  const jRef = toJalaali(gDate)
  const refDayOfWeek = 2 // Monday (0=Saturday, 1=Sunday, 2=Monday, ...)
  
  // Calculate total days from reference
  let totalDays = 0
  // Years
  for (let y = jRef.jy; y < jYear; y++) {
    totalDays += isJalaaliLeapYear(y) ? 366 : 365
  }
  // Months
  for (let m = 1; m < jMonth; m++) {
    totalDays += getDaysInMonth(jRef.jy + (jRef.jm > (m > 0 ? 0 : 0) ? 0 : 0), m)
  }
  
  // Simpler approach: use Date to calculate
  const firstOfMonth = jalaaliToGregorian(jYear, jMonth, 1)
  const date = new Date(firstOfMonth)
  // JavaScript: 0=Sunday, 1=Monday, ..., 6=Saturday
  // We want: 0=Saturday, 1=Sunday, ..., 6=Friday
  return (date.getDay() + 1) % 7
}

function jalaaliToGregorian(jYear: number, jMonth: number, jDay: number): Date {
  // Use toGregorian from jalaali-js which converts Jalaali to Gregorian
  const g = toGregorian(jYear, jMonth, jDay)
  return new Date(Date.UTC(g.gy, g.gm - 1, g.gd))
}

interface JalaliDatePickerProps {
  value: string // YYYY-MM-DD format (Jalaali)
  onChange: (value: string) => void
  minDate?: string
  maxDate?: string
}

function JalaliDatePicker({ value, onChange, minDate, maxDate }: JalaliDatePickerProps) {
  const today = getTodayJalaaliObj()
  const [viewYear, setViewYear] = useState(today.jy)
  const [viewMonth, setViewMonth] = useState(today.jm)
  const [viewDay, setViewDay] = useState(today.jd)
  const [picking, setPicking] = useState<"year" | "month" | "day" | null>(null)
  const [listStartYear, setListStartYear] = useState(today.jy - 10)
  const [hoveredDay, setHoveredDay] = useState<{ year: number; month: number; day: number } | null>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  function getTodayJalaaliObj(): { jy: number; jm: number; jd: number } {
    const j = toJalaali(new Date())
    return { jy: j.jy, jm: j.jm, jd: j.jd }
  }

  // Parse value
  const [selectedYear, selectedMonth, selectedDay] = value.split("-").map(Number) || [today.jy, today.jm, today.jd]

  // Reset to month view when year changes
  useEffect(() => {
    if (picking === "year") {
      setViewYear(selectedYear)
    }
  }, [selectedYear, picking])

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setPicking(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const goToPrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear(viewYear - 1)
      setViewMonth(12)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear(viewYear + 1)
      setViewMonth(1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const selectYear = (year: number) => {
    setViewYear(year)
    setPicking("month")
  }

  const selectMonth = (month: number) => {
    setViewMonth(month)
    setPicking("day")
  }

  const selectDay = (day: number) => {
    const year = viewYear
    const month = viewMonth
    const formatted = formatJalaaliInput(year, month, day)
    onChange(formatted)
    setPicking(null)
  }

  const goToToday = () => {
    const t = getTodayJalaaliObj()
    onChange(formatJalaaliInput(t.jy, t.jm, t.jd))
    setViewYear(t.jy)
    setViewMonth(t.jm)
    setPicking("day")
  }

  const formatJalaaliInput = (year: number, month: number, day: number): string => {
    const y = year.toString()
    const m = month.toString().padStart(2, "0")
    const d = day.toString().padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  const displayDay = hoveredDay 
    ? `${hoveredDay.day.toString().padStart(2, "0")}/${hoveredDay.month.toString().padStart(2, "0")}/${hoveredDay.year}`
    : selectedDay 
      ? `${selectedDay.toString().padStart(2, "0")}/${selectedMonth.toString().padStart(2, "0")}/${selectedYear}`
      : "--/--/----"

  const isDisabled = (year: number, month: number, day: number): boolean => {
    const dateStr = formatJalaaliInput(year, month, day)
    if (minDate && dateStr < minDate) return true
    if (maxDate && dateStr > maxDate) return true
    
    // Check if past date (not today)
    const t = getTodayJalaaliObj()
    if (year < t.jy || (year === t.jy && month < t.jm) || (year === t.jy && month === t.jm && day < t.jd)) {
      return true
    }
    
    return false
  }

  const isToday = (year: number, month: number, day: number): boolean => {
    const t = getTodayJalaaliObj()
    return year === t.jy && month === t.jm && day === t.jd
  }

  const isSelected = (year: number, month: number, day: number): boolean => {
    return year === selectedYear && month === selectedMonth && day === selectedDay
  }

  // Year list
  const years = []
  for (let y = listStartYear; y < listStartYear + 40; y++) {
    years.push(y)
  }

  return (
    <div ref={pickerRef} className="relative inline-block" dir="rtl">
      {/* Display Input */}
      <div 
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between gap-2"
        onClick={() => setPicking(picking === "day" ? null : "day")}
      >
        <span className="text-gray-500">📅</span>
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value ? (
            <span className="ltr:inline-font" style={{ fontFamily: "monospace", direction: "ltr" }}>
              {displayDay}
            </span>
          ) : (
            "تاریخ را انتخاب کنید"
          )}
        </span>
      </div>

      {/* Picker Popup */}
      {picking && (
        <div 
          className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3 min-w-[300px]"
          dir="rtl"
          style={{ minWidth: 320, maxWidth: 360 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Year Selection View */}
          {picking === "year" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <button 
                  onClick={() => setListStartYear(listStartYear - 20)}
                  className="px-2 py-1 text-sm hover:bg-gray-100 rounded"
                >
                  →
                </button>
                <span className="text-sm font-medium">انتخاب سال</span>
                <button 
                  onClick={() => setListStartYear(listStartYear + 20)}
                  className="px-2 py-1 text-sm hover:bg-gray-100 rounded"
                >
                  ←
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1 max-h-[240px] overflow-y-auto">
                {years.map(year => (
                  <button
                    key={year}
                    onClick={() => selectYear(year)}
                    className={`px-2 py-1.5 text-sm rounded ${
                      year === viewYear 
                        ? "bg-blue-600 text-white" 
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {toPersianDigits(year.toString())}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setPicking(null)}
                className="w-full px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded mt-2"
              >
                انصراف
              </button>
            </div>
          )}

          {/* Month Selection View */}
          {picking === "month" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <button 
                  onClick={() => setViewYear(viewYear - 1)}
                  className="px-2 py-1 text-sm hover:bg-gray-100 rounded"
                >
                  →
                </button>
                <span className="text-sm font-medium">{toPersianDigits(viewYear.toString())}</span>
                <button 
                  onClick={() => setViewYear(viewYear + 1)}
                  className="px-2 py-1 text-sm hover:bg-gray-100 rounded"
                >
                  ←
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {MONTH_NAMES_FA.map((name, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => selectMonth(idx + 1)}
                    className={`px-2 py-2 text-sm rounded ${
                      idx + 1 === viewMonth 
                        ? "bg-blue-600 text-white" 
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {toPersianDigits(name)}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setPicking("year")}
                className="w-full px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded mt-2"
              >
                ← بازگشت به سال
              </button>
            </div>
          )}

          {/* Day Selection View (Calendar) */}
          {picking === "day" && (
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <button 
                  onClick={goToNextMonth}
                  className="p-1 hover:bg-gray-100 rounded text-sm"
                  title="ماه بعد"
                >
                  →
                </button>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setPicking("month")}
                    className="px-2 py-0.5 text-sm hover:bg-gray-100 rounded"
                  >
                    {toPersianDigits(MONTH_NAMES_FA[viewMonth - 1])}
                  </button>
                  <button 
                    onClick={() => setPicking("year")}
                    className="px-2 py-0.5 text-sm hover:bg-gray-100 rounded"
                    style={{ marginLeft: 'auto' }}
                  >
                    {toPersianDigits(viewYear.toString())}
                  </button>
                </div>
                <button 
                  onClick={goToPrevMonth}
                  className="p-1 hover:bg-gray-100 rounded text-sm"
                  title="ماه قبل"
                >
                  ←
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-0 mb-1">
                {WEEKDAYS_FA.map((d, i) => (
                  <div key={i} className="text-center text-xs text-gray-500 py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-0">
                {(() => {
                  const days = []
                  const firstDay = getFirstDayOfWeek(viewYear, viewMonth)
                  const daysInMonth = getDaysInMonth(viewYear, viewMonth)

                  // Empty cells before first day
                  for (let i = 0; i < firstDay; i++) {
                    days.push(<div key={`empty-${i}`} className="h-9 w-9" />)
                  }

                  // Day cells
                  for (let d = 1; d <= daysInMonth; d++) {
                    const disabled = isDisabled(viewYear, viewMonth, d)
                    const todayCell = isToday(viewYear, viewMonth, d)
                    const selected = isSelected(viewYear, viewMonth, d)
                    const hover = hoveredDay?.year === viewYear && 
                                 hoveredDay?.month === viewMonth && 
                                 hoveredDay?.day === d

                    days.push(
                      <button
                        key={d}
                        disabled={disabled}
                        onMouseEnter={() => !disabled && setHoveredDay({ year: viewYear, month: viewMonth, day: d })}
                        onMouseLeave={() => setHoveredDay(null)}
                        onClick={() => selectDay(d)}
                        className={`h-9 w-9 flex items-center justify-center text-sm rounded-full transition-colors ${
                          disabled
                            ? "text-gray-300 cursor-not-allowed"
                            : selected
                              ? "bg-blue-600 text-white font-bold"
                              : hover
                                ? "bg-blue-100 text-blue-700"
                                : "hover:bg-gray-100"
                        } ${todayCell && !selected ? "border border-blue-500" : ""}`}
                      >
                        {toPersianDigits(d.toString())}
                      </button>
                    )
                  }

                  return days
                })()}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t">
                <button 
                  onClick={goToToday}
                  className="px-2 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"
                >
                  امروز
                </button>
                <button 
                  onClick={() => setPicking(null)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  بستن
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export { JalaliDatePicker }
export default JalaliDatePicker