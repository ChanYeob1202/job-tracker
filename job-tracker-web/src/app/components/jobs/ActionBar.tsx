"use client"

import { Dispatch, SetStateAction } from "react";
import { JOB_STATUS_OPTIONS, Job } from "@/types/job";
import { LuSearch, LuPlus } from "react-icons/lu";

type ActionBarProps = {
    searchTerm:string;
    setSearchTerm: Dispatch<SetStateAction<string>>;
    setSelectedStatus: Dispatch<SetStateAction<string>>
    editorJob : Job | "new" | null
    setEditorJob: Dispatch<SetStateAction<Job | "new" | null>>
}

function ActionBar({ searchTerm, setSearchTerm, setSelectedStatus, setEditorJob  }: ActionBarProps) {
    const handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
        if(evt.key === "Escape"){
            setSearchTerm("");
            evt.preventDefault();
        }
    }

  return (
        <div className="flex   flex-row items-center gap-0.4 sm:gap-0.4  mt-6 mb-4">
            {/* Search */}
            <div className="relative">
                <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    className="w-24 sm:w-52 pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition"
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Status filter */}
            <select
                className="sm:px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 transition cursor-pointer"
                onChange={(e) => setSelectedStatus(e.target.value)}
            >
                {JOB_STATUS_OPTIONS.map((job, idx) => (
                    <option key={idx} value={job}>{job}</option>
                ))}
            </select>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Add Job */}
            <div
                // href="/jobs/new"
                onClick = {() => setEditorJob("new")}
                className="inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium transition"
            >
                <LuPlus className="text-base" />
                Add Job
            </div>
        </div>
    )
}

export default ActionBar
