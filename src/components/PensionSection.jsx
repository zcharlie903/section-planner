import React from "react";
import FieldRow from "./FieldRow";
import Section from "./Section";

export default function PensionSection({ payout, setPayout, startDate, setStartDate }) {
  return (
    <Section title="Defined‑Benefit Pension">
      <FieldRow label="Start Date" type="date" value={startDate} onChange={setStartDate} />
      <FieldRow label="Amount" suffix="/ year" value={payout} onChange={setPayout} />
    </Section>
  );
}
