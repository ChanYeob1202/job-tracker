"use client"
import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react"
import type { Job } from "@/types/job"
import { FaRegPaperPlane } from "react-icons/fa";
import { FaRegCalendarAlt } from "react-icons/fa";
import { IoIosCheckmark } from "react-icons/io";

import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { LuPanelRight, LuTrash2 } from "react-icons/lu";
import { followUpInfo, formatDueDate, type DueStatus } from "@/lib/followUp";
import { apiFetch } from "@/lib/api";
import CompanyAvatar from "./CompanyAvatar";

type FollowUpCardProps = {
  row: Job
  info: ReturnType<typeof followUpInfo>
  setEditorJob: Dispatch<SetStateAction<Job | "new" | null>>;
  setViewOpen: Dispatch<SetStateAction<boolean>>;
  id: string;
  updateField: (id: string, field: keyof Job, nameValue: string) => Promise<void>
}

const dueStatusColor: Record<DueStatus, string> = {
  upcoming: "text-gray-500",
  today: "text-amber-500 font-semibold",
  overdue: "text-red-500 font-semibold",
};


function FollowUpCard({ row, info, setEditorJob, setViewOpen, updateField, id }: FollowUpCardProps) {
  const [settingOpen, setSettingOpen] = useState(false);
  const optionRef = useRef<HTMLDivElement>(null);
  const currentDate = new Date();
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionRef && !optionRef.current?.contains(event.target as Node)) {
        setSettingOpen(false);
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (optionRef && event.key === "Escape") {
        setSettingOpen(false);
      }
    }
    //listen for clicks on the entire page
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const handleFollowedUp = () => {
    updateField(id, "last_followed_up_at", currentDate.toISOString());
    setSettingOpen(false);
  }


  const settingOptions = [
    {
      label: "Mark as followed up",
      icon: IoIosCheckmark,
      textColor: "hover:text-green-500",
      event: () => {
        handleFollowedUp();
          /*   
          TODO: updateField mark as followed up -> followed up means you sent an email -> status? change it to waiting. ? 
          */
      },
    },
    {
      label: "Open job",
      icon: LuPanelRight,
      textColor: "hover:text-blue-400",

      event: () => {
        setEditorJob(row)
        setSettingOpen(false);
      },
    },
    {
      label: "Delete",
      icon: LuTrash2,
      textColor: "hover:text-red-400",
      event: () => {
        setSettingOpen(false)
      }
    },
  ]

  return (
    <div className="flex flex-col gap-2 bg-white rounded-xl m-2 p-4 z-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <CompanyAvatar company={info.company} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{info.company}</p>
            <p className="truncate text-xs text-gray-500">{row.role}</p>
          </div>
        </div>
        <div
          className="relative"
          ref={optionRef}
        >
          <HiOutlineDotsHorizontal
            className="hover:cursor-pointer z-30"
            onClick={() => { setSettingOpen((prev => !prev)) }}
          />
          {/* options */}
          {settingOpen ?
            (
              <ul
                className="absolute right-0 top-full z-10  w-max rounded-lg  bg-white px-2 py-1 border border-gray-200"
              >
                {settingOptions.map((opt, idx) => (
                  <li
                    key={idx}
                    onClick={opt.event}
                    className={`m-1 flex items-center gap-1.5 text-xs transition-all duration-200 hover:cursor-pointer hover:font-semibold ${opt.textColor}`}
                  >
                    <opt.icon className="text-sm" />
                    {opt.label}
                  </li>
                ))}
              </ul>
            )
            : ""}
        </div>
      </div>
      <div className="flex ml-2 gap-2 items-center text-xs text-gray-500">
        <p><FaRegCalendarAlt /></p>
        <p>{formatDueDate(info.dueDate)}</p>
      </div>
      <p className={`ml-2 text-xs ${dueStatusColor[info.dueStatus]}`}>{info.dueLabel}</p>
      {/* wrapper carries the tooltip — disabled buttons don't reliably fire hover events */}
      <span title="Coming soon" className="mt-auto lg:w-2/3 self-center cursor-not-allowed">
        <button
          // TODO: click => sending email 하나의 포맷을정해서 메일을 오픈해서 회사명만 바꾸기??
          disabled
          className="w-full py-1 text-xs flex gap-1 items-center justify-center rounded-xl bg-blue-400 font-bold text-white disabled:opacity-50 disabled:pointer-events-none"
        >
          <span><FaRegPaperPlane /></span>
          <span>Follow Up</span>
        </button>
      </span>
    </div>
  )
}

export default FollowUpCard
