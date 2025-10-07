import React from "react";
import FieldRow from "./FieldRow";
import Section from "./Section";

export default function SocialSecuritySection({ startingAge, setStartingAge, monthlyBenefit, setMonthlyBenefit }) {
  return (
    <Section title="Social Security">
      <FieldRow label="Starting Age" value={startingAge} onChange={setStartingAge} />
      <FieldRow label="Benefit" suffix="/ month" value={monthlyBenefit} onChange={setMonthlyBenefit} />
    </Section>
  );
}
