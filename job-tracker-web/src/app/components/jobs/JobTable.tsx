"use client";
import { Dispatch, SetStateAction } from "react";
import type { Job, JobStatus } from "@/types/job";
import { JOB_STATUS_OPTIONS } from "@/types/job";
import EditableCell from "./EditableCell";
import CompanyAvatar from "./CompanyAvatar";
import { FaEarthEurope } from "react-icons/fa6";
import { IoLocationOutline } from "react-icons/io5";
import { LuPanelRight } from "react-icons/lu";

// Card-row layout: each application is its own floating card (border-separate
// + vertical spacing) instead of a gridline spreadsheet. Company and role are
// stacked into one "identity" column, so the eye scans one column to know
// *who* and the status rail on the left to know *where it stands*.
const TABLE_COLUMNS: readonly { key: string; label: string; align?: "right" }[] = [
  { key: "company", label: "Application" },
  { key: "status", label: "Stage" },
  { key: "applied_at", label: "Applied" },
  { key: "source", label: "Source" },
  { key: "salary", label: "Salary", align: "right" },
  { key: "location", label: "Location" },
  { key: "website", label: "Website" },
];

// One entry per status: the left rail colour, the pill, and the dot inside it.
// Kept as full literal class strings so Tailwind's scanner can see them.
// "no respond" stays the quietest — a ghosted application is a non-event.
const STATUS_THEME: Record<JobStatus, { rail: string; pill: string; dot: string; step: number }> = {
  "applied": { rail: "bg-sky-400", pill: "bg-sky-50 text-sky-700", dot: "bg-sky-500", step: 1 },
  "interview": { rail: "bg-amber-400", pill: "bg-amber-50 text-amber-700", dot: "bg-amber-500", step: 2 },
  "offer": { rail: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", step: 3 },
  "rejected": { rail: "bg-rose-300", pill: "bg-rose-50 text-rose-600", dot: "bg-rose-400", step: 0 },
  "no respond": { rail: "bg-slate-200", pill: "bg-slate-100 text-slate-500", dot: "bg-slate-400", step: 0 },
};

// Statuses in the DB but not in the map (e.g. legacy "interview 1").
const STATUS_FALLBACK = { rail: "bg-gray-200", pill: "bg-gray-100 text-gray-600", dot: "bg-gray-400", step: 0 };

function statusTheme(status: string) {
  return STATUS_THEME[status as JobStatus] ?? STATUS_FALLBACK;
}

const SOURCE_BRANDS: readonly { match: string; className: string }[] = [
  { match: "linkedin", className: "text-blue-700" },
  { match: "zip", className: "text-green-700" },
  { match: "indeed", className: "text-indigo-700" },
  { match: "glassdoor", className: "text-teal-700" },
  { match: "wellfound", className: "text-slate-700" },
  { match: "angellist", className: "text-slate-700" },
  { match: "handshake", className: "text-slate-700" },
  { match: "monster", className: "text-purple-700" },
  { match: "dice", className: "text-red-700" },
  { match: "refer", className: "text-amber-700" },
];

function sourceStyle(raw: string): string {
  const s = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
  return SOURCE_BRANDS.find((b) => s && s.includes(b.match))?.className ?? "text-gray-600";
}

// iso is a plain "YYYY-MM-DD" (Postgres DATE, no time-of-day, no timezone).
// Formats it straight from the string — no Date object, so no timezone can
// shift the day. Never feed a date-only string to `new Date()` for display:
// JS parses it as UTC midnight, which local-shifts to the previous day west
// of UTC (this is the exact bug 004_applied_at_to_date.sql was written to fix).
function formatAppliedDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${Number(month)}/${Number(day)}/${year}`;
}

// How many days ago `iso` ("YYYY-MM-DD") was, counting from right now.
// Both sides are plain millisecond counts, so no timezone conversion happens.
function daysSince(iso: string): number {
  const appliedMs = new Date(iso).getTime();
  const nowMs = Date.now();
  return (nowMs - appliedMs) / 86_400_000;
}

function AppliedDate({ iso }: { iso: string }) {
  const recent = daysSince(iso) <= 7;
  return (
    <span className={recent ? "text-gray-700" : "text-gray-400"}>
      {recent && (
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-500 align-middle" />
      )}
      {formatAppliedDate(iso)}
    </span>
  );
}

// Three-segment pipeline (applied → interview → offer). Terminal statuses
// (rejected / no respond) have step 0 and render an empty, muted track.
function StageTrack({ status }: { status: string }) {
  const { step, dot } = statusTheme(status);
  return (
    <span className="mt-1.5 flex gap-0.5" aria-hidden>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`h-1 w-5 rounded-full ${n <= step ? dot : "bg-gray-200"}`}
        />
      ))}
    </span>
  );
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const Dash = () => <span className="text-gray-300">—</span>;

type JobTableProps = {
  rows: Job[];
  jobLoadingStatus: boolean;
  setEditorJob: Dispatch<SetStateAction<Job | "new" | null>>;
  updateField: (id: string, field: keyof Job, nameValue: string) => Promise<void>;
};

const thClass =
  "px-3 md:px-4 pb-1 pt-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap";

// With border-separate, the card is drawn by the cells: every cell gets the
// top/bottom border, the first/last cell close the left/right side + radius.
const tdClass =
  "border-y border-gray-100 bg-white px-3 md:px-4 py-3 text-sm text-gray-700 align-middle whitespace-nowrap max-w-[200px] truncate transition-colors group-hover:bg-brand-50/40 group-hover:border-brand-100";

function JobTable({ rows, jobLoadingStatus, setEditorJob, updateField }: JobTableProps) {
  return (
    <div className="mt-2 overflow-x-auto rounded-2xl bg-black/[0.03] p-2 md:p-3">
      <table className="w-full min-w-max table-auto border-separate border-spacing-y-1.5">
        <thead>
          <tr>
            {TABLE_COLUMNS.map(({ key, label, align }) => (
              <th key={key} className={`${thClass} ${align === "right" ? "text-right" : ""}`}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={TABLE_COLUMNS.length}
                className="rounded-xl bg-white px-4 py-12 text-center text-sm text-gray-400"
              >
                {jobLoadingStatus ? "Loading…" : "No applications yet"}
              </td>
            </tr>
          ) : (
            rows.map((row: Job) => {
              const theme = statusTheme(row.status);
              const muted = row.status === "rejected" || row.status === "no respond";
              return (
                <tr key={row.id} className="group">
                  {/* Identity: status rail + monogram + company / role stacked */}
                  <td className={`${tdClass} relative overflow-hidden rounded-l-xl border-l pl-5 md:pl-5 max-w-[260px]`}>
                    <span className={`absolute inset-y-0 left-0 w-1 ${theme.rail}`} />
                    <div className={`flex items-center gap-3 ${muted ? "opacity-60" : ""}`}>
                      <CompanyAvatar company={row.company} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-gray-900">
                          <EditableCell
                            value={row.company}
                            onSave={(v) => updateField(row.id, "company", v)}
                          />
                        </div>
                        <div className="truncate text-xs text-gray-500">
                          <EditableCell
                            value={row.role ?? ""}
                            display={row.role || <span className="text-gray-300">Add role</span>}
                            onSave={(v) => updateField(row.id, "role", v)}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Overlays the end of the company cell on row hover, so it's
                        reachable without scrolling the table to the right. */}
                    <button
                      type="button"
                      onClick={() => setEditorJob(row)}
                      aria-label={`Open ${row.company}`}
                      className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-md bg-gray-800 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:bg-gray-700 cursor-pointer"
                    >
                      <LuPanelRight className="text-sm" />
                      OPEN
                    </button>
                  </td>

                  <td className={`${tdClass} overflow-visible`}>
                    <EditableCell
                      value={row.status}
                      display={
                        <span className="inline-flex flex-col">
                          <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${theme.pill}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
                            {row.status}
                          </span>
                          <StageTrack status={row.status} />
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
                      display={row.applied_at ? <AppliedDate iso={row.applied_at.slice(0, 10)} /> : <Dash />}
                      onSave={(v) => updateField(row.id, "applied_at", v)}
                    />
                  </td>

                  <td className={tdClass}>
                    <EditableCell
                      value={row.source}
                      display={
                        row.source ? (
                          <span className={`text-xs font-semibold ${sourceStyle(row.source)}`}>
                            {row.source}
                          </span>
                        ) : (
                          <Dash />
                        )
                      }
                      onSave={(v) => updateField(row.id, "source", v)}
                    />
                  </td>

                  <td className={`${tdClass} text-right`}>
                    <EditableCell
                      value={row.salary ?? ""}
                      display={
                        row.salary ? (
                          <span className="block text-right font-semibold tabular-nums text-gray-900">{row.salary}</span>
                        ) : (
                          <span className="block text-right"><Dash /></span>
                        )
                      }
                      onSave={(v) => updateField(row.id, "salary", v)}
                    />
                  </td>

                  <td className={tdClass}>
                    <EditableCell
                      value={row.location ?? ""}
                      display={
                        row.location ? (
                          <span className="inline-flex items-center gap-1 text-gray-600">
                            <IoLocationOutline className="shrink-0 text-gray-400" />
                            {row.location}
                          </span>
                        ) : (
                          <Dash />
                        )
                      }
                      onSave={(v) => updateField(row.id, "location", v)}
                    />
                  </td>

                  <td className={`${tdClass} rounded-r-xl border-r`}>
                    <EditableCell
                      value={row.website ?? ""}
                      type="url"
                      display={
                        row.website ? (
                          <span className="inline-flex items-center gap-1">
                            <FaEarthEurope className="shrink-0 text-xs" />
                            {hostname(row.website)}
                          </span>
                        ) : (
                          <Dash />
                        )
                      }
                      onSave={(v) => updateField(row.id, "website", v)}
                    />
                  </td>

                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default JobTable;
