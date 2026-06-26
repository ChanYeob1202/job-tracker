/*  
  A fetch wrapper that automatically attaches the JWT token to request headers. 
*/

import { getToken, setToken, clearToken } from "./auth";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "http://localhost:3001";

/*
  Ask the API for a fresh access token using the httpOnly refresh cookie.
  We don't read the cookie ourselves (we can't — it's httpOnly); `credentials:
  "include"` tells the browser to attach it automatically. Returns true if a
  new access token was issued and persisted.
*/
async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(API_BASE + "/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    if (!data?.accessToken) return false;
    setToken(data.accessToken);
    return true;
  } catch {
    return false;
  }
}

/*
  A fetch wrapper that attaches the JWT and transparently recovers from an
  expired access token: on a 401 it calls /auth/refresh ONCE, and if that
  succeeds, replays the original request with the new token. The `_retry` flag
  guards against an infinite refresh→401→refresh loop.
*/
export const apiFetch = async (
  path: string,
  options?: RequestInit,
  _retry = false,
): Promise<Response | undefined> => {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(API_BASE + path, {
      ...options,
      headers,
      credentials: "include", // send the refresh cookie alongside the request
    });

    if (token && response.status === 401 && !_retry) {
      // Access token likely expired → try a silent refresh, then retry once.
      const refreshed = await tryRefresh();
      if (refreshed) {
        return apiFetch(path, options, true);
      }
      // Refresh failed (refresh token also expired/revoked) → real logout.
      clearToken();
      return undefined;
    }

    if (!response.ok) {
      console.log(`Http error: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error(`An error occured during request ${error} `);
  }
};
