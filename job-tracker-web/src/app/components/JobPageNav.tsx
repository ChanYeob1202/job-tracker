"use client";
import { useState, useEffect } from 'react'
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


  const [ cheer, setCheer ] = useState(CHEERS[0]);

  useEffect(() => {
    setCheer(CHEERS[Math.floor(Math.random() * CHEERS.length)])
  }, [])

  
  const { user, logOut} = useAuth();
  
  console.log("[nav]: ", user)
  const router = useRouter();

  const authButtonClass =
    "text-sm font-bold transition hover:text-blue-600 hover:cursor-pointer"

  return (
    <nav className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center gap-6">
          <h1
            onClick={() => router.push("/")}
            className="text-xl font-bold tracking-tight text-gray-900 transition hover:text-blue-600 hover:cursor-pointer"
          >
            Jobs
          </h1>
          <button
            onClick={() => {
              if(!user){
                alert("please sign in to create a job list");
                router.push("/signin");
                return;
              }
              router.push("/jobs/new");
            }}
            className={authButtonClass}
          >
            Add Job
          </button>
        </div>
        { user ?
          <div>
            <span className = "mr-4"> {cheer} {user.userName}! Keep applying 💪</span>
            <button
              className={authButtonClass}
              onClick={() => {
                logOut();
                router.push("/")
              }}>Sign out</button>

          </div>
            :
          <button className={authButtonClass} onClick={() => router.push("/signin")}>Sign In</button>}
    </nav>
  );
}
