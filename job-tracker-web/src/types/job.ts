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
  "interview 1",
  "interview 2",
  "interview 3",
  "waiting",
  "rejected",
];

export interface Job {
  id: number;
  company: string;
  title: string;
  status: JobStatus;
  role: string;
  notes: string | null;
  applied_at: string;
}
