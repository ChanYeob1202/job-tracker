"use client"
import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react"
import type { Job } from "@/types/job"
import { FaRegPaperPlane } from "react-icons/fa";
import { FaRegCalendarAlt } from "react-icons/fa";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { LuPanelRight, LuTrash2 } from "react-icons/lu";
import { followUpInfo, formatDueDate } from "@/lib/followUp";
import { apiFetch } from "@/lib/api";

type FollowUpCardProps = {
  row: Job
  info: ReturnType<typeof followUpInfo>
  setEditorJob: Dispatch<SetStateAction<Job | "new" | null>>;
  setViewOpen: Dispatch<SetStateAction<boolean>>;
  id: number;
}


/* 
  TODO: 
      1. due date 이 지난지 한참지났으면 text -> red 그다음에 몇일 지났는지 경고하기 ;
      upcoming oct 12 - in 3 days (회색)
      due today oct 9 - due today (주황/amber)
      overdue oct 2 - 4 days overdue
*/


function FollowUpCard({ row, info, setEditorJob, setViewOpen, id }: FollowUpCardProps) {
  const [settingOpen, setSettingOpen] = useState(false);
  const optionRef = useRef<HTMLDivElement>(null);

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

  const handleDelete = (id: string) => {
    return apiFetch(`/jobs/${id}`, {
      method: "Delete"
    });
  }

  const settingOptions = [
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
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{info.company}</p>
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
      <p className="text-xs">{row.role}</p>
      <div className="flex ml-2 gap-2 items-center text-xs">
        <p><FaRegCalendarAlt /></p>
        <p>{formatDueDate(info.dueDate)}</p>
      </div>
      <button
        // TODO: click => sending email 하나의 포맷을정해서 메일을 오픈해서 회사명만 바꾸기??
        className="mt-auto lg:w-2/3 self-center  py-1 text-xs flex gap-1 items-center justify-center rounded-xl bg-blue-400 font-bold text-white hover:cursor-pointer hover:font-semibold transition-all duration-200"
      >
        <span><FaRegPaperPlane /></span>
        <span>Follow Up</span>
      </button>
    </div>
  )
}

export default FollowUpCard
