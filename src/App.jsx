import React, { useState } from "react";
import { postCalculate } from "./services/api";
import ContributionSection from "./components/ContributionSection";
import CurrentSavingsSection from "./components/CurrentSavingsSection";
import PensionSection from "./components/PensionSection";
import SocialSecuritySection from "./components/SocialSecuritySection";
import DebtsSection from "./components/DebtsSection";
import Section from "./components/Section";

export default function App() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(65);
  const [income, setIncome] = useState(90000);
  const [expenses, setExpenses] = useState(50000);
  const [returnRate, setReturnRate] = useState(0.05);
  const [inflationRate, setInflationRate] = useState(0.02);

  const [contribAfterTax, setContribAfterTax] = useState(1000);
  const [contribTaxDeferred, setContribTaxDeferred] = useState(2500);
  const [contribTaxFree, setContribTaxFree] = useState(0);

  const [savAfterTax, setSavAfterTax] = useState(10000);
  const [savTaxDeferred, setSavTaxDeferred] = useState(500000);
  const [savTaxFree, setSavTaxFree] = useState(100000);

  const [pensionStart, setPensionStart] = useState("2035-01-01");
  const [pensionYearly, setPensionYearly] = useState(0);

  const [ssStartAge, setSsStartAge] = useState(62);
  const [ssMonthly, setSsMonthly] = useState(1925);

  const [debts, setDebts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const netWorth = (savAfterTax || 0) + (savTaxDeferred || 0) + (savTaxFree || 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload = {
        currentAge,
        retirementAge,
        income,
        expenses,
        netWorth,
        returnRate,
        inflationRate,
        contribAfterTax,
        contribTaxDeferred,
        contribTaxFree,
        pensionStart,
        pensionYearly,
        ssStartAge,
        ssMonthly,
        debts, // NEW
      };
      const data = await postCalculate(payload);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold mb-2">RetireWise – Retirement Planner</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Section title="Core Assumptions">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <div className="text-sm mb-1">Current Age</div>
              <input className="w-full border rounded-lg px-3 py-2" type="number" value={currentAge} onChange={(e)=>setCurrentAge(Number(e.target.value))} />
            </label>
            <label className="block">
              <div className="text-sm mb-1">Desired Retirement Age</div>
              <input className="w-full border rounded-lg px-3 py-2" type="number" value={retirementAge} onChange={(e)=>setRetirementAge(Number(e.target.value))} />
            </label>
            <label className="block">
              <div className="text-sm mb-1">Current Annual Income ($)</div>
              <input className="w-full border rounded-lg px-3 py-2" type="number" step="0.01" value={income} onChange={(e)=>setIncome(Number(e.target.value))} />
            </label>
            <label className="block">
              <div className="text-sm mb-1">Annual Expenses ($)</div>
              <input className="w-full border rounded-lg px-3 py-2" type="number" step="0.01" value={expenses} onChange={(e)=>setExpenses(Number(e.target.value))} />
            </label>
            <label className="block">
              <div className="text-sm mb-1">Expected Return Rate (e.g., 0.05)</div>
              <input className="w-full border rounded-lg px-3 py-2" type="number" step="0.0001" value={returnRate} onChange={(e)=>setReturnRate(Number(e.target.value))} />
            </label>
            <label className="block">
              <div className="text-sm mb-1">Inflation Rate (e.g., 0.02)</div>
              <input className="w-full border rounded-lg px-3 py-2" type="number" step="0.0001" value={inflationRate} onChange={(e)=>setInflationRate(Number(e.target.value))} />
            </label>
          </div>
        </Section>

        <ContributionSection
          afterTax={contribAfterTax}
          setAfterTax={setContribAfterTax}
          taxDeferred={contribTaxDeferred}
          setTaxDeferred={setContribTaxDeferred}
          taxFree={contribTaxFree}
          setTaxFree={setContribTaxFree}
        />

        <CurrentSavingsSection
          afterTax={savAfterTax}
          setAfterTax={setSavAfterTax}
          taxDeferred={savTaxDeferred}
          setTaxDeferred={setSavTaxDeferred}
          taxFree={savTaxFree}
          setTaxFree={setSavTaxFree}
        />

        <PensionSection
          payout={pensionYearly}
          setPayout={setPensionYearly}
          startDate={pensionStart}
          setStartDate={setPensionStart}
        />

        <SocialSecuritySection
          startingAge={ssStartAge}
          setStartingAge={setSsStartAge}
          monthlyBenefit={ssMonthly}
          setMonthlyBenefit={setSsMonthly}
        />

        <DebtsSection debts={debts} setDebts={setDebts} />

        <button
          type="submit"
          disabled={loading}
          className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Calculating…" : "Calculate"}
        </button>
      </form>

      {error && (
        <div className="mt-4 text-red-600"><strong>Error:</strong> {error}</div>
      )}

      {result && (
        <div className="mt-4 bg-white shadow-md rounded-2xl p-4">
          <h2 className="text-xl font-semibold">Results</h2>
          {result.retireAge !== null ? (
            <ul className="mt-2 space-y-1">
              <li>✅ Retirement Age: <strong>{result.retireAge}</strong></li>
              <li>💰 Projected Savings: ${Number(result.finalSavings).toLocaleString()}</li>
              <li>📤 Safe Withdrawal (4% rule): ${Number(result.safeWithdraw).toLocaleString()}/year</li>
            </ul>
          ) : (
            <p className="text-red-600">❌ Not sustainable before age 100. Adjust savings/expenses.</p>
          )}
        </div>
      )}
    </div>
  );
}
