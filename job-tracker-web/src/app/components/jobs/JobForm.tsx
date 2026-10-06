"use client";
import { useState } from "react";
import type { Job, JobStatus } from "@/types/job";
import { apiFetch } from "@/lib/api";

type FormType = {
  statusOptions: readonly JobStatus[];
  initialJob?: Job;
  onSuccess: () => void;
  onCancel: () => void; 
};

const labelClass = "text-xs font-medium text-gray-600";

const fieldClass =
  "w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 " +
  "placeholder:text-gray-400 outline-none transition hover:border-gray-300 " +
  "focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-gray-50 disabled:text-gray-500";

// Same hues as JobTable's STATUS_STYLE so the form and the table read alike.
const STATUS_ACTIVE: Record<string, string> = {
  applied: "bg-sky-50 text-sky-700 ring-1 ring-sky-300",
  interview: "bg-amber-50 text-amber-700 ring-1 ring-amber-300",
  offer: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300",
  rejected: "bg-rose-50 text-rose-600 ring-1 ring-rose-300",
  "no respond": "bg-slate-100 text-slate-600 ring-1 ring-slate-300",
};
const STATUS_ACTIVE_FALLBACK = "bg-gray-100 text-gray-700 ring-1 ring-gray-300";

type TextFieldProps = {
  id: string;
  label: string;
  type?: "text" | "url" | "date";
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  isSubmitting: boolean;
};

function TextField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  isSubmitting,
}: TextFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        className={fieldClass}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        disabled={isSubmitting}
      />
    </div>
  );
}

function JobForm({ statusOptions, initialJob, onCancel, onSuccess }: FormType) {
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
  const [salary, setSalary] = useState(initialJob?.salary ?? "");
  const [ isSubmitting, setIsSubmitting ] = useState(false);
  const [location, setLocation] = useState(initialJob?.location ?? "");
  const [notes, setNotes] = useState(initialJob?.notes ?? "");

/* 
  TODO: 
    1. add isSubmitting status => inactive submit button. also can retype input when submitting
    2. res.ok === false don't do anything, catch only catches console.error (silent failure)

*/
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (company.trim() === "" || role.trim() === "") {
          alert("Please fill in both the company and role fields.");
          return;
        }

        try {
          setIsSubmitting(true);
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
              salary,
              location,
              notes,
            })
          });
          if (res?.ok) {
            onSuccess();
          }
        } catch (err) {
          console.error(err);
        } finally{
          setIsSubmitting(false);
        }
      }

   
  return (
    <form
      className="mx-auto mt-4 flex w-full max-w-2xl flex-col gap-6 px-2 sm:px-4"
      onSubmit={handleSubmit}
    >
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          {initialJob ? "Edit application" : "New application"}
        </h2>
        <p className="mt-0.5 text-sm text-gray-500">
          {initialJob ? `${initialJob.company} · ${initialJob.role}` : "Track a job you applied to."}
        </p>
      </div>

      <fieldset disabled={isSubmitting} className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-xs font-medium text-gray-600">Status</legend>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((s) => {
            const active = status === s;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                onClick={() => setStatus(s)}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition hover:cursor-pointer ${
                  active ? STATUS_ACTIVE[s] ?? STATUS_ACTIVE_FALLBACK : "text-gray-500 ring-1 ring-gray-200 hover:bg-gray-50"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
        <TextField
          id="job-company"
          label="Company"
          value={company}
          onChange={setCompany}
          placeholder="Airbnb"
          required
          isSubmitting={isSubmitting}
        />
        <TextField
          id="job-role"
          label="Role"
          value={role}
          onChange={setRole}
          placeholder="Software Engineer"
          required
          isSubmitting={isSubmitting}
        />
        <TextField
          id="job-source"
          label="Source"
          value={source}
          onChange={setSource}
          placeholder="LinkedIn, Referral…"
          isSubmitting={isSubmitting}
        />
        <TextField
          id="job-applied"
          label="Applied date"
          type="date"
          value={appliedAt}
          onChange={setAppliedAt}
          isSubmitting={isSubmitting}
        />
        <TextField
          id="job-location"
          label="Location"
          value={location}
          onChange={setLocation}
          placeholder="San Francisco, CA"
          isSubmitting={isSubmitting}
        />
        <TextField
          id="job-salary"
          label="Salary"
          value={salary}
          onChange={setSalary}
          placeholder="$150k"
          isSubmitting={isSubmitting}
        />
        <div className="sm:col-span-2">
          <TextField
            id="job-website"
            label="Website"
            type="url"
            value={website}
            onChange={setWebsite}
            placeholder="https://"
            isSubmitting={isSubmitting}
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="job-notes" className={labelClass}>
            Notes
          </label>
          <textarea
            id="job-notes"
            placeholder="Contacts, interview prep, next steps…"
            className={`${fieldClass} min-h-40 resize-y leading-relaxed`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-600 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving…" : initialJob ? "Save changes" : "Add job"}
        </button>
      </div>
    </form>
  );
}

export default JobForm;
