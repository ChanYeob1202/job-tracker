"use client"

import { Dispatch, SetStateAction } from "react";
import Link from "next/link"
import { JOB_STATUS_OPTIONS } from "@/types/job";

type ActionBarProps = {
    searchTerm:string;
    setSearchTerm: Dispatch<SetStateAction<string>>;
    setSelectedStatus: Dispatch<SetStateAction<string>>
}

function ActionBar({ searchTerm, setSearchTerm, setSelectedStatus  }: ActionBarProps) {
    const handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
        // key down => filter
        if(evt.key === "Escape"){
            setSearchTerm("");
            evt.preventDefault();
        }
        if(evt.key === "Enter"){
            setSearchTerm(searchTerm);
        }
    }

  return (
        <div className="flex items-center justify-center gap-3 mt-10 mb-10">
            <input
                type="text"
                placeholder="🔍 Search..."
                value={searchTerm}
                className="w-42 border border-gray-200 px-3 py-2 rounded-lg bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                onKeyDown={handleKeyDown}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
                className="w-24 border border-gray-200 px-3 py-2 rounded-lg bg-white text-sm shadow-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition cursor-pointer"
                onChange={(e) => setSelectedStatus(e.target.value)}>
                {JOB_STATUS_OPTIONS.map((job, idx) => (
                    <option key={idx} value={job}>
                        {job}
                    </option>
                ))}
            </select>
            <Link href="/jobs/new" className="whitespace-nowrap px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-medium shadow-sm transition">
                + Add Job
            </Link>
        </div>
    )
}

export default ActionBar
