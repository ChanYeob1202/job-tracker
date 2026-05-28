"use client"
import { useState, useEffect } from "react";
import JobsBoard from "./components/JobsBoard";
import type { Job } from "@/types/job";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";


export default function Page() {
  const [ rows, setRows ] = useState<Job[]>([])
  const { user } = useAuth();
  const [ isLoadingJobs, setIsLoadingJobs ] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await apiFetch(`/jobs`, {
        cache: "no-store"
      });
      if (res?.ok) {
        const data = await res.json();
        setRows(data.rows ?? []);
      }
      setIsLoadingJobs(false);
    })();
  }, []);

  return (
    <div className="">
      <div className="mt-8 p-4">
        <h1 className="text-4xl font-semibold">Job Applications</h1>
          { 
            user ? 
              <JobsBoard 
                initialRows={rows} 
                jobLoadingStatus = {isLoadingJobs}
                / > 
              : 
              null
          }
      </div>
    </div>
  );
}
