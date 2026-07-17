export type JobStatus =
  | "all"
  | "applied"
  | "interview"
  // | "interview 1"
  // | "interview 2"
  // | "interview 3"
  | "offer"
  | "rejected";

/** Status values offered in forms, table editor, and filters (subset of JobStatus). */
export const JOB_STATUS_OPTIONS: readonly JobStatus[] = [
  "all",
  "applied",
  "interview",
  "offer",
  "rejected",
];

export interface Job {
  id: number;
  company: string;
  status: JobStatus;
  source: string; 
  role: string;
  salary: string;
  notes: string | null;
  applied_at: string;
  website: string;
  location: string;
  is_favorite: boolean;
}



  // "rejected":    "bg-rose-50 text-rose-600 ring-1 ring-rose-200",