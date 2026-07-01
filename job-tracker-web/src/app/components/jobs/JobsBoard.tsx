"use client";
import { useMemo, useState, Dispatch, SetStateAction} from "react";
import { type JobStatus } from "@/types/job";
import type { Job } from "@/types/job";
import Statsbar from "./Statsbar";
import JobTable from "./JobTable";
import ActionBar from "./ActionBar";

export type StatusFilterValue = "all" | JobStatus;

type JobsBoardProps = {
  initialRows: Job[];
  jobLoadingStatus: boolean;
  setRows: Dispatch<SetStateAction<Job[] | null>>
};

function JobsBoard({ initialRows, jobLoadingStatus, setRows }: JobsBoardProps) {

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
    [searchedRows, selectedStatus, initialRows]
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
        setRows={setRows}
        jobLoadingStatus={jobLoadingStatus}
      />
    </div>
  );
}

export default JobsBoard;

