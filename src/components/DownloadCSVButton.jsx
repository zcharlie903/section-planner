import React from "react";

function toCSV(rows) {
  if (!rows || !rows.length) return "";
  const escapeCSV = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (s.includes('"') || s.includes(",") || s.includes("\n")) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const header = Object.keys(rows[0]);
  const lines = [header.map(escapeCSV).join(",")];
  for (const r of rows) {
    lines.push(header.map((h) => escapeCSV(r[h])).join(","));
  }
  return lines.join("\n");
}

export default function DownloadCSVButton({ pathData, filename = "retirewise_projection.csv" }) {
  const buildRows = () => {
    const rows = [];
    if (!pathData || !pathData.length) return rows;
    for (const year of pathData) {
      const debts = Array.isArray(year.debts) ? year.debts : [];
      const totalDebtBalance = debts.reduce((sum, d) => sum + (Number(d.balance) || 0), 0);
      rows.push({
        age: year.age,
        balance: Number(year.balance ?? 0).toFixed(2),
        expenses: Number(year.expenses ?? 0).toFixed(2),
        debtPayment: Number(year.debtPayment ?? 0).toFixed(2),
        totalDebtBalance: totalDebtBalance.toFixed(2),
      });
    }
    return rows;
  };

  const onDownload = () => {
    const rows = buildRows();
    const csv = toCSV(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={onDownload}
      className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-gray-700"
      title="Download yearly projection as CSV"
    >
      ⬇️ Download CSV
    </button>
  );
}
