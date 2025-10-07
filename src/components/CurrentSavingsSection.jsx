import React from "react";
import FieldRow from "./FieldRow";
import Section from "./Section";

export default function CurrentSavingsSection({ afterTax, setAfterTax, taxDeferred, setTaxDeferred, taxFree, setTaxFree }) {
  const total = (afterTax || 0) + (taxDeferred || 0) + (taxFree || 0);
  return (
    <Section title="Current Savings">
      <FieldRow label="After‑Tax" suffix="$" value={afterTax} onChange={setAfterTax} />
      <FieldRow label="Tax‑Deferred" suffix="$" value={taxDeferred} onChange={setTaxDeferred} />
      <FieldRow label="Tax‑Free" suffix="$" value={taxFree} onChange={setTaxFree} />
      <div className="text-right text-sm text-gray-600 mt-2">Total: ${total.toLocaleString()}</div>
    </Section>
  );
}
