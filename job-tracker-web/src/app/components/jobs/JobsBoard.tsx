"use client";
import { useMemo, useState } from "react";
import { type JobStatus, JOB_STATUS_OPTIONS } from "@/types/job";
import type { Job } from "@/types/job";
import JobFilterBar from "./JobFilterBar";
import JobTable from "./JobTable";

export type StatusFilterValue = "all" | JobStatus;

const STATUS_FILTER_OPTIONS: readonly { value: StatusFilterValue; label: string }[] = [
  { value: "all", label: "All" },
  ...JOB_STATUS_OPTIONS.map((value) => ({
    value,
    label: value.replace(/\b\w/g, (c) => c.toUpperCase()),
  })),
];

type JobsBoardProps = {
  initialRows: Job[];
  jobLoadingStatus: boolean;
};

function JobsBoard({ initialRows, jobLoadingStatus}: JobsBoardProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");

  const filteredRows = useMemo(
    () =>
      statusFilter === "all"
        ? initialRows
        : initialRows.filter((job) => job.status === statusFilter),
    [initialRows, statusFilter]
  );

  return (
    <div>
      {/* <JobFilterBar
        statusOptions={STATUS_FILTER_OPTIONS}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      /> */}
      <JobTable 
        rows={filteredRows} 
        jobLoadingStatus = {jobLoadingStatus}
        />
    </div>
  );
}

export default JobsBoard;
