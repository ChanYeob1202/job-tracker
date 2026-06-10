export type JobStatus =
  | "applied"
  | "interview"
  | "interview 1"
  | "interview 2"
  | "interview 3"
  | "waiting"
  | "offer"
  | "rejected";

/** Status values offered in forms, table editor, and filters (subset of JobStatus). */
export const JOB_STATUS_OPTIONS: readonly JobStatus[] = [
  "applied",
  "interview",
  "interview 1",
  "interview 2",
  "interview 3",
  "waiting",
  "offer",
  "rejected",
];

export interface Job {
  id: number;
  company: string;
  status: JobStatus;
  source: string; 
  role: string;
  notes: string | null;
  applied_at: string;
  website: string;
  location: string;
}
