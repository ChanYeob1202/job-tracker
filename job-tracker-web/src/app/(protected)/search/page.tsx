"use client"

import { useState, useEffect } from "react"
import Link from "next/link";
import { IoDocumentText, IoLocationSharp } from "react-icons/io5";
import { MdDisplaySettings } from "react-icons/md";
import { useAuth } from "@/context/AuthContext";

/* 
 1. FE sends search request to BE
 2. BE takes user's job_title.
 3. check if there are cached datas.
 4. if not, request api. 
*/

function Page() {
  const categories = [
    { icon: <IoDocumentText />, label: "job_field", value: "software engineer", className: "bg-blue-50 text-blue-500" },
    { icon: <IoLocationSharp />, label: "job_location", value: "location", className: "bg-violet-50 text-violet-500" },
  ]

  const { user } = useAuth();

  const getJobLists = async (jobTitle: string) => {
    try {
      const res = await fetch("/search")

      if (!res.ok) {
        throw new Error(`error with ${res.status}`);
      }
    } catch (error:unknown){
      console.error("An error occured: ", error instanceof Error ?  error.message : error);
    }
  }

  useEffect(() => {
    if (user) {
      console.log(user.jobTitle);
      
      
    }

  }, [user])


  return (
    <div>
      <header className="m-2">
        <div className="flex flex-flow justify-between">
          <h1 className="text-lg font-semibold">
            Recommended For You
          </h1>
          <div className="">
            <span className="text-xs text-gray-400">
              Last synch 8 min ago
            </span>
            <button className="ml-4 border px-2 py-1 rounded-xl text-xs hover:cursor-pointer transition-all duration-200 hover:scale-105 ease-out hover:bg-gray-200 ">Refresh</button>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xs text-gray-400">
            Jobs matched to your preferences and updated automatically
          </p>
        </div>

        {/* pref bar */}
        <div className="flex flex-wrap gap-4  items-center max-w-full border border-gray-200 px-4 py-4 rounded-xl overflow-auto mt-6">
          <span className="hidden sm:flex font-semibold text-sm">Based on your preferences</span>
          {categories.map((c) => (
            <div key={c.label} className="flex items-center gap-2">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-base ${c.className}`}>{c.icon}</span>
              <span className="text-sm">{c.value}</span>
            </div>
          ))}

          <Link href="" className="hidden md:flex items-center gap-2 px-2 py-1 border border-gray-200 rounded-lg text-sm font-bold hover:cursor-pointer ml-auto">
            <MdDisplaySettings />
            Edit Preference
          </Link>
        </div>
      </header>

      {/* body */}
      <div className="mt-10">
        <h1 className="font-bold text-xl">🔥 New Today</h1>
        {/* job card mapping */}

      </div>
    </div>
  )
}

export default Page