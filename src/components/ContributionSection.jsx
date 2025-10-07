import React from "react";
import FieldRow from "./FieldRow";
import Section from "./Section";

export default function ContributionSection({ afterTax, setAfterTax, taxDeferred, setTaxDeferred, taxFree, setTaxFree }) {
  const total = (afterTax || 0) + (taxDeferred || 0) + (taxFree || 0);
  return (
    <Section title="Pre‑Retirement Contributions">
      <FieldRow label="After‑Tax" suffix="/ year" value={afterTax} onChange={setAfterTax} />
      <FieldRow label="Tax‑Deferred" suffix="/ year" value={taxDeferred} onChange={setTaxDeferred} />
      <FieldRow label="Tax‑Free" suffix="/ year" value={taxFree} onChange={setTaxFree} />
      <div className="text-right text-sm text-gray-600 mt-2">Total: ${total.toLocaleString()}</div>
    </Section>
  );
}
