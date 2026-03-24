export async function apiFetch(path, options = {}) {
  const isFormData = options.body instanceof FormData;

  const res = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.headers || {}),
      ...(isFormData ? {} : { "Content-Type": "application/json" })
    }
  });

  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const msg = (data && data.error) ? data.error : "Request failed";
    throw new Error(msg);
  }
  return data;
}