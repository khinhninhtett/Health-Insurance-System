const API_BASE = "http://localhost:5000";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("him_token");
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const result = await res.json().catch(() => ({}));

  if (!res.ok || result.success === false) {
    throw new Error(result.message || "Request failed");
  }

  return result;
}

export { API_BASE };
