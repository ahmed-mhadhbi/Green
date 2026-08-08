export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, "");
export const API_ORIGIN = /^https?:\/\//i.test(API_BASE_URL)
  ? API_BASE_URL.replace(/\/api\/?$/, "")
  : "";

export async function apiRequest(path, { method = "GET", token, body, formData = false } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!formData) headers["Content-Type"] = "application/json";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
      method,
      headers,
      body: body ? (formData ? body : JSON.stringify(body)) : undefined
    });
  } catch (error) {
    throw new Error(`Could not reach the API at ${API_BASE_URL}. ${error.message}`);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  return payload;
}
