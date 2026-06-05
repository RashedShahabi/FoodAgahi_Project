"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function RevenueChart({ data }: any) {

  const chartData = {
    labels: data.map((d:any)=>d.date),
    datasets: [
      {
        label: "درآمد",
        data: data.map((d:any)=>d.amount),
        backgroundColor: "#2563eb",
      },
    ],
  };

  return <Bar data={chartData} />;
}
