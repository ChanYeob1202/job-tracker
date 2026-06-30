"use client"

import { Dispatch, SetStateAction } from "react";

type ActionBarProps = {
    setSearchTerm: Dispatch<SetStateAction<string>>;
    searchTerm:string;
}


function ActionBar({ searchTerm, setSearchTerm  }: ActionBarProps) {
    /* 
        ---------- search bar -----------
        1. gets setSearchTerm  hook
        2. key down -> trigger filter function
        3. needs to get initialRows' title and notes
        4.  return row that matches the search input 
        ----------------------------------- 
    */

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
        <div className="grid grid-cols-3">
            <input
                type="text"
                placeholder="Searh..."
                value = {searchTerm}
                onKeyDown={handleKeyDown}
                onChange = {(e) => setSearchTerm(e.target.value)}
            />
         
            

        </div>
    )
}

export default ActionBar
