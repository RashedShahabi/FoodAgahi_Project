interface StatCardProps {
  title: string;
  value: string | number;
  color: string;
}
export default function StatCard({ title, value, color }: StatCardProps) {
  return (
    <div className={`bg-white shadow rounded-xl p-6 border-r-4 ${color}`}>
      <p className="text-gray-500 mb-2">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
    </div>
  );
}
