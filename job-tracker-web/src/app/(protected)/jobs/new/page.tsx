"use client"
import JobForm from "@/app/components/jobs/JobForm";
import { useRouter } from "next/navigation";
import { JOB_STATUS_OPTIONS } from "@/types/job";

export default function NewJobPage() {
  const router = useRouter();

  const onSuccess = () => {
    router.push("/")
  }

  const onCancel = () => {
    router.back();
  }

  
  return (
    <div className="">
      <JobForm 
        statusOptions={JOB_STATUS_OPTIONS} 
        onSuccess = { onSuccess }
        onCancel = {onCancel}
        />
    </div>
  );
}
