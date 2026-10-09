"use client";
import { useMemo, useState, Dispatch, SetStateAction } from "react";
import type { Job } from "@/types/job";
import Statsbar from "./Statsbar";
import FollowUp from "./FollowUp";
import JobTable from "./JobTable";
import ActionBar from "./ActionBar";

type JobsBoardProps = {
  initialRows: Job[];
  jobLoadingStatus: boolean;
  editorJob: Job | "new" | null;
  setEditorJob: Dispatch<SetStateAction<Job | "new" | null>>;
  updateField: (id: string, field: keyof Job, nameValue: string) => Promise <void>
};

function JobsBoard({ initialRows, jobLoadingStatus, editorJob, setEditorJob, updateField }: JobsBoardProps) {

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all");

  const searchedRows = useMemo(
    () => {
      const cleanSearch = searchTerm.trim().toLowerCase();
      return initialRows.filter((row) => {
        const matchesNames = row.company.trim().toLowerCase().includes(cleanSearch);
        const matchesRole = row.role?.trim().toLowerCase().includes(cleanSearch)
        const matchesNotes = row.notes?.trim().toLowerCase().includes(cleanSearch);
        return matchesNames || matchesRole || matchesNotes
      });
    }
    , [initialRows, searchTerm])

  const filteredRows = useMemo(
    () =>{
      if(selectedStatus === "all") return searchedRows;

      return searchedRows.filter((job) => job.status === selectedStatus)
    },
    [searchedRows, selectedStatus]
  );

  return (
    <div className="z-0">
      <Statsbar
        apps={initialRows}
      />

      {/* TODO: create & import follow-up component  */}
      <FollowUp 
        jobLoadingStatus = {jobLoadingStatus}
        initialRows = {initialRows}
        setEditorJob ={setEditorJob} 
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
        jobLoadingStatus={jobLoadingStatus}
        setEditorJob={setEditorJob}
        updateField = {updateField}
      />
    </div>
  );
}

export default JobsBoard;