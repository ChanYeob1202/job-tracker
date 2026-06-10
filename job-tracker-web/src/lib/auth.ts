export function setToken(token: string) {
  return localStorage.setItem("token", token);
}

export function getToken(): string | null {
  return  localStorage.getItem("token");
}

export function clearToken() {
  return localStorage.removeItem("token");
}

//proactive jwt: returns token expiry in ms (Date.now() units) or null if unparseable.
export function getTokenExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}