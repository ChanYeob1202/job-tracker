"use client";
import { useState } from "react";
import type { ReactNode } from "react";
import type { Job, JobStatus } from "@/types/job";
import { apiFetch } from "@/lib/api";
import { FaBuilding, FaNetworkWired, FaRegCalendar, FaEarthEurope, FaMagnifyingGlassDollar } from "react-icons/fa6";
import { SiCrowdsource } from "react-icons/si";
import { IoIosArrowDropdown } from "react-icons/io";
import { IoLocation } from "react-icons/io5";

type FormType = {
  statusOptions: readonly JobStatus[];
  initialJob?: Job;
  onSuccess: () => void;
  onCancel: () => void; 
};

// Borderless, Notion-style field: transparent by default, a faint gray wash
// only on hover/focus so the value area feels editable without boxing it in.
const fieldClass =
  "w-full min-w-0 rounded-md bg-transparent px-2 py-1 text-sm text-gray-900 " +
  "placeholder:text-gray-400 outline-none transition hover:bg-gray-100/70 focus:bg-gray-100";

type TextFieldProps = {
  id: string;
  label: string;
  icon?: ReactNode;
  type?: "text" | "url" | "date";
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputClassName?: string;
};

function TextField({
  id,
  label,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
  inputClassName,
}: TextFieldProps) {
  return (
    <>
      <label htmlFor={id} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500">
        {icon}
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
  const [location, setLocation] = useState(initialJob?.location ?? "");
  const [notes, setNotes] = useState(initialJob?.notes ?? "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
              salary,
              location,
              notes,
            }),
          });
          if (res?.ok) {
            onSuccess();
          }
        } catch (err) {
          console.error(err);
        }
      }

  return (
    <form
      className="mx-auto mt-2 flex flex-col w-full max-w-xl bg-white p-4"
      onSubmit={handleSubmit}
    >

      <div className="sm:grid grid-cols-[9rem_1fr] items-center gap-x-4 gap-y-1">
        <TextField
          id="job-company"
          label="Company"
          icon={<FaBuilding />}
          value={company}
          onChange={setCompany}
          placeholder={initialJob?.company ?? "company name"}
        />
        <TextField
          id="job-role"
          label="Role"
          icon={<FaNetworkWired />}
          value={role}
          onChange={setRole}
          placeholder={initialJob?.role ?? "position"}
        />
        <TextField
          id="job-source"
          label="Source"
          icon={<SiCrowdsource />}
          value={source}
          onChange={setSource}
          placeholder={initialJob?.source ?? "job source"}
        />

        <label htmlFor="job-status" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500">
          <IoIosArrowDropdown />
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
          icon={<FaRegCalendar />}
          type="date"
          value={appliedAt}
          onChange={setAppliedAt}
          inputClassName={`${fieldClass} max-w-[12rem]`}
        />

        <TextField
          id="job-website"
          label="Website"
          icon={<FaEarthEurope />}
          type="url"
          value={website}
          onChange={setWebsite}
          placeholder={initialJob?.website ?? "website"}
        />
        <TextField
          id="job-salary"
          label="salary"
          icon={<FaMagnifyingGlassDollar />}
          type="text"
          value = {salary}
          onChange = {setSalary}
          placeholder = { initialJob?.salary ?? "salary"}
        />
        <TextField
          id="job-location"
          label="Location"
          icon={<IoLocation />}
          value={location}
          onChange={setLocation}
          placeholder={initialJob?.location ?? "location"}
        />

        <div className="col-span-2 mt-3 border-t border-gray-100 pt-3">
          <textarea
            id="job-notes"
            aria-label="Notes"
            placeholder="Write anything — notes, contacts, next steps…"
            className="w-full min-h-[45vh] resize-y rounded-md bg-transparent px-2 py-1 text-sm leading-relaxed text-gray-900 placeholder:text-gray-400 outline-none transition hover:bg-gray-100/70 focus:bg-gray-100"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="col-span-2 flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit" 
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 hover:cursor-pointer"
          >
            {initialJob ? "Save changes" : "Add Job"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default JobForm;
