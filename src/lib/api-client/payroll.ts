import { handleResponse } from "./_fetch";

export async function getPayrollData() {
  const res = await fetch("/api/v1/payroll");
  return handleResponse(res);
}
