import JobForm from "@/app/components/JobForm";
import { API_BASE } from "@/lib/api";
import { JOB_STATUS_OPTIONS } from "@/types/job";

type Props = {
  params: Promise<{ id: string }>;
};

async function page({ params }: Props) {
  // needs to fetch data with id
  const { id } = await params;
  const res = await fetch (`${API_BASE}/jobs/${id}`, { cache:"no-store"});
  const { row } = await res.json();
  console.log(row);

  return (
    <div>
      <h1 className="text-md font-semibold text-center mb-2">Edit job </h1>
      <JobForm 
        statusOptions={JOB_STATUS_OPTIONS} 
        initialJob={row} />
  </div>
  )
}

export default page
