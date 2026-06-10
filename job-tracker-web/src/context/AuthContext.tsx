"use client"
import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getToken, setToken as persistToken, clearToken, getTokenExp } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

type UserType = {
    id: string,
    email: string
}

type AuthContextType = {
    user: UserType | null;
    isLoading: boolean;
    setUser: (u: UserType | null) => void;
    register: (email: string, password: string) => Promise<void>
    login: (email: string, password: string) => Promise<void>;
    logOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<UserType | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        (async () => {
            try {
                const token = getToken();
                if (!token) return;
                const res = await apiFetch("/auth/me")
                if (!res) {
                    clearToken();
                    return;
                }
                const data = await res.json();
                if (data?.user) setUser(data.user);
            } finally {
                setIsLoading(false);
            }
        })()
    }, [])

    const register = async (email: string, password: string) => {
        const path = "/auth/register"
        const options = {
            method: "POST",
            body: JSON.stringify({ email, password })
        }
        try {
            const res = await apiFetch(path, options);
            const data = await res?.json().catch(() => null);
            if (!res || !res.ok) {
                throw new Error(data?.error ?? "Register failed");
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Register failed: `, error.message);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const login = async (email: string, password: string) => {
        const path = "/auth/login"
        const options = {
            method: "POST",
            body: JSON.stringify({ email, password })
        }
        try {
            const res = await apiFetch(path, options);
            // Read the body once — both success (token+user) and failure ({error}) live here.
            const data = await res?.json().catch(() => null);
            if (!res || !res.ok) {
                // Surface the server's actual message (e.g. "user dosen't exist")
                // instead of a generic "Log in failed" so the UI can show it.
                throw new Error(data?.error ?? "Log in failed");
            }
            
            setUser(data.user);
            persistToken(data.token);
            router.push("/");
        } catch (error) {
            if (error instanceof Error) {
                console.error("Sign in failed: ", error.message)
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const logOut = () => {
        setUser(null);
        clearToken();
        router.push("/");
    }

    useEffect(() => {
        if(!user) return;
        const token = getToken(); //user 가 바뀔때마다 token의 expiry 를 다시 가져오기위함
        if(!token) return;

        const expiresAtMs = getTokenExp(token);
        if (expiresAtMs === null) return;
        // Compute how long until we should act
        // Subtract a 30s buffer so we redirect before the server would reject
        const msUntilExpiry = expiresAtMs - Date.now() - 30_000;

        //if the token is already (almost) expired, log out immediately
        if(msUntilExpiry <= 0){
            // eslint-disable-next-line react-hooks/set-state-in-effect
            logOut();
            return;
        }

        //other wise schedule the log out
        const timerId = setTimeout(() => {
            alert( "Your session has expired, Please sign in again.");
            logOut();
        }, msUntilExpiry)

        return () => clearTimeout(timerId);
    }, [user]);


    return (
        <AuthContext.Provider value={{ user, isLoading, login, setUser, logOut, register }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context
}