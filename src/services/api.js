// SAFER API CLIENT — prevents //calculate and fails loud if env is missing
const RAW = import.meta.env.VITE_API_BASE_URL;
if (!RAW) {
  throw new Error("VITE_API_BASE_URL is not set. Set it in Railway (frontend service) and redeploy.");
}
const BASE_URL = RAW.replace(/\/+$/, "");

export async function postCalculate(payload) {
  const url = `${BASE_URL}/calculate`;
  console.log("[RetireWise] Calling:", url);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}
