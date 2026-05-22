/**
 * Jalaali (Jalali/Khoremshi) Date Utility Functions
 * Uses jalaali-js library for conversion
 */

import { toJalaali, toGregorian } from "jalaali-js";

/**
 * Convert a Date object to Jalaali (Shamsi) date string
 * @param date - The Date object to convert
 * @returns Jalaali date string in format "YYYY-MM-DD"
 */
export function toJalaaliDate(date: Date): string {
  const jDate = toJalaali(date);
  const year = jDate.jy;
  const month = jDate.jm.toString().padStart(2, "0");
  const day = jDate.jd.toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date in Jalaali format
 * @returns Today's Jalaali date string in format "YYYY-MM-DD"
 */
export function getTodayJalaaliDate(): string {
  return toJalaaliDate(new Date());
}

/**
 * Convert a Date object to formatted Jalaali string with Persian locale
 * @param date - The Date object to format
 * @returns Formatted Jalaali date string like "۱۴۰۵/۰۴/۲۳"
 */
export function formatJalaaliDate(date: Date): string {
  const jDate = toJalaali(date);
  const year = toPersianDigits(jDate.jy.toString());
  const month = toPersianDigits(jDate.jm.toString().padStart(2, "0"));
  const day = toPersianDigits(jDate.jd.toString().padStart(2, "0"));
  return `${year}/${month}/${day}`;
}

/**
 * Convert English digits to Persian digits
 * @param str - The string to convert
 * @returns String with Persian digits
 */
export function toPersianDigits(str: string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return str.replace(/[0-9]/g, (w) => persianDigits[+w]);
}

/**
 * Convert Jalaali date string (YYYY-MM-DD) to Date object
 * @param jalaaliDateStr - Jalaali date string in format "YYYY-MM-DD"
 * @returns Date object (start of day UTC)
 */
export function jalaaliToDate(jalaaliDateStr: string): Date {
  const [year, month, day] = jalaaliDateStr.split("-").map(Number);
  // Convert Jalaali to Gregorian
  const gregorian = toGregorian(year, month, day);
  // Create Date object at start of day (UTC)
  return new Date(Date.UTC(gregorian.gy, gregorian.gm - 1, gregorian.gd));
}

/**
 * Get the current time in Iran timezone (UTC+3:30)
 * @returns Current date and time in Iran timezone
 */
export function getIranTime(): Date {
  // Iran is UTC+3:30
  const utcNow = new Date();
  const iranOffset = 3.5 * 60 * 60 * 1000; // 3.5 hours in milliseconds
  return new Date(utcNow.getTime() + iranOffset);
}

/**
 * Check if the given date is today (in Iran timezone)
 * @param dateStr - Date string to check (YYYY-MM-DD format)
 * @returns true if the date is today
 */
export function isToday(dateStr: string): boolean {
  const today = getTodayJalaaliDate();
  return today === dateStr;
}

/**
 * Get meal type specific time restrictions
 * @param mealType - "LUNCH" or "DINNER"
 * @returns Object with limitHour, limitMinute, and error message
 */
export function getMealTimeRestriction(mealType: "LUNCH" | "DINNER") {
  if (mealType === "LUNCH") {
    return {
      limitHour: 13,
      limitMinute: 30,
      expiryHour: 14,
      expiryMinute: 0,
      errorMsg: "زمان ثبت آگهی ناهار تمام شده است (آخرین مهلت ۱۳:۳۰)",
    };
  } else {
    return {
      limitHour: 18,
      limitMinute: 30,
      expiryHour: 19,
      expiryMinute: 0,
      errorMsg: "زمان ثبت آگهی شام تمام شده است (آخرین مهلت ۱۸:۳۰)",
    };
  }
}

/**
 * Check if an ad can be registered based on current time
 * @param mealType - "LUNCH" or "DINNER"
 * @param mealDate - The date of the meal in "YYYY-MM-DD" Jalaali format
 * @returns Object with canRegister boolean and error message if applicable
 */
export function canRegisterAd(mealType: "LUNCH" | "DINNER", mealDate: string): { canRegister: boolean; error?: string } {
  const iranTime = getIranTime();
  const jToday = getTodayJalaaliDate();
  
  // Check if it's the same day (today in Jalaali)
  if (mealDate === jToday) {
    // It's today - check time restriction
    const restriction = getMealTimeRestriction(mealType);
    const currentMinutes = iranTime.getHours() * 60 + iranTime.getMinutes();
    const limitMinutes = restriction.limitHour * 60 + restriction.limitMinute;
    
    if (currentMinutes > limitMinutes) {
      return {
        canRegister: false,
        error: restriction.errorMsg,
      };
    }
  }
  
  return { canRegister: true };
}

/**
 * Calculate expiry time for an ad
 * @param mealType - "LUNCH" or "DINNER"
 * @param mealDate - The date of the meal in "YYYY-MM-DD" Jalaali format
 * @returns Date object for when the ad should expire
 */
export function calculateExpiryTime(mealType: "LUNCH" | "DINNER", mealDate: string): Date {
  const restriction = getMealTimeRestriction(mealType);
  const mealDateObj = jalaaliToDate(mealDate);
  
  const expiry = new Date(mealDateObj);
  expiry.setUTCHours(restriction.expiryHour, restriction.expiryMinute, 0, 0);
  
  return expiry;
}

/**
 * Check if order can be placed (not within 15 minutes of ad expiry)
 * @param expiresAt - The expiry time of the ad
 * @returns true if order can be placed
 */
export function canPlaceOrder(expiresAt: Date): boolean {
  const now = new Date();
  const fifteenMinutesMs = 15 * 60 * 1000;
  
  if (expiresAt.getTime() - now.getTime() <= fifteenMinutesMs) {
    return false;
  }
  
  return true;
}