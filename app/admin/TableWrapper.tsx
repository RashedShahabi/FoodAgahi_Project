import React from "react";

interface TableWrapperProps {
  children: React.ReactNode;
}

export default function TableWrapper({ children }: TableWrapperProps) {
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
