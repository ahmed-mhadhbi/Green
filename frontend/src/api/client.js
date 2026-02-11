const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export async function apiRequest(path, { method = "GET", token, body, formData = false } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!formData) headers["Content-Type"] = "application/json";

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? (formData ? body : JSON.stringify(body)) : undefined
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  return payload;
}
