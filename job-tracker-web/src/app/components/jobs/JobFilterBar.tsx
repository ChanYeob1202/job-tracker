"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import AddJobButton from "../ui/AddJobButton";
import { JOB_STATUS_FILTERS } from "@/types/job";

type JobFilterBarProps = {
  setSelectedStatus: Dispatch<SetStateAction<string>>
};

function JobFilterBar({ setSelectedStatus }: JobFilterBarProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: Event) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);


  return (
    <select
      className="sm:px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 transition cursor-pointer"
      onChange={(e) => setSelectedStatus(e.target.value)}
    >
      {JOB_STATUS_FILTERS.map((status, idx) => (
        <option key={idx} value={status}>{status}</option>
      ))}
    </select>
  );
}

export default JobFilterBar;

