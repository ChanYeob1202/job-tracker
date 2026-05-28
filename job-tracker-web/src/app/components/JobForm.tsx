"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Job, JobStatus } from "@/types/job";
import { apiFetch } from "@/lib/api";

/* 
  TODO : when navigating to edit page, the initial input value disappears at /jobs/edit
*/

type FormType = {
  statusOptions: readonly JobStatus[];
  initialJob?: Job; 
};

const fieldClass =
  "w-full min-w-0 rounded-lg border px-2 py-1 text-black placeholder:text-black";

type TextFieldProps = {
  id: string;
  label: string;
  type?: "text" | "url" | "date";
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputClassName?: string;
};

function TextField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  inputClassName,
}: TextFieldProps) {
  return (
    <>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        className={inputClassName ?? fieldClass}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </>
  );
}

function JobForm({ statusOptions, initialJob }: FormType) {
  const router = useRouter();
  const [company, setCompany] = useState(initialJob?.company ?? "");
  const [role, setRole] = useState(initialJob?.role ?? "");
  const [source, setSource] = useState(initialJob?.source ?? "");
  const [status, setStatus] = useState<JobStatus>(
    initialJob?.status ?? statusOptions[0]
  );
  const [appliedAt, setAppliedAt] = useState(
    initialJob?.applied_at?.slice(0, 10) ?? ""
  );
  const [website, setWebsite] = useState(initialJob?.website ?? "");
  const [location, setLocation] = useState(initialJob?.location ?? "");
  const [notes, setNotes] = useState(initialJob?.notes ?? "");

  return (
    <form
      className="mx-auto flex w-full max-w-xl flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (company.trim() === "" || role.trim() === "") {
          alert("Please fill in both the company and role fields.");
          return;
        }

        try {
          const url = initialJob ? `/jobs/${initialJob.id}` : `/jobs`;
          const res = await apiFetch(url, {
            method: initialJob ? "PATCH" : "POST",
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
          if (res) {
            router.push("/");
          }
        } catch (err) {
          console.error(err);
        }
      }}
    >
      <div className="grid grid-cols-[9rem_1fr] items-center gap-x-4 gap-y-3">
        <TextField
          id="job-company"
          label="Company"
          value={company}
          onChange={setCompany}
          placeholder={initialJob?.company ?? "company name"}
        />
        <TextField
          id="job-role"
          label="Role"
          value={role}
          onChange={setRole}
          placeholder={initialJob?.role ?? "position"}
        />
        <TextField
          id="job-source"
          label="Source"
          value={source}
          onChange={setSource}
          placeholder={initialJob?.source ?? "job source"}
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

        <TextField
          id="job-applied"
          label="Applied date"
          type="date"
          value={appliedAt}
          onChange={setAppliedAt}
          inputClassName={`${fieldClass} max-w-[12rem]`}
        />
        <TextField
          id="job-website"
          label="Website"
          type="url"
          value={website}
          onChange={setWebsite}
          placeholder={initialJob?.website ?? "website"}
        />
        <TextField
          id="job-location"
          label="Location"
          value={location}
          onChange={setLocation}
          placeholder={initialJob?.location ?? "location"}
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
            {initialJob ? "Edit" : "Add"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg bg-red-400 px-4 py-2 text-white font-bold transition-transform duration-150 hover:scale-95 hover:cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

export default JobForm;
