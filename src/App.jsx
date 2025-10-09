import React, { useState } from "react";

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

export default function App() {
  const [dob, setDob] = useState("1990-01-01");
  const [retirementAge, setRetirementAge] = useState(65);
  const [retirementDate, setRetirementDate] = useState(dateAtAge(dob, 65));

  const currentAge = ageFromDOB(dob) ?? 30;

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

  function onDobChange(s) {
    setDob(s);
    setRetirementDate(dateAtAge(s, retirementAge));
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Retirement Planner (DOB ↔ Age Link)</h1>
      <div className="space-y-4">
        <label className="block">
          <div className="text-sm font-semibold mb-1">Date of Birth</div>
          <input
            type="date"
            value={dob}
            onChange={(e) => onDobChange(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <div className="text-sm font-semibold mb-1">Retirement Age</div>
            <input
              type="number"
              value={retirementAge}
              onChange={(e) => onRetirementAgeChange(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </label>
          <label className="block">
            <div className="text-sm font-semibold mb-1">Retirement Date</div>
            <input
              type="date"
              value={retirementDate}
              onChange={(e) => onRetirementDateChange(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </label>
        </div>

        <p className="text-sm text-gray-600 mt-3">
          Current Age (auto): <b>{currentAge}</b>
        </p>
        <p className="text-sm text-gray-500">
          Enter either a <b>Retirement Age</b> or a <b>Retirement Date</b> — the other will update automatically.
        </p>
      </div>
    </div>
  );
}
