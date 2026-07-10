"use client"

import { useRef, useEffect, Dispatch, SetStateAction } from "react";
import Link from "next/link"
import { motion } from 'framer-motion';
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";
import { AiOutlineArrowsAlt } from "react-icons/ai";
import JobForm from "./JobForm";
import { JOB_STATUS_OPTIONS } from "@/types/job";



import { Job } from "@/types/job";

/* 
*  WHAT: inline job editor, editing and creating jobs

* What data should have 
    *  INPUT: data type JOB 
    * OUTPUT: storing into DB 
    * onClose() : 
    *   => 1. esc 2. clicking outside of panel 3. clicking >> button. 

one source of truth : one state will handle
creating, editing, and closed by "editorJob"
---- rendering depends on state ---
* how to implement conditional rendering
*  
* 
* 
*/

type JobEditPanelProps = {
  editorJob: Job | "new" | null
  setEditorJob: Dispatch<SetStateAction<Job | "new" | null>>
  onSuccess: () => void
}

function JobEditPanel({ editorJob, setEditorJob, onSuccess }: JobEditPanelProps) {

  // "new" or null → no initial data (blank form); a real Job → pre-fill with it.
  // The `&& editorJob !== "new"` narrows the union down to just Job | undefined,
  // which is exactly what JobForm's initialJob prop expects.
  const initialJob = editorJob && editorJob !== "new" ? editorJob : undefined;

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, [])

  const onCancel = () => {
    setEditorJob(null);
  }

  return (
    <>
      <div
        onClick={() => {
          setEditorJob(null);
        }}

        className="fixed inset-0 z-40 bg-black/20"

      />
      <motion.div
        ref={panelRef}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full md:w-[70%] fixed right-0 p-4 top-0 z-50 h-screen shadow-xl border border-gray-400 bg-white focus:outline-none"
        onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
          if (event.key === "Escape") {
            setEditorJob(null);
          }
        }}
        tabIndex={-1}
        autoFocus
      >
        <div className="flex flex-flow items-center gap-2">
          <button
            onClick={
              (e) => {
                e.preventDefault();
                setEditorJob(null)
              }
            }
            className="hover:cursor-pointer text-xl"
          >
            <MdOutlineKeyboardDoubleArrowRight />
          </button>
          <Link
            href={initialJob ? `/jobs/${initialJob.id}/edit` : "/jobs/new" }
            className="hover:cursor-pointer text-xl">
            <AiOutlineArrowsAlt />
          </Link>

        </div>


        {/* <form 
          className = "mt-10 ml-10"
          onKeyDown = {(event: React.KeyboardEvent<HTMLFormElement>) => {
            if (event.key === "Escape") {
              event.stopPropagation();      // don't close the panel on this ESC
              panelRef.current?.focus();    // move focus to the panel, so the NEXT ESC closes it
            }
          }}
          >
          <input
            className = "focus:outline-none"
            placeholder="New Application"
          />

        </form> */}
        <JobForm
          statusOptions={JOB_STATUS_OPTIONS}
          initialJob={ initialJob }
          onSuccess= { onSuccess }
          onCancel = { onCancel }
          />
      </motion.div>
    </>

  )
}

export default JobEditPanel
