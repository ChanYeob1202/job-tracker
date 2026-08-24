"use client";
import { useMemo, useState, Dispatch, SetStateAction } from "react";
import type { Job } from "@/types/job";
import Statsbar from "./Statsbar";
import JobTable from "./JobTable";
import ActionBar from "./ActionBar";

type JobsBoardProps = {
  initialRows: Job[];
  jobLoadingStatus: boolean;
  setRows: Dispatch<SetStateAction<Job[] | null>>;
  editorJob: Job | "new" | null;
  setEditorJob: Dispatch<SetStateAction<Job | "new" | null>>;
};

function JobsBoard({ initialRows, jobLoadingStatus, setRows, editorJob, setEditorJob }: JobsBoardProps) {

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const searchedRows = useMemo(
    () => {
      const cleanSearch = searchTerm.trim().toLowerCase();
      return initialRows.filter((row) => {
        const matchesNames = row.company.trim().toLowerCase().includes(cleanSearch);
        const matchesRole = row.role?.trim().toLowerCase().includes(cleanSearch)
        const matchesNotes = row.notes?.trim().toLowerCase().includes(cleanSearch);

        return matchesNames || matchesRole || matchesNotes
      })
    }
    , [initialRows, searchTerm])

  const filteredRows = useMemo(
    () =>
      searchedRows.filter((job) => job.status === selectedStatus),
    [searchedRows, selectedStatus]
  );

  return (
    <div className="z-0">
      <Statsbar
        apps={initialRows}
      />
      <ActionBar
        setSearchTerm={setSearchTerm}
        searchTerm={searchTerm}
        setSelectedStatus={setSelectedStatus}
        editorJob={editorJob}
        setEditorJob={setEditorJob}
      />

      <JobTable
        rows={filteredRows}
        setRows={setRows}
        jobLoadingStatus={jobLoadingStatus}
        setEditorJob={setEditorJob}
      />
    </div>
  );
}

export default JobsBoard;