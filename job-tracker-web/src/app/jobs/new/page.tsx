import JobForm from "@/app/components/JobForm";
import { JOB_STATUS_OPTIONS } from "@/types/job";

export default function NewJobPage() {
  return (
      <div className="">
        <h1 className="text-md font-semibold text-center mb-2">Job Form</h1>
        <JobForm statusOptions={JOB_STATUS_OPTIONS}/>
      </div>
  );
}
