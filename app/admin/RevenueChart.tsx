"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// ثبت ماژول‌های مورد نیاز Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// تعریف ساختار داده‌های ورودی برای جلوگیری از ارور TypeScript
interface RevenueDataItem {
  date: string;
  total: number;
}

interface RevenueChartProps {
  data: RevenueDataItem[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: "درآمد روزانه",
        data: data.map((d) => d.total),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <Bar data={chartData} options={options} />
    </div>
  );
}
