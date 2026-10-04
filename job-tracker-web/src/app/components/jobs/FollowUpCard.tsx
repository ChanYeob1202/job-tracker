"use client"
import { useState, Dispatch, SetStateAction } from "react"
import type { Job } from "@/types/job"
import { FaRegPaperPlane } from "react-icons/fa";
import { FaRegCalendarAlt } from "react-icons/fa";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { followUpInfo, formatDueDate } from "@/lib/followUp";

type FollowUpCardProps = {
  row: Job
  info: ReturnType<typeof followUpInfo>
  setEditorJob: Dispatch<SetStateAction<Job | "new" | null>>;
}


function FollowUpCard({ row, info, setEditorJob }: FollowUpCardProps) {
  const [settingOpen, setSettingOpen] = useState(false);
  
  const settingOptions = [
   { 
    label: "Mark as followed up",
    event: () => {console.log("followed up button clicked")}
   },
   {
     label: "Update status",
     event: () => {}
   },
   {
     label: "Open job",
     event: () => {setEditorJob(row)},
   }
  ]
  return (
    <div className="flex flex-col gap-2 bg-white rounded-xl m-2 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{info.company}</p>
        <div className="relative">
          <HiOutlineDotsHorizontal
            className="hover:cursor-pointer"
            onClick={() => { setSettingOpen((prev => !prev)) }}
          />
          {/* options */}
          {settingOpen ?
          // TODO: esc or click outside to setSettingOpen = false;
            (
              <ul className="absolute right-0 top-full z-10  w-max rounded-lg  bg-white px-2 py-1 border border-gray-200">
                {settingOptions.map((opt, idx) => (
                  <li 
                    key={idx}
                    onClick = {opt.event}
                    className = "m-1 text-xs transition-all duration-200 hover:cursor-pointer hover:font-semibold hover:text-blue-400"
                    >
                    {opt.label}
                  </li>
                ))}
              </ul>
            )
            : ""}
        </div>
      </div>
      <p className="text-xs">{row.role}</p>
      <div className="flex ml-2 gap-2 items-center text-xs">
        <p><FaRegCalendarAlt /></p>
        <p>{formatDueDate(info.daysUntilDueDate)}</p>
      </div>
      <button
        // TODO: click => sending email 하나의 포맷을정해서 메일을 오픈해서 회사명만 바꾸기??
        className="mt-auto lg:w-2/3 self-center  py-1 text-xs flex gap-1 items-center justify-center rounded-xl bg-blue-400 font-bold text-white hover:cursor-pointer"
      >
        <span><FaRegPaperPlane /></span>
        <span>Follow Up</span>
      </button>
    </div>
  )
}

export default FollowUpCard
