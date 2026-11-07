"use client"
import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getToken, setToken as persistToken, clearToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

type UserType = {
    id: string,
    email: string,
    userName: string,
    jobTitle: string,
}

type AuthContextType = {
    user: UserType | null;
    isLoading: boolean;
    setUser: (u: UserType | null) => void;
    register: (email: string, userName: string, jobTitle: string, password: string) => Promise<void>
    login: (email: string, password: string) => Promise<void>;
    loginDemo: () => Promise<void>;
    logOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);


function toErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === "string") return error;
    if (error && typeof error === "object") {
        const firstField = Object.values(error as Record<string, string[]>)[0];
        if (Array.isArray(firstField) && firstField[0]) return firstField[0];
    }
    return fallback;
}

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

    const register = async (email: string, userName: string, jobTitle: string, password: string) => {
        const path = "/auth/register"
        const options = {
            method: "POST",
            body: JSON.stringify({ email, userName, jobTitle, password })
        }
        try {
            const res = await apiFetch(path, options);
            const data = await res?.json().catch(() => null);
            if (!res || !res.ok) {
                throw new Error(toErrorMessage(data?.error, "Register failed"));
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Register failed: `, error.message);
            }
            throw error;
        } finally {
            router.push("/signin")
            setIsLoading(false);
        }
    }

    const login = async (email: string, password: string) => {
        const path = "/auth/login"
        const options = {
            method: "POST",
            // no header apiFetch is already handling it.
            body: JSON.stringify({ email, password })
        }
        try {
            const res = await apiFetch(path, options);
            const data = await res?.json().catch(() => null);
            console.log(data.user);
            if (!res || !res.ok) {
                throw new Error(toErrorMessage(data?.error, "Log in failed"));
            }
            setUser(data.user);
            persistToken(data.accessToken);
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

    const loginDemo = async () => {
        try {
            const res = await apiFetch("/auth/demo", { method: "POST" });
            const data = await res?.json().catch(() => null);
            if (!res || !res.ok) {
                throw new Error(toErrorMessage(data?.error, "Could not start demo"));
            }
            setUser(data.user);
            persistToken(data.accessToken);
            router.push("/");
        } catch (error) {
            if (error instanceof Error) {
                console.error("Demo login failed: ", error.message);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const logOut = () => {
        apiFetch("/auth/logout", { method: "POST" });
        setUser(null);
        clearToken();
        router.push("/");
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, loginDemo, setUser, logOut, register }}>
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