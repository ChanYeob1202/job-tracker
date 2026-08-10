export type JobStatus =
  | "applied"
  | "interview"
  | "offer"
  | "rejected";

/** Real job statuses offered in forms and the table editor. First value ("applied") is the create default. */
export const JOB_STATUS_OPTIONS: readonly JobStatus[] = [
  "applied",
  "interview",
  "offer",
  "rejected",
];

/** The status filter now maps 1:1 to real statuses — there is no "show all" view. */
export type StatusFilterValue = JobStatus;

/** Options for the status filter dropdown — the real statuses, no "all" entry. */
export const JOB_STATUS_FILTERS: readonly StatusFilterValue[] = JOB_STATUS_OPTIONS;

export interface Job {
  id: number;
  company: string;
  status: JobStatus;
  source: string; 
  role: string | null;
  salary: string;
  notes: string | null;
  applied_at: string;
  website: string;
  location: string;
  is_favorite: boolean;
}

  // "rejected":    "bg-rose-50 text-rose-600 ring-1 ring-rose-200",