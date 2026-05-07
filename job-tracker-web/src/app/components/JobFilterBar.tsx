"use client";
import AddJobButton from "./ui/AddJobButton";
import type { StatusFilterValue } from "./JobsBoard";

type JobFilterBarProps = {
  statusOptions: readonly { value: StatusFilterValue; label: string }[];
  statusFilter: StatusFilterValue;
  onStatusChange: (value: StatusFilterValue) => void;
};

function JobFilterBar({ statusOptions, statusFilter, onStatusChange }: JobFilterBarProps) {
  return (
    <>
      <div className="flex justify-between mt-10 gap-4 items-center">
        {/* filter */}
        <div className="flex flex-flow gap-4">
          <div>
            <label>Filter: </label>
            <select
              className="rounded-md border border-neutral-200 bg-gray-50 px-3 py-2 text-sm focus-outline-none focus:ring-2 focus:ring-blue-500/30"
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value as StatusFilterValue)}
            >
              {statusOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[200px]">
            <label>Sort by:  </label>
            <select
              className="rounded-md border border-neutral-200 bg-gray-50 px-3 py-2 text-sm focus-outline-none focus:ring-2 focus:ring-blue-500/30"
              defaultValue="Newest"
            >
              <option>Newest</option>
              <option>Applied</option>
            </select>
          </div>
        </div>
        <AddJobButton />
      </div>
    </>
  );
}

export default JobFilterBar;
