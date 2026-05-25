"use client";
import { useRouter } from "next/navigation";

/* 
  *Todo
- [ ] : add sign out button if user logged in 
- [ ] change layout - display Header (Job, add job) only when signed in 
- [ ] figure out how to handle home page ( signed in || guest )
*/

export default function JobPageNav() {
  const router = useRouter();

  return (
    <nav className="relative z-10 flex flex-wrap items-baseline gap-4 pb-4 border-b font-bold">
      <h1 className="text-lg">
        <div
          onClick={() => router.push("/")}
          className="hover:cursor-pointer hover:opacity-70"
        >
          Jobs
        </div>
      </h1>
      <div
        onClick={() => router.push("/jobs/new")}
        className="hover:cursor-pointer hover:opacity-70"
      >
        Add Job
      </div>
    </nav>
  );
}
