"use client"
import { useState, useEffect } from "react";
import JobsBoard from "./components/jobs/JobsBoard";
import type { Job } from "@/types/job";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Spinner from "./components/ui/Spinner";
import LandingPage from "./components/landing/LandingPage";

export default function Page() {
  const [ rows, setRows ] = useState<Job[] | null>(null)
  const { user, isLoading: authLoading } = useAuth();
  const isLoadingJobs = rows === null;

  // fetch /jobs only when an authenticated user is present
  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    (async () => {
      const res = await apiFetch(`/jobs`, { cache: "no-store" });
      if (cancelled) return;
      if (res?.ok) {
        const data = await res.json();
        setRows(data.rows ?? []);
      } else { 
        setRows([]);
      }
    })();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  if(authLoading) return <Spinner size = "lg" label = "loading"/>
  if(!user) return <LandingPage />

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="">
      <div className="mt-8 p-4">
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400">{today}</p>
            <h1 className="mt-1 text-2xl font-semibold text-gray-800">
              {user.userName}&apos;s applications
            </h1>
          </div>
        </div>
        <JobsBoard
          initialRows={rows ?? []}
          setRows = {setRows}          
          jobLoadingStatus={isLoadingJobs}
        />
      </div>
    </div>
  );
}
