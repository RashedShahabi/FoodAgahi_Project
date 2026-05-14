import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      <div className="max-w-2xl mx-auto p-8 text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">
            فودآگهی
          </h1>
          <p className="text-xl text-gray-600">
            سیستم خرید و فروش غذای دانشگاهی
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <p className="text-gray-700">
            به سیستم فوداگاهی خوش آمدید. این پلتفرم برای خرید و فروش غذای دانشگاهی طراحی شده است.
          </p>

          <div className="flex gap-4 justify-center">
            <a
              href="/register"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              ثبت نام
            </a>
            <a
              href="/login"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              ورود
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-3xl mb-2">🍽️</div>
            <h3 className="font-bold mb-2">خرید و فروش آسان</h3>
            <p className="text-sm text-gray-600">
              غذای دانشگاهی خود را به راحتی بفروشید یا بخرید
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-bold mb-2">کیف پول امن</h3>
            <p className="text-sm text-gray-600">
              مدیریت آسان موجودی و تراکنش‌های مالی
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-3xl mb-2">🎓</div>
            <h3 className="font-bold mb-2">ویژه دانشجویان</h3>
            <p className="text-sm text-gray-600">
              طراحی شده برای نیازهای دانشجویان
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
