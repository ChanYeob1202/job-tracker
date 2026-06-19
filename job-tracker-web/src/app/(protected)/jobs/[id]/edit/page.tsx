"use client"
import { use, useState, useEffect } from "react";
import JobForm from "@/app/components/jobs/JobForm";
import { apiFetch } from "@/lib/api";
import { JOB_STATUS_OPTIONS, type Job } from "@/types/job";

type Props = {
  params: Promise<{ id: string }>;
};

function Page({ params }: Props) {
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    apiFetch(`/jobs/${id}`, { method: "GET" })
      .then((res) => res?.json())
      .then((data) => {
        console.log(data)
        if (data?.row) setJob(data.row);
      });
  }, [id]);

  if (!job) return <p>Loading…</p>;

  return (
    <div>
      <JobForm 
      statusOptions={JOB_STATUS_OPTIONS} 
      initialJob={job} />
    </div>
  );
}

export default Page;
