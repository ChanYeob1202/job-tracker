import JobsBoard from "./components/JobsBoard";
import type { Job } from "@/types/job";
import { API_BASE } from "@/lib/api";

async function page() {
  const base = API_BASE

  let rows: Job[] = [];

  try {
    const res = await fetch(`${base}/jobs`, { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { rows?: Job[] };
      rows = data.rows ?? [];
      console.log(rows);
    } else {
      console.error("Jobs API returned error", res.status, await res.text().catch(() => ""));
    }

  } catch (err) {
    console.error("Failed to fetch job rows", err);
    // e.g. API not running, wrong host, or network error — avoid breaking the whole route
  }
  return (
    <div className="">
      <div className = "mt-8 p-4">
        <h1 className="text-4xl font-semibold">Job Applications</h1>
        <JobsBoard initialRows={rows} />
      </div>
    </div>
    
  )
}

export default page
