// src/lib/api.ts
export type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  headers?: Record<string, string>;
  requireAuth?: boolean; // if true, will attach Authorization header if token present
  includeCredentials?: boolean; // if true, sends cookies (credentials: 'include')
  signal?: AbortSignal; // optional abort signal
};

const API_BASE = (import.meta.env.VITE_API_BASE as string) || "";

function getAuthToken(): string | null {
  // Primary: localStorage (key name used by your app)
  const token = localStorage.getItem("auth_token") || localStorage.getItem("token") || null;
  if (token) return token;

  // Fallback: check cookie named 'token' (useful if server sets httpOnly cookie and you also echo token)
  try {
    const match = document.cookie.match(/(?:^|; )token=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  } catch {
    /* ignore */
  }

  return null;
}

function buildUrl(path: string) {
  if (!path) return API_BASE || "/";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // ensure leading slash
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

export async function apiFetch<T = any>(path: string, opts: FetchOptions = {}): Promise<T> {
  const url = buildUrl(path);

  // Detect if body is FormData -> don't set Content-Type
  const isFormData = typeof FormData !== "undefined" && opts.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(opts.headers || {}),
  };

  if (opts.requireAuth) {
    const token = getAuthToken();
    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const fetchOpts: RequestInit = {
    method: opts.method || "GET",
    headers,
    body: opts.body === undefined || isFormData ? opts.body : JSON.stringify(opts.body),
    credentials: opts.includeCredentials ? "include" : "same-origin",
    signal: opts.signal,
  };

  let res: Response;
  try {
    res = await fetch(url, fetchOpts);
  } catch (err: any) {
    // Network error or CORS/failed to fetch
    const e = new Error(`Network error: ${err?.message || "Failed to fetch"}`);
    // @ts-ignore debug prop
    e.original = err;
    throw e;
  }

  // 204 No Content
  if (res.status === 204) {
    // @ts-ignore allow null return for void responses
    return null;
  }

  const contentType = (res.headers.get("content-type") || "").toLowerCase();

  // Try to parse response body (json preferred)
  const parseBody = async () => {
    if (contentType.includes("application/json")) {
      try {
        return await res.json();
      } catch {
        return null;
      }
    }
    // fallback to text
    try {
      return await res.text();
    } catch {
      return null;
    }
  };

  const body = await parseBody();

  if (!res.ok) {
    // Build a helpful error object
    let message = `HTTP ${res.status} ${res.statusText}`;
    if (body) {
      if (typeof body === "string") message += `: ${body}`;
      else if (body?.error) message += `: ${body.error}`;
      else if (body?.message) message += `: ${body.message}`;
      else message += `: ${JSON.stringify(body)}`;
    }

    const err: any = new Error(message);
    err.status = res.status;
    err.statusText = res.statusText;
    err.body = body;
    throw err;
  }

  // Successful response
  return body as T;
}
