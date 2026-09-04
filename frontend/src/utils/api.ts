/**
 * Tiny API helper.
 *
 * Every page calls `fetchWithFallback("/products", mockProducts)`:
 * it tries the real REST API first and falls back to mock data when the
 * backend is not available yet. Response shape follows the API doc:
 *   { success: boolean, message: string, data: <payload> }
 */

export const API_BASE_URL = import.meta.env["VITE_API_URL"] ?? "/api";

export async function fetchWithFallback<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const json = (await res.json()) as { data?: T } | T;
    const data = (json as { data?: T }).data ?? (json as T);
    return data ?? fallback;
  } catch {
    // Backend not ready / offline -> use mock data with the same shape.
    return fallback;
  }
}

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}
