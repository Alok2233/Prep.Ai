// src/auth.ts
export function saveAuth({ user, token }) {
  if (token) localStorage.setItem("token", token);
  localStorage.setItem("currentUser", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
}

export function getCurrentUser() {
  const j = localStorage.getItem("currentUser");
  if (!j) return null;
  try { return JSON.parse(j); } catch { return null; }
}
