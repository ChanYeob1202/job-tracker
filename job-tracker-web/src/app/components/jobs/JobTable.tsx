"use client";
import { Dispatch, SetStateAction } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Job } from "@/types/job";
import { apiFetch } from "@/lib/api";
import { JOB_STATUS_OPTIONS } from "@/types/job";
import ActionButton from "../ui/ActionButton";
import EditableCell from "./EditableCell";
import { FaBuilding, FaNetworkWired, FaRegCalendar, FaEarthEurope, FaMagnifyingGlassDollar } from "react-icons/fa6";
import { SiCrowdsource } from "react-icons/si";
import { IoIosArrowDropdown } from "react-icons/io";
import { IoLocation } from "react-icons/io5";
import { CgNotes } from "react-icons/cg";


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
  { key: "actions", label: "" }
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

type JobTableProps = {
  rows: Job[];
  setRows: Dispatch<SetStateAction<Job[] | null>>;
  jobLoadingStatus: boolean;
};

const thClass =
  "border-b border-gray-100 px-4 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap";

const tdClass =
  "border-b border-gray-100 px-4 py-2.5 text-sm text-gray-700 align-middle whitespace-nowrap max-w-[200px] truncate";

function JobTable({ rows, jobLoadingStatus, setRows }: JobTableProps) {

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

  async function deleteField(id: number): Promise<void> {
    const res = await apiFetch(`/jobs/${id}`, {
      method: "DELETE",
    });
    if (res)
      console.log(res);
    setRows((prev) => (prev ?? []).filter((r) => r.id !== id));
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
                <td className={tdClass}>
                  <EditableCell
                    value={row.company}
                    onSave={(v) => updateField(row.id, "company", v)}
                  />
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
                        ? new Date(row.applied_at).toLocaleDateString()
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
                    display={row.salary ?? <span className="text-gray-300">—</span>}
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
                <td className={tdClass}>
                  <ActionButton
                    onEdit={() => router.push(`/jobs/${row.id}/edit`)}
                    onDelete={() => deleteField(row.id)}
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
