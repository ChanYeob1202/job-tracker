"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation'
import { Job } from "@/types/job";
import type { FormEventHandler } from "react";
import type { JobStatus } from "@/types/job";
import { API_BASE } from "@/lib/api";

type FormType = {
  statusOptions: readonly JobStatus[];
  initialJob? : Job; // when present -> edit mode
};

function JobForm({ statusOptions, initialJob }: FormType) {
  const router = useRouter();
  const [company, setCompany] = useState<string>(initialJob?.company ?? "");
  const [role, setRole] = useState<string>(initialJob?.role ?? "");
  const [ source, setSource ] = useState<string>(initialJob?.source ?? "");
  const [status, setStatus] = useState<JobStatus>(
    initialJob?.status ?? statusOptions[0]
  );
  const [appliedAt, setAppliedAt] = useState<string>(
    initialJob?.applied_at ? initialJob.applied_at.slice (0, 10) : "" 
  );
  const [ website, setWebsite ] = useState<string>(initialJob?.website ? initialJob.website : "")
  const [ location, setLocation ]  = useState<string>(initialJob?.location ? initialJob.location : "")
  const [notes, setNotes] = useState(initialJob?.notes ? initialJob.notes : "");

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (company.trim() === "" || role.trim() === ""){
      alert("Please fill in both the company and role fields.");
      return;
    }

    try {
      const url = initialJob 
        ? `${API_BASE}/jobs/${initialJob.id}`
        : `${API_BASE}/jobs`;
      const res = await fetch(url, {
        method: initialJob ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          role,
          status,
          source,
          applied_at: appliedAt,
          website,
          location,
          notes,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to create job: ${res.status} ${text}`);
      }
      // router.refresh();
      alert("Job created successfully!");
      router.push("/");

    } catch (err) {
      console.error(err);
    }
  };

  const fieldClass =
    "w-full min-w-0 rounded-lg border px-2 py-1 text-black placeholder:text-black";

  return (
    <form
      className="mx-auto flex w-full max-w-xl flex-col gap-4"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-[9rem_1fr] items-center gap-x-4 gap-y-3">
        <label htmlFor="job-company" className="text-sm font-medium">
          Company
        </label>
        <input
          id="job-company"
          type="text"
          className={fieldClass}
          placeholder={initialJob ? initialJob.company : "company name"}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />

        <label htmlFor="job-role" className="text-sm font-medium">
          Role
        </label>
        <input
          id="job-role"
          type="text"
          className={fieldClass}
          placeholder={initialJob ? initialJob.role : "position"}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />

        <label htmlFor="job-url" className = "text-sm font-medium">
          Source
        </label>
        <input
          id ="source"
          type="text" 
          className = {fieldClass} 
          placeholder = { initialJob ? `${initialJob.source}` : "job source"}
          value = {source}
          onChange = {(e) => setSource(e.target.value)}
          />

        <label htmlFor="job-status" className="text-sm font-medium">
          Status
        </label>
        <select
          id="job-status"
          className={fieldClass}
          value={status}
          onChange={(e) => setStatus(e.target.value as JobStatus)}
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <label htmlFor="job-applied" className="text-sm font-medium">
          Applied date
        </label>
        <input
          id="job-applied"
          type="date"
          className={`${fieldClass} max-w-[12rem]`}
          value= {appliedAt}
          onChange={(e) => setAppliedAt(e.target.value)}
        />

        <label htmlFor="job-website" className = "text-sm font-medium">
          Website
        </label>
        <input 
          id="webiste"
          type="url"
          className = {fieldClass}
          value={website}
          placeholder= {initialJob ? `${initialJob.website}` : "website"}
          onChange = {(e) => setWebsite(e.target.value)}
        />
        <label htmlFor="job-location" className = "text-sm font-medium">
          Location
        </label>
        <input 
          id="location"
          type="text"
          className = {fieldClass}
          value={location}
          placeholder= { initialJob ? `${initialJob.location}` : "location"}
          onChange = {(e) => setLocation(e.target.value)}
        />
        <label
          htmlFor="job-notes"
          className="self-start pt-2 text-sm font-medium"
        >
          Notes (optional)
        </label>
        <textarea
          id="job-notes"
          className={`${fieldClass} min-h-[6rem] resize-y`}
          maxLength={600}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="col-span-2 flex justify-end gap-2 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-blue-400 px-4 py-2 text-white font-bold transition-transform duration-150 hover:scale-95 hover:cursor-pointer"
          >
            { initialJob ? "Edit" : "Add" }
          </button>
          <button
            type="button" 
            onClick = {() => router.back()}
            className = "rounded-lg bg-red-400 px-4 py-2 text-white font-bold transition-transform duration-150 hover:scale-95 hover:cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

export default JobForm;
