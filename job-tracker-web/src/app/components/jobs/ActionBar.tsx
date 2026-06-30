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
        <div className="w-1/2 mx-auto  mt-10 mb-10 grid grid-cols-3">
            <input
                type="text"
                placeholder="Searh..."
                value = {searchTerm}
                className = "w-48 border-0.5 border-black p-1 rounded-lg bg-gray-200"
                onKeyDown={handleKeyDown}
                onChange = {(e) => setSearchTerm(e.target.value)}
            />

            {/* job filter */}
            <select
                className = "w-1/3 border"
                onChange = {(e) => setSelectedStatus(e.target.value)}>
                {JOB_STATUS_OPTIONS.map((job, idx)=> (
                    <option key = {idx} value={job}>
                        {job}
                    </option>
                ))}
            </select>
            <Link href="/jobs/new">+ add job</Link>
        </div>
    )
}

export default ActionBar
