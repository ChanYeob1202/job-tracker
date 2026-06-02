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
                console.log(`[AuthContext] token fetched ${token}`)
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

    const register = async ( email:string, password: string) => {
        const path = "/auth/register"
        const options = {
            method: "POST",
            body: JSON.stringify( { email, password })
        }

        try {
            const res = await apiFetch(path, options);
            if(!res || !res.ok){
                throw new Error("Register failed");
            } 
            const data = res.json();
            console.log(data);
            } catch (error){
                if( error instanceof Error){
                    console.error(`Register failed: `, error.message);
                }
                throw error;
            }finally {
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
        router.push("/");
    }
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