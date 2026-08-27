export type JobStatus =
  | "applied"
  | "interview"
  | "offer"
  | "rejected"
  | "no respond"



/** Real job statuses offered in forms and the table editor. First value ("applied") is the create default. */
export const JOB_STATUS_OPTIONS: readonly JobStatus[] = [
  "applied",
  "interview",
  "offer",
  "rejected",
  "no respond"
];

export type StatusFilterValue = JobStatus | "all";

/** Options for the status filter dropdown — the real statuses, no "all" entry. */
export const JOB_STATUS_FILTERS: readonly StatusFilterValue[] = ["all", ...JOB_STATUS_OPTIONS] ;

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