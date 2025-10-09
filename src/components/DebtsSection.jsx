import React from "react";

function DebtRow({ debt, onChange, onRemove }) {
  const update = (field, val) => onChange({ ...debt, [field]: val });

  return (
    <div className="grid grid-cols-[1fr_8rem_6rem_8rem_3rem] gap-3 items-end mb-2">
      <label className="flex flex-col">
        <span className="text-sm text-gray-600">Label</span>
        <input
          className="px-3 py-2 border rounded-lg"
          type="text"
          value={debt.label}
          onChange={(e) => update("label", e.target.value)}
          placeholder="e.g., House, Car, School"
        />
      </label>
      <label className="flex flex-col">
        <span className="text-sm text-gray-600">Balance ($)</span>
        <input
          className="px-3 py-2 border rounded-lg text-right"
          type="number"
          min="0"
          step="0.01"
          value={debt.balance}
          onChange={(e) => update("balance", Number(e.target.value))}
        />
      </label>
      <label className="flex flex-col">
        <span className="text-sm text-gray-600">APR %</span>
        <input
          className="px-3 py-2 border rounded-lg text-right"
          type="number"
          min="0"
          step="0.01"
          value={debt.aprPercent}
          onChange={(e) => update("aprPercent", Number(e.target.value))}
        />
      </label>
      <label className="flex flex-col">
        <span className="text-sm text-gray-600">Payment / year ($)</span>
        <input
          className="px-3 py-2 border rounded-lg text-right"
          type="number"
          min="0"
          step="0.01"
          value={debt.annualPayment}
          onChange={(e) => update("annualPayment", Number(e.target.value))}
        />
      </label>
      <button
        type="button"
        onClick={onRemove}
        className="h-10 w-10 rounded-lg border text-gray-600 hover:bg-gray-50"
        title="Remove debt"
      >
        ×
      </button>
    </div>
  );
}

export default function DebtsSection({ debts, setDebts }) {
  const addDebt = () => {
    setDebts([
      ...debts,
      { label: "", balance: 0, aprPercent: 0, annualPayment: 0 }
    ]);
  };

  const updateDebt = (idx, updated) => {
    const clone = debts.slice();
    clone[idx] = updated;
    setDebts(clone);
  };

  const removeDebt = (idx) => {
    const clone = debts.slice();
    clone.splice(idx, 1);
    setDebts(clone);
  };

  const totalBalance = debts.reduce((s, d) => s + (d.balance || 0), 0);
  const totalAnnualPay = debts.reduce((s, d) => s + (d.annualPayment || 0), 0);

  return (
    <div className="rounded-2xl shadow-md bg-white mb-4 border border-gray-100">
      <div className="w-full flex justify-between items-center p-3 bg-purple-50 font-semibold text-purple-700 rounded-t-2xl">
        <span>Debts</span>
        <button
          type="button"
          className="px-3 py-1 rounded-lg border border-purple-300 hover:bg-purple-100"
          onClick={addDebt}
        >
          + Add Debt
        </button>
      </div>
      <div className="p-4">
        {debts.length === 0 && (
          <p className="text-sm text-gray-600 mb-2">
            Add debts like <em>House, Car, School</em> with their balances, APR, and your planned annual payment.
          </p>
        )}
        {debts.map((d, i) => (
          <DebtRow
            key={i}
            debt={d}
            onChange={(upd) => updateDebt(i, upd)}
            onRemove={() => removeDebt(i)}
          />
        ))}
        <div className="flex justify-end text-sm text-gray-600 mt-2">
          <div className="text-right">
            <div>Total Balance: <strong>${totalBalance.toLocaleString()}</strong></div>
            <div>Total Annual Payments: <strong>${totalAnnualPay.toLocaleString()}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
