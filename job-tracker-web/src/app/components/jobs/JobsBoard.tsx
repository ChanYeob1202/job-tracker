"use client";
import { useMemo, useState } from "react";
import { type JobStatus, JOB_STATUS_OPTIONS } from "@/types/job";
import type { Job } from "@/types/job";
import Statsbar from "./Statsbar";
import JobTable from "./JobTable";
import ActionBar from "./ActionBar";


export type StatusFilterValue = "all" | JobStatus;

type JobsBoardProps = {
  initialRows: Job[];
  jobLoadingStatus: boolean;
};

function JobsBoard({ initialRows, jobLoadingStatus }: JobsBoardProps) {

  // const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")



  const searchedRows = useMemo(
    () => {
      const cleanSearch = searchTerm.trim().toLowerCase();
      return initialRows.filter((row) => {
        const matchesNames = row.company.trim().toLowerCase().includes(cleanSearch);

        const matchesRole = row.role.trim().toLowerCase().includes(cleanSearch)

        const matchesNotes = row.notes?.trim().toLowerCase().includes(cleanSearch);

        return matchesNames || matchesRole || matchesNotes
      })
    }
    , [initialRows, searchTerm])

  const filteredRows = useMemo(
    () =>
      selectedStatus === "all"
        ? initialRows
        : searchedRows.filter((job) => job.status === selectedStatus),
    [searchedRows, selectedStatus]
  );

  return (
    <div>
      <Statsbar
        apps={initialRows}
      />
      <ActionBar
        setSearchTerm={setSearchTerm}
        searchTerm={searchTerm}
        setSelectedStatus={setSelectedStatus}
      />
      <JobTable
        rows={filteredRows}
        jobLoadingStatus={jobLoadingStatus}
      />
    </div>
  );
}

export default JobsBoard;

