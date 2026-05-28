"use client"
import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getToken, setToken as persistToken, clearToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

type UserType = {
    id: string,
    email: string
}

type AuthContextType = {
    user: UserType | null;
    isLoading: boolean;
    setUser: (u: UserType | null) => void;
    login: (email: string, password: string) => Promise<void>;
    logOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<UserType | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(() => {
        if (typeof window === "undefined") return true;
        return Boolean(getToken());
    });

    useEffect(() => {
        /* Goal : useEffect will be re-rendered if app is re-mounted
            1) verify token
            2) refetch user information
        */
        const token = getToken();
        if (!token) {
            setIsLoading(false);
            return;
        }
        (async () => {
            try {
                const res = await apiFetch("/auth/me")
                if (!res) return;
                if (res.status === 401) {
                    clearToken();
                    router.push("/auth/signin")
                    return;
                }
                const data = await res.json();
                if (data?.user) setUser(data.user);
            } finally {
                setIsLoading(false);
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const login = async (email: string, password: string) => {
        const path = "/auth/login"
        const options = {
            method: "POST",
            body: JSON.stringify({ email, password })
        }
        try {
            const res = await apiFetch(path, options);
            if (!res || !res.ok) {
                throw new Error("Log in failed")
            }
            const data = await res.json();
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
        router.push("/auth/signin");
    }
    return (
        <AuthContext.Provider value={{ user, isLoading, login, setUser, logOut }}>
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