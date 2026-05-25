"use client"
import { createContext, useState, useContext, ReactNode} from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

type UserType = {
    id: string,
    email: string
}

type AuthContextType = {
    user: UserType | null;
    setUser: (u: UserType | null ) => void; 
    login: (email:string, password: string) => void;
}

const AuthContext = createContext<AuthContextType | null >(null);


export function AuthProvider ({ children }: { children: ReactNode} ) {
    const router = useRouter();

    const [ user, setUser ] = useState <UserType | null>(null)
    const [ token, setToken ] = useState<string | null>(() => getToken())
    const [ isLoading, setIsLoading ] = useState<boolean>(true);

    const login = async (email:string, password:string) => {
        const path = "/auth/login"
        const options = {
            method: "POST",
            body: JSON.stringify({ email, password })
        }

        const res = await (apiFetch(path, options));

        if (!res || !res.ok ){
            console.log("res: ", res, "res.ok: ", res?.ok, "status: ", res?.status )
            throw new Error ("Log in failed")
        }
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        console.log(`user: ${user} with token ${token}`)
        router.push("/");
    }


    return (
        <AuthContext.Provider value = {{ user, login, setUser}}>
            {children}
        </AuthContext.Provider>
    )
    
}

export function useAuth() {
    const context = useContext(AuthContext);
    if(!context){
        throw new Error ("useAuth must be used within an AuthProvider");
    }
    return context
}