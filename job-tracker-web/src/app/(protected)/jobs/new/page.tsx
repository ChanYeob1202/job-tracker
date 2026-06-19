import JobForm from "@/app/components/jobs/JobForm";
import { JOB_STATUS_OPTIONS } from "@/types/job";

export default function NewJobPage() {
  return (
    <div className="">
      <JobForm statusOptions={JOB_STATUS_OPTIONS} />
    </div>
  );
}
