import { handleResponse } from "./_fetch";

export async function getReportsData() {
  const res = await fetch("/api/v1/reports");
  return handleResponse(res);
}
