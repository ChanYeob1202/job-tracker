import type { Job } from "@/types/job"

export const followUpInfo = (job: Job, now: number) => {

  if (!job.last_followed_up_at) {
    job.last_followed_up_at = job.status_changed_at;
  }

  const statusChangedAt = new Date(job.status_changed_at).getTime();
  const lastFollowedUp = new Date(job.last_followed_up_at).getTime();

  const company = job.company;
  const role = job.role;

  const base = Math.max(statusChangedAt, lastFollowedUp);
  const dueDate = base + 14;
  const daysUntilDueDate = (dueDate - now);

  return { company, role, dueDate, daysUntilDueDate };
}

export const formatDueDate = (ms: number): string => {
  const date = new Date(ms);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", })
}
