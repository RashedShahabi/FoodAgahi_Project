import Image from "next/image"

export default function Hero() {
  return (
    <section className="bg-cream container mx-auto  pb-20 px-4">
      {/* دو ستون اصلی */}
      <div className="grid md:grid-cols-2 gap-1 items-center">
         {/* 📝 متن سمت راست */}
        <div className="text-right space-y-5  md:pr-48 max-w-xl md:ml-auto ">
          <h1 className="text-5xl font-bold  text-orange-700 ">فودآگهی</h1>

          <p className="text-lg text-gray-700 ">
            سامانه خرید و فروش غذای دانشجویی
          </p>

          <p className="text-gray-500">
            به سامانه تبادل غذای دانشجویی خوش آمدید
          </p>

          <div className="flex gap-4 justify-end mt-6">
            <a
              href="/login"
              className="border px-6 py-3 rounded-lg hover:bg-gray-100 font-medium"
            >
              ورود به حساب کاربری
            </a>

            <a
              href="/register"
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 font-medium"
            >
              ثبت‌نام رایگان
            </a>
          </div>
        </div>
        {/* 🧍‍♀️ تصویر سمت چپ */}
        <div className="flex justify-center md:pl-48">
          <Image
            src="/images/hero-main.png"
            alt="دانشجویان در حال تبادل غذا"
            width={400}
            height={300}
            className="rounded-xl shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
          />
        </div>

       
      </div>

      {/* 🧩 کارت‌های زیر بخش Hero */}
      <div className="grid md:grid-cols-3 gap-3 mt-6 max-w-[960px] mx-auto">

        {/* کارت ۱ */}
        <div className="p-2 rounded-xl shadow bg-white text-center space-y-2 max-w-[740px] mx-auto transition-all duration-300 hover:scale-105 hover:shadow-lg ">
          <Image
            src="/images/icon-food.png"
            alt="خرید و فروش آسان"
            width={150}
            height={350}
            className="mx-auto transition-transform duration-300 hover:scale-110"
          />
          <h3 className="font-bold text-lg text-gray-800">
            خرید و فروش آسان
          </h3>
        </div>

        {/* کارت ۲ */}
        <div className="p-2 rounded-xl shadow bg-white text-center space-y-2 max-w-[740px]
         mx-auto transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <Image
            src="/images/icon-wallet.png"
            alt="کیف پول امن"
            width={150}
            height={350}
            className="mx-auto transition-transform duration-300 hover:scale-110"
          />
          <h3 className="font-bold text-lg text-gray-800">
            کیف پول امن
          </h3>
        </div>

        {/* کارت ۳ */}
        <div className="p-2 rounded-xl shadow bg-white text-center space-y-2 max-w-[740px]
         mx-auto transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <Image
            src="/images/icon-student.png"
            alt="ویژه دانشجویان"
            width={150}
            height={350}
            className="mx-auto transition-transform duration-300 hover:scale-110"
          />
          <h3 className="font-bold text-lg text-gray-800">
            ویژه دانشجویان
          </h3>
        </div>

      </div>
    </section>
  )
}
