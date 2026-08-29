export async function handleResponse(res: Response) {
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error || "Request failed");
  return body;
}
