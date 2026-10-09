"use client"
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import JobsBoard from "./components/jobs/JobsBoard";
import type { Job } from "@/types/job";
import { useAuth } from "@/context/AuthContext";
import { useJobs }  from "@/hooks/useJobs";
import Spinner from "./components/ui/Spinner";
import LandingPage from "./components/landing/LandingPage";
import JobEditPanel from "./components/jobs/JobEditPanel";

export default function Page() {
  const { user, isLoading: authLoading } = useAuth();
  const { rows, loadJobs, isLoading: isLoadingJobs, updateField } = useJobs();
  const [editorJob, setEditorJob] = useState<Job | "new" | null>(null);

  // TODO: follow-up update -> follow up mark up as followed up

  // called after a save: close the panel, then re-fetch so the new job appears
  const handleSaved = () => {
    setEditorJob(null);
    loadJobs();
  }

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
            updateField = { updateField }
            jobLoadingStatus={isLoadingJobs}
            editorJob={editorJob}
            setEditorJob={setEditorJob}
          />
        </div>
      </div>
    </div>
  );
}
