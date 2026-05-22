// components/Header.tsx
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-cream border-b border-gray-100 shadow-sm">
      <nav className="flex items-center justify-between max-w-6xl mx-auto px-4 py-3">
        {/* لوگو/نام برند */}
      <Link href="/" className="flex items-center gap-2">
          <div className="relative w-12 h-12"> {/* یک کانتینر با سایز ثابت تعریف کن */}
            <Image
              src="/images/tray.png"
              alt="لوگو"
              fill // تصویر کل کانتینر را پر کند
              className="object-contain" // تصویر کشیده نشود و داخل کانتینر فیت شود
            />
          </div>
          <span className="font-bold text-2xl text-orange-500">فودآگهی</span>
      </Link>
        {/* منو */}
        <ul className="flex gap-6 text-base font-medium">
          <li>
            <Link href="/" className="hover:text-orange-500 transition">خانه</Link>
          </li>
          <li>
            <Link href="/about" className="hover:text-orange-500 transition">درباره ما</Link>
          </li>
        </ul>
        {/* اکشن ورود / ثبت‌نام */}
        <div className="flex gap-2 items-center">
          <Link
            href="/login"
            className="px-4 py-1.5 rounded-md border border-orange-400 text-orange-500 hover:bg-orange-50 transition font-semibold"
          >
            ورود
          </Link>
          <Link
            href="/signup"
            className="px-4 py-1.5 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition font-semibold"
          >
            ثبت‌نام
          </Link>
        </div>
      </nav>
    </header>
  );
}
