"use client";
import { useState } from 'react'
import { useRouter } from "next/navigation" 
import { useAuth } from "@/context/AuthContext";

const CHEERS = [
  "You got this!",
  "Keep going strong",
  "One step at a time",
  "You are not alone",
  "Your dream is close"
]

export default function JobPageNav() {

  // Pick a random cheer once, on first render. Lazy initializer avoids a
  // post-mount setState (and the react-hooks/set-state-in-effect error).
  const [ cheer ] = useState(() => CHEERS[Math.floor(Math.random() * CHEERS.length)]);


  const { user, logOut} = useAuth();
  
  const router = useRouter();

  const authButtonClass =
    "text-sm font-semibold text-gray-600 transition hover:text-brand-600 hover:cursor-pointer"

  const primaryButtonClass =
    "rounded-lg bg-linear-to-r from-brand-600 to-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-500/30 transition hover:cursor-pointer hover:brightness-110"

  return (
    <nav className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-white/80 px-6 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <h1
            onClick={() => router.push("/")}
            className="bg-linear-to-r from-brand-600 to-accent-600 bg-clip-text text-xl font-bold tracking-tight text-transparent transition hover:cursor-pointer hover:opacity-80"
          >
            Landr
          </h1>
          <span aria-hidden className="hidden h-5 w-px bg-gray-300 sm:block" />
          <span className="hidden text-xs font-medium text-gray-400 sm:block">
            From applied to offer
          </span>
        </div>
        { user ?
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{cheer} <span className="font-semibold text-gray-900">{user?.userName}</span>!</span>
            <button
              className={authButtonClass}
              onClick={() => {
                logOut();
                router.push("/")
              }}>Sign out</button>

          </div>
            :
          <button className={primaryButtonClass} onClick={() => router.push("/signin")}>Sign In</button>}
    </nav>
  );
}
