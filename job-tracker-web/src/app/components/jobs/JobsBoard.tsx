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

function JobsBoard({ initialRows, jobLoadingStatus}: JobsBoardProps) {

  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [ searchTerm, setSearchTerm ] = useState("")

  const filteredRows = useMemo(
    () =>
      statusFilter === "all"
        ? initialRows
        : initialRows.filter((job) => job.status === statusFilter),
    [initialRows, statusFilter]
  );


  const searchedRows = useMemo(
    () => {
      const cleanSearch = searchTerm.trim().toLowerCase();
      return initialRows.filter((row) => {
        // condition A matches title
        const matchesNames = row.company.trim().toLowerCase().includes(cleanSearch);

        const matchesRole = row.role.trim().toLowerCase().includes(cleanSearch)

        // condition B matches notes
        const matchesNotes = row.notes?.trim().toLowerCase().includes(cleanSearch);

        return matchesNames || matchesRole || matchesNotes
      })
     }
  , [initialRows, searchTerm])

  return (
    <div>
      <Statsbar 
        apps = { initialRows }
          />
      <ActionBar 
        setSearchTerm = { setSearchTerm }
        searchTerm = {searchTerm}
      />
      <JobTable 
        // rows={filteredRows} 
        rows = {searchedRows}
        jobLoadingStatus = { jobLoadingStatus }
        />
    </div>
  );
}

export default JobsBoard;

