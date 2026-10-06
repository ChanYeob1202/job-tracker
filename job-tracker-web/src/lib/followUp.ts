import type { Job } from "@/types/job"
export const DAY_MS = 86_400_000;
// follow-up is due this many days after the last status change / follow-up
export const FOLLOW_UP_INTERVAL_DAYS = 14;
// jobs enter the queue this many days before they're due
export const FOLLOW_UP_NOTICE_DAYS = 5;


export const followUpInfo = (job: Job, now: number) => {

  if (!job.last_followed_up_at) {
    job.last_followed_up_at = job.status_changed_at;
  }

  const statusChangedAt = new Date(job.status_changed_at).getTime();
  const lastFollowedUp = new Date(job.last_followed_up_at).getTime();

  const company = job.company;
  const role = job.role;

  const base = Math.max(statusChangedAt, lastFollowedUp);
  const dueDate = base + (DAY_MS * FOLLOW_UP_INTERVAL_DAYS);
  // queue standard =  before 5 days
  const daysUntilDueDate = Math.floor((dueDate - now)/ DAY_MS);


  return { company, role, dueDate, daysUntilDueDate };
}

export const formatDueDate = (ms: number): string => {
  const date = new Date(ms);
  // only show the year when it isn't the current one (e.g. due date rolls into next year)
  const showYear = date.getFullYear() !== new Date().getFullYear();
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(showYear && { year: "numeric" }),
  })
}


