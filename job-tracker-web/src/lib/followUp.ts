import type { Job } from "@/types/job";

export const DAY_MS = 86_400_000;
// follow-up is due this many days after the last status change / follow-up
export const FOLLOW_UP_INTERVAL_DAYS = 14;
// jobs enter the queue this many days before they're due
export const FOLLOW_UP_NOTICE_DAYS = 5;

export type DueStatus = "overdue" | "today" | "upcoming";

export const followUpInfo = (job: Job, now: number) => {
  if (!job.last_followed_up_at) {
    job.last_followed_up_at = job.status_changed_at;
  }

  const statusChangedAt = new Date(job.status_changed_at).getTime();
  const lastFollowedUp = new Date(job.last_followed_up_at).getTime();

  const company = job.company;
  const role = job.role;

  const base = Math.max(statusChangedAt, lastFollowedUp);
  const dueDate = base + DAY_MS * FOLLOW_UP_INTERVAL_DAYS;
  const daysUntilDueDate = Math.floor((dueDate - now) / DAY_MS);

  // upcoming: > 0 / today: 0 / overdue: < 0
  // no upper bound on upcoming — the queue filter already limits it to FOLLOW_UP_NOTICE_DAYS
  let dueStatus: DueStatus;
  let dueLabel: string;

  if (daysUntilDueDate > 0) {
    dueStatus = "upcoming";
    dueLabel = `Check in soon · in ${daysUntilDueDate} ${daysUntilDueDate === 1 ? "day" : "days"}`;
  } else if (daysUntilDueDate === 0) {
    dueStatus = "today";
    dueLabel = "Good time to check in · today";
  } else {
    // count from the last update (status change or follow-up), not the due date —
    // always >= FOLLOW_UP_INTERVAL_DAYS here, so no singular case
    const daysSinceUpdate = Math.floor((now - base) / DAY_MS);
    dueStatus = "overdue";
    dueLabel = `Still waiting? · no update in ${daysSinceUpdate} days`;
  }

  return { company, role, dueDate, daysUntilDueDate, dueStatus, dueLabel };
};

export const formatDueDate = (ms: number): string => {
  const date = new Date(ms);
  // only show the year when it isn't the current one (e.g. due date rolls into next year)
  const showYear = date.getFullYear() !== new Date().getFullYear();
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(showYear && { year: "numeric" }),
  });
};
