"use client";
import { useRouter } from "next/navigation" 
import { useAuth } from "@/context/AuthContext";

export default function JobPageNav() {
  const { user, logOut} = useAuth();
  const router = useRouter();

  const authButtonClass = "hover:cursor-pointer hover:opacity-70 text-sm font-light"

  return (
    <nav className="relative z-10 flex flex-wrap flex-flow justify-between items-center gap-4 pb-4 border-b font-bold">
        <div className="flex items-center gap-4">
          <h1 className="text-lg">
            <div
              onClick={() => router.push("/")}
              className="hover:cursor-pointer hover:opacity-70"
            >
              Jobs
            </div>
          </h1>
          <div
            onClick={() => {
              if(!user){
                alert("please sign in to create a job list");
                router.push("/signin")
                return;
              }
              router.push("/jobs/new");
            }}
            className="hover:cursor-pointer hover:opacity-70"
          >
            Add Job
          </div>
        </div>
        { user ? 
          <div
            className = {authButtonClass}
            onClick = {() => {
              logOut();
              router.push("/jobs")
            }}>Sign out</div> 
            : 
          <div className= {authButtonClass} onClick = {() => router.push("/signin")}>Sign In</div>}
    </nav>
  );
}
