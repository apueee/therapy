import { handleResponse } from "./_fetch";

export async function getAuditLogs() {
  const res = await fetch("/api/v1/audit-logs");
  return handleResponse(res);
}
