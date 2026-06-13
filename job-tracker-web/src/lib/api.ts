/*  
  A fetch wrapper that automatically attaches the JWT token to request headers. 
*/

import { getToken, clearToken  } from "./auth";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "http://localhost:3001";

export const apiFetch = async (path: string, options?: RequestInit) => {
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
    });

    // Only treat 401 as "session expired → log out" for authenticated
    // requests (ones that actually carried a token). A login attempt sends
    // no token, so its 401 must fall through so the caller can read the
    // error body (e.g. "email and password don't match").
    if (token && response.status === 401) {
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
