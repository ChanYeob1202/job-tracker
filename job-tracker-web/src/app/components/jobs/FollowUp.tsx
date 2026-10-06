"use client"
import { useState, Dispatch, SetStateAction } from "react"
import type { Job } from "@/types/job"
import { followUpInfo, DAY_MS, FOLLOW_UP_INTERVAL_DAYS, FOLLOW_UP_NOTICE_DAYS } from "@/lib/followUp";
import FollowUpCard from "./FollowUpCard";

type FollowUpProps = {
  initialRows: Job[]
  jobLoadingStatus: boolean;
  setEditorJob: Dispatch<SetStateAction<Job | "new" | null>>;
}

const queueDate = FOLLOW_UP_NOTICE_DAYS * DAY_MS;

function FollowUp({ initialRows, jobLoadingStatus, setEditorJob }: FollowUpProps) {
  const [jobQueue, setJobQueue] = useState()
  const [viewOpen, setViewOpen] = useState(false);
  const [currentTime] = useState(() => Date.now());

  const eligibleJobs = initialRows.filter((job) => job.status !== "rejected" && job.status !== "offer");
  const followUpQueue = eligibleJobs.map(row => ({ row, info: followUpInfo(row, currentTime) }))
  // this will be queues that has only 14 or less than 14 days to follow up;

  const dueSoonQueue = followUpQueue.filter(row => row.info.dueDate -  currentTime <= queueDate);

  // a larger number of milliseconds means a newer (more recent) date
  const sortedQueue = [...dueSoonQueue].sort((a, b) => a.info.daysUntilDueDate - b.info.daysUntilDueDate);
  const sortedQueueLength = sortedQueue.length;
  const quickQueue = sortedQueue.slice(0, 4);
  const restQueue = sortedQueue.slice(4);

  return (
    //여기서 return 해야 할 것은, follow up cards containing compnay name, follow up date, and follow up button.
    <section className="w-full mt-2 rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
      {/* first header row */}
      <div className="flex items-start justify-between">
        <div>
          {/* icon */}
          <div className="flex gap-2 items-center">
            <div className="font-bold text-sm">Follow Ups</div>
            <div className="text-sm px-2  bg-blue-400 rounded-xl font-semibold text-white">{sortedQueueLength}</div>
          </div>
          <p className="mt-1 font-extralight text-xs text-gray-600 ">
            Jobs show up here {FOLLOW_UP_NOTICE_DAYS} days before a follow-up is due — {FOLLOW_UP_INTERVAL_DAYS} days after your last update.
          </p>
        </div>
        <div
          onClick={() => {
            setViewOpen((prev) => !prev);
          }}
          className="text-x underline  text-blue-400 hover:cursor-pointer hover:transition-transform hover:font-bold duration-200">
          {viewOpen ? "show less ←" : "view all →"}
        </div>
      </div>

      {/* empty state */}
      {!jobLoadingStatus && sortedQueueLength === 0 && (
        <p className="mt-4 rounded-xl bg-white p-4 text-center text-xs text-gray-500">
          Nothing due yet. We’ll remind you {FOLLOW_UP_NOTICE_DAYS} days before each follow-up.
        </p>
      )}

      {/* card section: first 4 always visible */}
      <div className="mt-4 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {quickQueue.map((queue) => (
          <FollowUpCard key={queue.row.id} id = {queue.row.id} row={queue.row} info={queue.info}  setEditorJob={setEditorJob} setViewOpen={setViewOpen}/>
        ))}
      </div>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${viewOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {restQueue.map((queue) => (
              <FollowUpCard key={queue.row.id} id={queue.row.id} row={queue.row} info={queue.info} setEditorJob = {setEditorJob} setViewOpen = {setViewOpen}/>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FollowUp
