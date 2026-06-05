"use client"
import { useState, useEffect } from "react";
import JobsBoard from "./components/JobsBoard";
import type { Job } from "@/types/job";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Spinner from "./components/ui/Spinner";
import LandingPage from "./components/LandingPage";

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

  return (
    <div className="">
      <div className="mt-8 p-4">
        <h1 className="text-4xl font-semibold">Job Applications</h1>
              <JobsBoard
                initialRows={rows ?? []}
                jobLoadingStatus = {isLoadingJobs}
                />
      </div>
    </div>
  );
}
