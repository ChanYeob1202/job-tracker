"use client";
import { Dispatch, SetStateAction, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Job } from "@/types/job";
import { apiFetch } from "@/lib/api";
import { JOB_STATUS_OPTIONS } from "@/types/job";
import EditableCell from "./EditableCell";
import { FaBuilding, FaNetworkWired, FaRegCalendar, FaEarthEurope, FaMagnifyingGlassDollar } from "react-icons/fa6";
import { SiCrowdsource } from "react-icons/si";
import { IoIosArrowDropdown } from "react-icons/io";
import { IoLocation } from "react-icons/io5";
import { CgNotes } from "react-icons/cg";
import { LuPanelRight } from "react-icons/lu";


const TABLE_COLUMNS: readonly { key: string; label: string; icon?: ReactNode }[] = [
  { key: "company", label: "Company", icon: <FaBuilding /> },
  { key: "role", label: "Role", icon: <FaNetworkWired /> },
  { key: "source", label: "Source", icon: <SiCrowdsource /> },
  { key: "status", label: "Status", icon: <IoIosArrowDropdown /> },
  { key: "applied_at", label: "Applied Date", icon: <FaRegCalendar /> },
  { key: "website", label: "Website", icon: <FaEarthEurope /> },
  { key: "salary", label: "Salary", icon: <FaMagnifyingGlassDollar /> },
  { key: "location", label: "Location", icon: <IoLocation /> },
  { key: "notes", label: "Notes", icon: <CgNotes /> },
];

const STATUS_STYLE: Record<string, string> = {
  "applied":     "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  "waiting":     "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
  "interview 1": "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  "interview 2": "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  "interview 3": "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  "offer":       "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  "rejected":    "bg-rose-50 text-rose-600 ring-1 ring-rose-200",
};

// Known job-source brands → a pill hue echoing their brand color, so rows are
// scannable by where you applied. The raw source is normalized to letters+digits
// only (lowercase, spaces/punctuation stripped) before matching, so "Linked In",
// "linkedin", "Applied via LinkedIn" all collapse to the same key. Match tokens
// are kept short and distinctive so common typos still hit — e.g. "zip" catches
// both "ZipRecruiter" and "Zip Recourter". Unknown sources fall back to neutral
// gray, which also means a wrong source is simply gray, never mis-colored.
// NOTE: class strings must stay full literals so Tailwind's JIT keeps them.
const SOURCE_BRANDS: readonly { match: string; className: string }[] = [
  { match: "linkedin",  className: "bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
  { match: "zip",       className: "bg-green-50 text-green-700 ring-1 ring-green-200" },
  { match: "indeed",    className: "bg-white text-gray-700 ring-1 ring-gray-300" },
  { match: "glassdoor", className: "bg-teal-50 text-teal-700 ring-1 ring-teal-200" },
  { match: "wellfound", className: "bg-slate-100 text-slate-700 ring-1 ring-slate-300" },
  { match: "angellist", className: "bg-slate-100 text-slate-700 ring-1 ring-slate-300" },
  { match: "handshake", className: "bg-slate-100 text-slate-700 ring-1 ring-slate-300" },
  { match: "monster",   className: "bg-purple-50 text-purple-700 ring-1 ring-purple-200" },
  { match: "dice",      className: "bg-red-50 text-red-700 ring-1 ring-red-200" },
  { match: "refer",     className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
];

const SOURCE_NEUTRAL = "bg-gray-100 text-gray-600 ring-1 ring-gray-200";

function sourceStyle(raw: string): string {
  const s = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!s) return SOURCE_NEUTRAL;
  return SOURCE_BRANDS.find((b) => s.includes(b.match))?.className ?? SOURCE_NEUTRAL;
}

// Applied date: recent applications (≤7 days) get a brand dot and darker text;
// older ones dim to gray, so "what did I apply to this week" pops out — the same
// idea the Statsbar's "This Week" count surfaces numerically.
function AppliedDate({ iso }: { iso: string }) {
  // Snapshot "now" once on mount — reading the clock during render is impure
  // (react-hooks/purity). A lazy useState pins it, same trick as JobPageNav.
  const [now] = useState(() => Date.now());
  const d = new Date(iso);
  const days = (now - d.getTime()) / 86_400_000;
  const recent = days <= 7;
  return (
    <span className={recent ? "text-gray-700" : "text-gray-400"}>
      {recent && (
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-500 align-middle" />
      )}
      {d.toLocaleDateString()}
    </span>
  );
}

type JobTableProps = {
  rows: Job[];
  setRows: Dispatch<SetStateAction<Job[] | null>>;
  jobLoadingStatus: boolean;
  setEditorJob: Dispatch<SetStateAction<Job | "new" | null>>;
};

const thClass =
  "border-b border-gray-100 px-4 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap";

const tdClass =
  "border-b border-gray-100 px-4 py-2.5 text-sm text-gray-700 align-middle whitespace-nowrap max-w-[200px] truncate";

function JobTable({ rows, jobLoadingStatus, setRows, setEditorJob }: JobTableProps) {

  const router = useRouter();

  async function updateField(
    id: number,
    field: keyof Job,
    newValue: string
  ): Promise<void> {
    const res = await apiFetch(`/jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ [field]: newValue }),
    });

    if (res) {
      const data = (await res.json()) as { row: Job };
      setRows((prev) =>
        (prev ?? []).map((r) => (r.id === id ? { ...r, ...data.row } : r))
      );
    }
    router.refresh();
  }

  return (
    <div className="mt-2 overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full min-w-max table-auto border-collapse">
        <thead>
          <tr className="bg-gray-50/70">
            {TABLE_COLUMNS.map(({ key, label, icon }) => (
              <th key={key} className={thClass}>
                <span className="inline-flex items-center gap-1.5 text-gray-400">
                  {icon}
                  {label}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={TABLE_COLUMNS.length}
                className="px-4 py-12 text-center text-sm text-gray-400"
              >
                {jobLoadingStatus ? "Loading…" : "No applications yet"}
              </td>
            </tr>
          ) : (
            rows.map((row: Job) => (
              <tr key={row.id} className="group transition-colors duration-100 hover:bg-gray-50/60">
                <td className={`flex flex-row items-center group/cell ${tdClass}`} >
                  <EditableCell
                    value={row.company}
                    onSave={(v) => updateField(row.id, "company", v)}
                  />
                  <button
                    type="button"
                    onClick={() => setEditorJob(row)}
                    className="ml-auto inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover/cell:opacity-100 hover:bg-gray-700 cursor-pointer"
                  >
                    <LuPanelRight className="text-sm" />
                    OPEN
                  </button>
                </td>
                <td className={tdClass}>
                  <EditableCell
                    value={row.role}
                    onSave={(v) => updateField(row.id, "role", v)}
                  />
                </td>
                <td className={tdClass}>
                  <EditableCell
                    value={row.source}
                    display={
                      row.source ? (
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${sourceStyle(row.source)}`}>
                          {row.source}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )
                    }
                    onSave={(v) => updateField(row.id, "source", v)}
                  />
                </td>
                <td className={tdClass}>
                  <EditableCell
                    value={row.status}
                    display={
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[row.status]}`}>
                        {row.status}
                      </span>
                    }
                    type="select"
                    options={JOB_STATUS_OPTIONS}
                    onSave={(v) => updateField(row.id, "status", v)}
                  />
                </td>
                <td className={tdClass}>
                  <EditableCell
                    value={row.applied_at ? row.applied_at.slice(0, 10) : ""}
                    type="date"
                    display={
                      row.applied_at
                        ? <AppliedDate iso={row.applied_at} />
                        : <span className="text-gray-300">—</span>
                    }
                    onSave={(v) => updateField(row.id, "applied_at", v)}
                  />
                </td>
                <td className={tdClass}>
                  <EditableCell
                    value={row.website ?? ""}
                    type="url"
                    display={row.website ?? <span className="text-gray-300">—</span>}
                    onSave={(v) => updateField(row.id, "website", v)}
                  />
                </td>
                <td className={tdClass}>
                  <EditableCell
                    value={row.salary ?? ""}
                    type="text"
                    display={
                      row.salary
                        ? <span className="font-medium text-gray-900 tabular-nums">{row.salary}</span>
                        : <span className="text-gray-300">—</span>
                    }
                    onSave={(v) => updateField(row.id, "salary", v)}
                  />
                </td>
                <td className={tdClass}>
                  <EditableCell
                    value={row.location ?? ""}
                    display={row.location ?? <span className="text-gray-300">—</span>}
                    onSave={(v) => updateField(row.id, "location", v)}
                  />
                </td>
                <td className={tdClass}>
                  <EditableCell
                    value={row.notes ?? ""}
                    display={row.notes ?? <span className="text-gray-300">—</span>}
                    onSave={(v) => updateField(row.id, "notes", v)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default JobTable;
