"use client"
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import JobsBoard from "./components/jobs/JobsBoard";
import type { Job } from "@/types/job";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Spinner from "./components/ui/Spinner";
import LandingPage from "./components/landing/LandingPage";
import JobEditPanel from "./components/jobs/JobEditPanel";

export default function Page() {
  const [rows, setRows] = useState<Job[] | null>(null)
  const { user, isLoading: authLoading } = useAuth();
  const [editorJob, setEditorJob] = useState<Job | "new" | null>(null);
  const isLoadingJobs = rows === null;

  // re-syncs `rows` (our local copy) with the DB (the source of truth)
  const loadJobs = async () => {
    const res = await apiFetch(`/jobs`, { cache: "no-store" });
    if (res?.ok) {
      const data = await res.json();  
      setRows(data.rows ?? []);
    } else {
      setRows([]);
    }
  }       
      
  // called after a save: close the panel, then re-fetch so the new job appears
  const handleSaved = () => {
    setEditorJob(null);
    loadJobs();
  }

  // initial fetch: only when an authenticated user is present
  useEffect(() => {
    if (authLoading || !user) return;
    (async () => { await loadJobs(); })();
  }, [user, authLoading]);


  if (authLoading) return <Spinner size="lg" label="loading" />
  if (!user) return <LandingPage />

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
        <div>
          <AnimatePresence>
            {
              editorJob === null ?
                null
                :
                <JobEditPanel
                  editorJob={editorJob}
                  setEditorJob={setEditorJob}
                  onSuccess={handleSaved}
                />
            }
          </AnimatePresence>
          <JobsBoard
            initialRows={rows ?? []}
            setRows={setRows}
            jobLoadingStatus={isLoadingJobs}
            editorJob={editorJob}
            setEditorJob={setEditorJob}

          />
        </div>
      </div>
    </div>
  );
}
