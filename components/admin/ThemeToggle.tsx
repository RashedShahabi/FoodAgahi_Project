"use client";

import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {

  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  function toggleTheme() {

    if (dark) {
      document.documentElement.classList.remove("dark");
      setDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setDark(true);
    }

  }

  return (

    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-10 h-10 rounded-full
      bg-gray-200 dark:bg-gray-800
      hover:bg-gray-300 dark:hover:bg-gray-700
      transition"
    >

      {dark ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700" />
      )}

    </button>

  );
}
