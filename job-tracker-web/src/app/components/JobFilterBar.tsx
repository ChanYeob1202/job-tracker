"use client";

import { useEffect, useRef, useState } from "react";
import AddJobButton from "./ui/AddJobButton";
import type { StatusFilterValue } from "./JobsBoard";

type JobFilterBarProps = {
  statusOptions: readonly { value: StatusFilterValue; label: string }[];
  statusFilter: StatusFilterValue;
  onStatusChange: (value: StatusFilterValue) => void;
};

function JobFilterBar({ statusOptions, statusFilter, onStatusChange }: JobFilterBarProps) {
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

  const selectedLabel =
    statusOptions.find((o) => o.value === statusFilter)?.label ?? statusFilter;

  return (
    <div className="mt-10 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2" ref={containerRef}>
        <label id="job-filter-label" htmlFor="job-filter-trigger" className="shrink-0 text-sm text-gray-700">
          Filter:
        </label>
        <div className="relative">
          <button
            type="button"
            id="job-filter-trigger"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls="job-filter-listbox"
            className="min-w-40 rounded-md border border-neutral-200 bg-gray-50 px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 hover:cursor-pointer"
            onClick={() => setOpen((v) => !v)}
          >
            {selectedLabel}
          </button>
          {open ? (
            <ul
              id="job-filter-listbox"
              role="listbox"
              aria-labelledby="job-filter-label"
              className="absolute left-0 top-full z-50 mt-1 max-h-60 min-w-full overflow-auto rounded-md border border-neutral-200 bg-white py-1 shadow-lg"
            >
              {statusOptions.map(({ value, label }) => (
                <li key={value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={value === statusFilter}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                      value === statusFilter ? "bg-blue-50 font-medium text-blue-900" : "text-gray-800"
                    }`}
                    onClick={() => {
                      onStatusChange(value);
                      setOpen(false);
                    }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
      <AddJobButton />
    </div>
  );
}

export default JobFilterBar;
