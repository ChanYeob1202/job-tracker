import type { Job } from "@/types/job"
const DAY_MS = 86_400_000;


export const followUpInfo = (job: Job, now: number) => {

  if (!job.last_followed_up_at) {
    job.last_followed_up_at = job.status_changed_at;
  }

  const statusChangedAt = new Date(job.status_changed_at).getTime();
  const lastFollowedUp = new Date(job.last_followed_up_at).getTime();

  const company = job.company;
  const role = job.role;

  const base = Math.max(statusChangedAt, lastFollowedUp);
  // 86400000 -> 1 day / 14days = 86400000 * 14
  const dueDate = base + ( DAY_MS * 14);
  // queue standard =  before 5 days
  const daysUntilDueDate = Math.floor((dueDate - now)/ DAY_MS);



  return { company, role, dueDate, daysUntilDueDate };
}

export const formatDueDate = (ms: number): string => {
  const date = new Date(ms);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", })
}
