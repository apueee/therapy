import { handleResponse } from "./_fetch";

export async function getDeletionRequests() {
  const res = await fetch("/api/v1/deletion-requests");
  return handleResponse(res);
}

export async function approveDeletionRequest(id: string) {
  const res = await fetch(`/api/v1/deletion-requests/${id}/approve`, { method: "POST" });
  return handleResponse(res);
}

export async function rejectDeletionRequest(id: string) {
  const res = await fetch(`/api/v1/deletion-requests/${id}/reject`, { method: "POST" });
  return handleResponse(res);
}
