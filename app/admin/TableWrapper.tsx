export default function TableWrapper({ children }) {
  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-right">
          {children}
        </table>
      </div>
    </div>
  );
}
