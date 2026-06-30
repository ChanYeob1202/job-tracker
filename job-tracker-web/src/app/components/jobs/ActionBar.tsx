"use client"

import { Dispatch, SetStateAction } from "react";
import Link from "next/link"

type ActionBarProps = {
    setSearchTerm: Dispatch<SetStateAction<string>>;
    searchTerm:string;
}

function ActionBar({ searchTerm, setSearchTerm  }: ActionBarProps) {
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
        <div className="w-full mt-10 mb-10 grid grid-cols-3">
            <input
                type="text"
                placeholder="Searh..."
                value = {searchTerm}
                className = "w-48 border birder-1 border-black p-1 rounded-lg bg-gray-200"
                onKeyDown={handleKeyDown}
                onChange = {(e) => setSearchTerm(e.target.value)}
            />

            {/* job filter */}

            <Link href="/jobs/new">add job</Link>
        </div>
    )
}

export default ActionBar
