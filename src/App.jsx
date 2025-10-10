import React, { useEffect, useState } from "react";
import { postCalculate } from "./services/api";
import ContributionSection from "./components/ContributionSection";
import CurrentSavingsSection from "./components/CurrentSavingsSection";
import PensionSection from "./components/PensionSection";
import SocialSecuritySection from "./components/SocialSecuritySection";
import DebtsSection from "./components/DebtsSection";
import Section from "./components/Section";
import ResultsChart from "./components/ResultsChart";
import DownloadCSVButton from "./components/DownloadCSVButton";


// ---------- Date helpers ----------
function toISODate(d) {
  if (!d || Number.isNaN(d.getTime())) return "";
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return [d.getFullYear(), String(m).padStart(2, "0"), String(day).padStart(2, "0")].join("-");
}
function parseISODate(s) {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}
function ageFromDOB(dobStr, asOf = new Date()) {
  const dob = parseISODate(dobStr);
  if (!dob) return null;
  let age = asOf.getFullYear() - dob.getFullYear();
  const beforeBirthday = asOf < new Date(asOf.getFullYear(), dob.getMonth(), dob.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}
function dateAtAge(dobStr, ageYears) {
  const dob = parseISODate(dobStr);
  if (!dob || ageYears == null || Number.isNaN(ageYears)) return "";
  const d = new Date(dob);
  d.setFullYear(d.getFullYear() + Number(ageYears));
  return toISODate(d);
}
function ageAtDate(dobStr, dateStr) {
  const dob = parseISODate(dobStr);
  const target = parseISODate(dateStr);
  if (!dob || !target) return null;
  let age = target.getFullYear() - dob.getFullYear();
  const beforeBirthday = target < new Date(target.getFullYear(), dob.getMonth(), dob.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}
// Compute DOB from an Age, preserving month/day from existing DOB when possible.
function dobFromAge(ageYears, referenceDobStr) {
  const today = new Date();
  let month = today.getMonth();
  let day = today.getDate();
  if (referenceDobStr) {
    const ref = parseISODate(referenceDobStr);
    if (ref) { month = ref.getMonth(); day = ref.getDate(); }
  }
  const birthdayThisYear = new Date(today.getFullYear(), month, day);
  const birthdayHasPassed = today >= birthdayThisYear;
  let year = today.getFullYear() - Number(ageYears);
  if (!birthdayHasPassed) year -= 1;
  // handle 2/29 fallback
  if (month === 1 && day === 29) {
    const dt = new Date(year, 1, 29);
    if (Number.isNaN(dt.getTime()) || dt.getMonth() !== 1 || dt.getDate() !== 29) {
      return toISODate(new Date(year, 1, 28));
    }
  }
  return toISODate(new Date(year, month, day));
}

// ---------- SSA estimator (simplified, mirrors backend) ----------
function estimateSSMonthly(incomeAnnual, retirementAge, worked30) {
  if (!incomeAnnual || !retirementAge) return null;
  let baseFull = Math.min(3500.0, 0.42 * incomeAnnual / 12.0);
  if (retirementAge < 67) {
    const yrs = 67 - retirementAge;
    baseFull *= Math.max(0.0, 1 - 0.06 * yrs);
  } else if (retirementAge > 67) {
    const yrs = retirementAge - 67;
    baseFull *= 1 + 0.08 * yrs;
  }
  if (worked30) baseFull = Math.max(baseFull, 1000.0);
  return Math.round(baseFull * 100) / 100;
}

export default function App() {
  // Timeline
  const [dob, setDob] = useState("1990-01-01");
  const [age, setAge] = useState(35);
  const [retirementAge, setRetirementAge] = useState(65);
  const [retirementDate, setRetirementDate] = useState(dateAtAge(dob, 65));

  // Economics
  const [income, setIncome] = useState(90000);
  const [expenses, setExpenses] = useState(50000);
  const [returnRate, setReturnRate] = useState(0.05);
  const [inflationRate, setInflationRate] = useState(0.02);

  // Contributions
  const [contribAfterTax, setContribAfterTax] = useState(1000);
  const [contribTaxDeferred, setContribTaxDeferred] = useState(2500);
  const [contribTaxFree, setContribTaxFree] = useState(0);

  // Savings
  const [savAfterTax, setSavAfterTax] = useState(10000);
  const [savTaxDeferred, setSavTaxDeferred] = useState(500000);
  const [savTaxFree, setSavTaxFree] = useState(100000);

  // Pension
  const [pensionStart, setPensionStart] = useState("2035-01-01");
  const [pensionYearly, setPensionYearly] = useState(0);

  // Social Security
  const [ssStartAge, setSsStartAge] = useState(67);
  const [ssMonthly, setSsMonthly] = useState(null);
  const [worked30, setWorked30] = useState(false);

  // Debts
  const [debts, setDebts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // Derived
  const autoAge = ageFromDOB(dob);
  const currentAge = age ?? autoAge ?? 30;
  const netWorth = (savAfterTax || 0) + (savTaxDeferred || 0) + (savTaxFree || 0);

  // ---- Sync: when DOB changes, recompute Age and keep retirement date aligned
  function onDobChange(nextDob) {
    setDob(nextDob);
    const a = ageFromDOB(nextDob);
    if (a != null) setAge(a);         // always update Age to match DOB
    const d = dateAtAge(nextDob, retirementAge);
    if (d) setRetirementDate(d);
  }

  // ---- Sync: when Age changes, recompute DOB (preserve month/day), and keep retirement date aligned
  function onAgeChange(nextAge) {
    const v = Number(nextAge);
    setAge(v);
    const nextDob = dobFromAge(v, dob);
    if (nextDob) setDob(nextDob);     // always update DOB to match Age
    const d = dateAtAge(nextDob || dob, retirementAge);
    if (d) setRetirementDate(d);
  }

  // ---- Sync: Retirement age/date
  function onRetirementAgeChange(val) {
    const v = Number(val);
    setRetirementAge(v);
    const d = dateAtAge(dob, v);
    if (d) setRetirementDate(d);
  }
  function onRetirementDateChange(s) {
    setRetirementDate(s);
    const a = ageAtDate(dob, s);
    if (a != null) setRetirementAge(a);
  }

  // Auto-prefill SS monthly from income (30-yr avg assumption) unless user typed one
  useEffect(() => {
    if (ssMonthly === null || ssMonthly === "") {
      const est = estimateSSMonthly(income, retirementAge || ssStartAge || 67, worked30);
      if (est != null) setSsMonthly(est);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [income, retirementAge, worked30]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const payload = {
        // Timeline
        dob,
        currentAge,
        retirementAge,
        retirementDate,
        // Econ
        income,
        expenses,
        netWorth,
        returnRate,
        inflationRate,
        // Contributions
        contribAfterTax,
        contribTaxDeferred,
        contribTaxFree,
        // Pension / SS
        pensionStart,
        pensionYearly,
        ssStartAge,
        ssMonthly,
        worked30,
        // Debts
        debts,
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
        {/* Combined: Identity & Timeline (DOB, Age, Retirement Age, Retirement Date) */}
        <Section title="Identity & Timeline">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <div className="text-sm mb-1">Date of Birth</div>
              <input
                className="w-full border rounded-lg px-3 py-2"
                type="date"
                value={dob}
                onChange={(e) => onDobChange(e.target.value)}
              />
            </label>
            <label className="block">
              <div className="text-sm mb-1">Age</div>
              <input
                className="w-full border rounded-lg px-3 py-2"
                type="number"
                value={age}
                onChange={(e) => onAgeChange(e.target.value)}
              />
            </label>
            <label className="block">
              <div className="text-sm mb-1">Retirement Age</div>
              <input
                className="w-full border rounded-lg px-3 py-2"
                type="number"
                value={retirementAge}
                onChange={(e) => onRetirementAgeChange(e.target.value)}
              />
            </label>
            <label className="block">
              <div className="text-sm mb-1">Retirement Date</div>
              <input
                className="w-full border rounded-lg px-3 py-2"
                type="date"
                value={retirementDate || ""}
                onChange={(e) => onRetirementDateChange(e.target.value)}
              />
            </label>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Change <b>DOB</b> or <b>Age</b> — the other updates automatically. Retirement Age/Date also stay in sync.
          </p>
        </Section>

        <Section title="Core Assumptions">
          <div className="grid grid-cols-2 gap-4">
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
        <div className="flex items-center gap-3 -mt-2 mb-4">
          <button
            type="button"
            onClick={() => setWorked30(!worked30)}
            className={`px-3 py-2 rounded-lg border ${worked30 ? "bg-green-100 border-green-400 text-green-800" : "bg-white text-gray-700"}`}
            title="If yes, we floor the estimated SS benefit at $1,000/month"
          >
            {worked30 ? "✅ Worked 30+ Years" : "Worked 30+ Years?"}
          </button>
          <span className="text-sm text-gray-500">
            SS benefit is auto‑prefilled from income as a 30‑year average. You can overwrite it.
          </span>
        </div>

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
          {result && result.path && result.path.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Portfolio Balance by Age</h3>
              <ResultsChart data={result.path} />

              <div className="mt-2 flex gap-3 items-center">
                <DownloadCSVButton pathData={result.path} />
              </div>
            </div>
          )}
          
        </div>
      )}
    </div>
  );
}



