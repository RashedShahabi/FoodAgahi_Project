# راهنمای راه‌اندازی پروژه FoodAgahi

## ✅ کارهای انجام شده

### 1. نصب پیش‌نیازها
- ✅ Next.js 14
- ✅ Tailwind CSS
- ✅ Prisma
- ✅ shadcn/ui

### 2. پیکربندی فایل‌ها
- ✅ `.env` - متغیرهای محیطی
- ✅ `prisma/schema.prisma` - مدل دیتابیس
- ✅ `lib/prisma.ts` - کلاینت Prisma
- ✅ `tailwind.config.ts` - پیکربندی Tailwind با shadcn
- ✅ `components.json` - پیکربندی shadcn
- ✅ ساختار پوشه‌های app

### 3. تأیید Schema
- ✅ Schema مطابق با ۴ قانون ساده‌سازی
- ✅ سند تأیید در `SCHEMA_VALIDATION.md`

---

## ⚠️ مشکل فعلی: عدم دسترسی به اینترنت

دستورات Prisma نیاز به دانلود فایل‌های باینری دارند که به دلیل مشکل اتصال به اینترنت امکان‌پذیر نیست.

---

## 🔧 مراحل بعدی (پس از برقراری اتصال)

### مرحله 1: تولید Prisma Client
```bash
npx prisma generate
```

این دستور:
- Prisma Client را بر اساس schema تولید می‌کند
- فایل‌های TypeScript type-safe ایجاد می‌کند
- در پوشه `node_modules/.prisma/client` ذخیره می‌شود

### مرحله 2: اجرای Migration
```bash
npx prisma migrate dev --name init
```

این دستور:
- جداول دیتابیس را در PostgreSQL ایجاد می‌کند
- فایل migration در `prisma/migrations` ذخیره می‌شود
- Prisma Client را دوباره تولید می‌کند

### مرحله 3: بررسی دیتابیس (اختیاری)
```bash
npx prisma studio
```

این دستور:
- یک رابط گرافیکی برای مشاهده و ویرایش داده‌ها باز می‌کند
- در آدرس `http://localhost:5555` اجرا می‌شود

---

## 📋 چک‌لیست قبل از شروع توسعه

- [x] نصب dependencies
- [x] ایجاد `.env` با DATABASE_URL
- [x] طراحی schema.prisma
- [x] پیکربندی Tailwind
- [ ] اجرای `prisma generate` (نیاز به اینترنت)
- [ ] اجرای `prisma migrate dev` (نیاز به اینترنت)
- [ ] تست اتصال به دیتابیس

---

## 🚀 دستورات مفید

### Development
```bash
npm run dev          # اجرای سرور توسعه
npm run build        # ساخت نسخه production
npm run start        # اجرای نسخه production
```

### Prisma
```bash
npx prisma generate              # تولید Client
npx prisma migrate dev           # اجرای migration در dev
npx prisma migrate deploy        # اجرای migration در production
npx prisma studio                # باز کردن Prisma Studio
npx prisma db push               # همگام‌سازی سریع schema با DB (بدون migration)
npx prisma db seed               # اجرای seed data
```

### Prisma Reset (حذف و ساخت مجدد دیتابیس)
```bash
npx prisma migrate reset
```

---

## 🗂️ ساختار پروژه

```
foodagahi/
├── app/                      # Next.js App Router
│   ├── (auth)/              # صفحات احراز هویت
│   ├── ads/                 # مدیریت آگهی‌ها
│   ├── api/                 # API Routes
│   ├── dashboard/           # داشبورد کاربران
│   ├── orders/              # مدیریت سفارش‌ها
│   ├── profile/             # پروفایل کاربری
│   ├── wallet/              # کیف پول
│   ├── layout.tsx           # Layout اصلی
│   └── page.tsx             # صفحه اصلی
├── components/              # کامپوننت‌های React
│   ├── ui/                  # کامپوننت‌های shadcn
│   ├── auth/                # کامپوننت‌های احراز هویت
│   ├── ads/                 # کامپوننت‌های آگهی
│   └── dashboard/           # کامپوننت‌های داشبورد
├── lib/                     # توابع کمکی
│   ├── prisma.ts           # Prisma Client
│   └── utils.ts            # توابع عمومی
├── prisma/
│   └── schema.prisma       # مدل دیتابیس
├── .env                     # متغیرهای محیطی
└── tailwind.config.ts      # پیکربندی Tailwind
```

---

## 🎯 مراحل توسعه پیشنهادی

### فاز 1: احراز هویت
1. صفحه ثبت‌نام (با OTP)
2. صفحه ورود
3. مدیریت session
4. Middleware برای محافظت از روت‌ها

### فاز 2: پروفایل کاربری
1. مشاهده و ویرایش پروفایل
2. مدیریت شماره‌های دانشجویی
3. ثبت شماره شبا
4. تغییر رمز عبور

### فاز 3: آگهی‌های غذا (فروشنده)
1. ثبت آگهی جدید
2. لیست آگهی‌های من
3. ویرایش آگهی
4. حذف آگهی
5. مدیریت سفارش‌های دریافتی

### فاز 4: خرید غذا (خریدار)
1. لیست آگهی‌های موجود
2. فیلتر و جستجو
3. مشاهده جزئیات آگهی
4. ثبت سفارش
5. پرداخت آنلاین
6. تایید دریافت غذا

### فاز 5: کیف پول
1. مشاهده موجودی
2. شارژ کیف پول
3. تاریخچه تراکنش‌ها
4. درخواست برداشت وجه

### فاز 6: پنل مدیریت
1. مدیریت کاربران
2. مدیریت آگهی‌ها
3. بررسی گزارش‌ها
4. حل اختلافات
5. داشبورد آماری

### فاز 7: ویژگی‌های پیشرفته
1. نوتیفیکیشن‌ها (پیامک/اعلان)
2. سیستم اخطار
3. انقضای خودکار آگهی‌ها
4. Short-Polling برای آپدیت لیست‌ها

---

## 🔐 نکات امنیتی

1. **رمزنگاری رمز عبور**: استفاده از bcrypt
2. **احراز هویت**: JWT یا NextAuth.js
3. **اعتبارسنجی**: Zod برای validation
4. **محافظت از API**: Rate limiting
5. **HTTPS**: در production حتماً
6. **SQL Injection**: Prisma به صورت خودکار محافظت می‌کند

---

## 📱 نکات UI/UX

1. **RTL Support**: برای فارسی
2. **Responsive**: موبایل‌محور
3. **Loading States**: برای تجربه بهتر
4. **Error Handling**: پیام‌های خطای واضح
5. **Accessibility**: WCAG compliance

---

## 🐛 عیب‌یابی رایج

### مشکل: Prisma Client not found
**راه‌حل**: 
```bash
npx prisma generate
```

### مشکل: Database connection failed
**راه‌حل**: بررسی `DATABASE_URL` در `.env`

### مشکل: Migration failed
**راه‌حل**: 
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### مشکل: Type errors
**راه‌حل**: 
```bash
npm run build
```

---

## 📚 منابع مفید

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [TypeScript](https://www.typescriptlang.org/docs)

---

## 💡 نکته مهم

پس از برقراری اتصال به اینترنت، حتماً دستورات زیر را به ترتیب اجرا کنید:

```bash
# 1. تولید Prisma Client
npx prisma generate

# 2. اجرای Migration
npx prisma migrate dev --name init

# 3. شروع توسعه
npm run dev
```

موفق باشید! 🚀
