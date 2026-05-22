import Image from "next/image"
import Header from "@/components/Header"
import { Users, UtensilsCrossed, ShieldCheck, Sparkles, MapPin, HeartHandshake } from "lucide-react"

const features = [
  {
    icon: UtensilsCrossed,
    title: "تبادل غذای دانشجویی",
    description:
      "فودآگهی بستری برای پیدا کردن غذای  خوش‌قیمت در محیط دانشگاه و اطراف آن است.",
  },
  {
    icon: Users,
    title: "اتصال فروشنده و خریدار",
    description:
      "دانشجوها می‌توانند به‌سادگی آگهی ثبت کنند و با خریداران واقعی ارتباط بگیرند.",
  },
  {
    icon: ShieldCheck,
    title: "اعتماد و شفافیت",
    description:
      "با ساختار سفارش، پیگیری و تعامل شفاف، تلاش می‌کنیم تجربه‌ای مطمئن و قابل اعتماد برای کاربران ایجاد کنیم.",
  },
]

const stats = [
  { value: "ساده", label: "تجربه کاربری سریع و روان" },
  { value: "امن", label: "مدیریت بهتر حساب و سفارش‌ها" },
  { value: "به‌صرفه", label: "مناسب برای دانشجو و خوابگاه" },
]

const values = [
  {
    icon: Sparkles,
    title: "سادگی",
    description:
      "تمام بخش‌های فودآگهی طوری طراحی شده‌اند که کاربر بدون سردرگمی بتواند ثبت‌نام کند، آگهی بگذارد یا سفارش ثبت کند.",
  },
  {
    icon: HeartHandshake,
    title: "همدلی با نیاز دانشجو",
    description:
      "ما روی نیازهای واقعی دانشجوها تمرکز کرده‌ایم؛ از قیمت مناسب گرفته تا دسترسی سریع و تجربه‌ای بدون پیچیدگی.",
  },
  {
    icon: MapPin,
    title: "مناسب برای محیط محلی",
    description:
      "تمرکز فودآگهی بر ارتباط محلی و سریع بین فروشنده و خریدار است؛ جایی که نزدیکی، زمان و اعتماد اهمیت زیادی دارد.",
  },
]

export default function AboutPage() {
  return (
    <>
      <Header />

      <main className="bg-cream pt-24" dir="rtl">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              {/* Text */}
              <div className="order-2 lg:order-1 text-center lg:text-right">
                <span className="inline-flex items-center rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700">
                  درباره فودآگهی
                </span>

                <h1 className="mt-5 text-4xl leading-[1.8] font-extrabold text-gray-900 sm:text-5xl">
                  دسترسی به 
                  <span className="text-orange-600"> غذای ارزان  </span>
                  و جلوگیری از 
                  <span className="text-orange-600">  هدر رفت غذا</span>
                </h1>

                <p className="mt-6 text-base leading-8 text-gray-600 sm:text-lg">
                  فودآگهی یک پلتفرم برای جست‌وجو و سفارش غذای دانشجویی است.
                  هدف ما  پیدا کردن غذای مناسب، خوش‌قیمت و در دسترس  برای
                دانشجوهاست.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a
                    href="/"
                    className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-6 py-3 text-white font-bold shadow-md transition hover:bg-orange-600"
                  >
                    بازگشت به خانه
                  </a>
                  <a
                    href="/register"
                    className="inline-flex items-center justify-center rounded-2xl border border-orange-200 bg-white px-6 py-3 font-bold text-orange-600 transition hover:bg-orange-50"
                  >
                    شروع رایگان
                  </a>
                </div>
              </div>

              {/* Image */}
              <div className="order-1 lg:order-2">
                <div className="relative mx-auto w-full max-w-xl">
                  <div className="absolute -inset-4 rounded-[2rem] bg-orange-100/60 blur-2xl" />
                  <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-black/5">
                    <Image
                      src="/images/hero-main2.png"
                      alt="درباره فودآگهی"
                      width={1200}
                      height={900}
                      className="h-auto w-full object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Intro Card */}
        <section className="pb-6 md:pb-10">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-gray-100 sm:p-8 md:p-10">
              <div className="grid gap-6 md:grid-cols-3">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-orange-50 px-5 py-6 text-center"
                  >
                    <div className="text-2xl font-extrabold text-orange-600">
                      {item.value}
                    </div>
                    <div className="mt-2 text-sm leading-7 text-gray-600">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                چرا فودآگهی؟
              </h2>
              <p className="mt-4 text-base leading-8 text-gray-600">
                ما سعی کرده‌ایم بستری بسازیم که هم برای خریدار راحت باشد، هم برای فروشنده
                ساده و کاربردی. نتیجه، یک تجربه سریع، شفاف و مناسب فضای دانشجویی است.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div
                    key={feature.title}
                    className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-8 text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Story / Mission */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-3xl bg-white p-7 shadow-md ring-1 ring-gray-100 md:p-10">
                <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
                  ماموریت ما
                </h2>
                <p className="mt-5 text-base leading-8 text-gray-600">
                  ماموریت فودآگهی این است که فرآیند خرید و فروش دانشجویی را
                  به تجربه‌ای آسان، سریع و قابل اعتماد تبدیل کند. ما باور داریم که یک
                  پلتفرم خوب باید هم برای فروشنده فرصت ایجاد کند و هم برای خریدار انتخاب
                  بهتر و دسترسی سریع‌تر فراهم کند.
                </p>
                <p className="mt-4 text-base leading-8 text-gray-600">
                  از ثبت‌نام و احراز هویت گرفته تا ثبت آگهی، جست‌وجو، سفارش و پیگیری،
                  همه‌چیز باید شفاف، روان و بدون پیچیدگی باشد.
                </p>
              </div>

              <div className="rounded-3xl bg-orange-50 p-7 ring-1 ring-orange-100 md:p-10">
                <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
                  چشم‌انداز ما
                </h2>
                <p className="mt-5 text-base leading-8 text-gray-700">
                  ما می‌خواهیم فودآگهی به مرجع اصلی خرید و فروش غذای دانشجویی تبدیل
                  شود؛ جایی که هر کاربر بتواند با چند کلیک ساده، غذای موردنیازش را پیدا
                  کند .
                </p>
                <p className="mt-4 text-base leading-8 text-gray-700">
                  هدف نهایی ما ساختن اکوسیستمی قابل اعتماد، کاربردی و مقیاس‌پذیر برای
                  ارتباط بهتر بین عرضه‌کننده و مصرف‌کننده غذا است.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] bg-white p-6 shadow-lg ring-1 ring-gray-100 md:p-10">
              <div className="max-w-3xl">
                <h2 className="text-3xl font-extrabold text-gray-900">
                  ارزش‌هایی که با آن‌ها جلو می‌رویم
                </h2>
                <p className="mt-4 text-base leading-8 text-gray-600">
                  فودآگهی فقط یک صفحه ثبت آگهی نیست؛ ما روی تجربه‌ای کار می‌کنیم که برای
                  کاربر فارسی‌زبان دانشجو  مفید باشد.
                </p>
              </div>

              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {values.map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.title}
                      className="rounded-3xl border border-gray-100 bg-gray-50 p-6"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 text-lg font-extrabold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-8 text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 md:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[2rem] bg-gradient-to-l from-orange-500 to-orange-400 px-6 py-10 text-white shadow-xl md:px-10 md:py-14">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl font-extrabold sm:text-4xl">
                  آماده‌ای وارد فودآگهی شوی؟
                </h2>
                <p className="mt-4 text-base leading-8 text-orange-50">
                  چه خریدار باشی، چه فروشنده، فودآگهی کمک می‌کند سریع‌تر، راحت‌تر و
                  مطمئن‌تر به هدفت برسی.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="/register"
                    className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl bg-white px-6 py-3 font-bold text-orange-600 transition hover:bg-orange-50"
                  >
                    ثبت‌نام رایگان
                  </a>
                  <a
                    href="/login"
                    className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl border border-white/40 px-6 py-3 font-bold text-white transition hover:bg-white/10"
                  >
                    ورود به حساب
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
