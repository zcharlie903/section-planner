import React from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

function currency(n) {
  if (n == null || isNaN(n)) return "";
  return "$" + Number(n).toLocaleString();
}

export default function ResultsChart({ data }) {
  const series = Array.isArray(data) ? data.map(d => ({
    age: d.age,
    balance: Number(d.balance || 0),
  })) : [];

  if (!series.length) {
    return <div style={{padding: 8, fontSize: 14, color: '#666'}}>No data to chart yet. Run a calculation first.</div>;
  }

  return (
    <div style={{ width: "100%", height: 360 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="age" tickMargin={8} />
          <YAxis tickFormatter={(v) => (v/1000).toFixed(0) + "k"} width={60} />
          <Tooltip formatter={(value) => currency(value)} labelFormatter={(label) => "Age " + label} />
          <Line type="monotone" dataKey="balance" strokeWidth={2} dot={false} stroke="#4f46e5" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
