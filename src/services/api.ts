// API service utilities

export async function fetcher<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `Failed to fetch ${url}`);
  }

  return res.json();
}

export const api = {
  get: <T = unknown>(url: string) => fetcher<T>(url, { method: "GET" }),

  post: <T = unknown>(url: string, data: unknown) =>
    fetcher<T>(url, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: <T = unknown>(url: string, data: unknown) =>
    fetcher<T>(url, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: <T = unknown>(url: string) => fetcher<T>(url, { method: "DELETE" }),
};
