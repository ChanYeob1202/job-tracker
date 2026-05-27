"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Job } from "@/types/job";
import { apiFetch } from "@/lib/api";
import { JOB_STATUS_OPTIONS } from "@/types/job";
import ActionButton from "./ui/ActionButton";
import EditableCell from "./EditableCell";
import { useAuth } from "@/context/AuthContext";


const TABLE_COLUMNS: readonly { key: string; label: string }[] = [
  { key: "company", label: "Company" },
  { key: "role", label: "Role" },
  { key: "source", label: "Source"},
  { key: "status", label: "Status" },
  { key: "applied_at", label: "Applied Date" },
  { key: "website", label: "Website" },
  { key: "location", label: "Location" },
  { key: "notes", label: "Notes" },
  { key: "actions", label: ""}
];

type JobTableProps = {
  rows: Job[];
};

const thClass =
  "border-b border-gray-300 bg-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900 whitespace-nowrap";

const tdClass =
  "border-b border-gray-200 px-4 py-3 text-sm text-gray-800 align-top whitespace-nowrap max-w-[200px] truncate";

function JobTable({ rows: initialRows }: JobTableProps) {
  
  const [rows, setRows] = useState<Job[]>(initialRows);
  const router = useRouter();
  const isLoading = useAuth();


  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRows(initialRows);
  }, [initialRows]);

  async function updateField(
    id: number,
    field: keyof Job,
    newValue: string
  ): Promise<void> {
    const res = await apiFetch(`/jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ [field]: newValue }),
    });

    if(res){
      const data = (await res.json()) as { row: Job };
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...data.row } : r))
      );
    }
    router.refresh();
  }

  async function deleteField(id: number):Promise<void>{
    const res = await apiFetch(`/jobs/${id}`, {
      method:"DELETE",
    });
    if(res)
    console.log(res);
    setRows((prev) => prev.filter((r)=> r.id !== id));
  }

  return (
    <div className="mt-4 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-max table-auto border-collapse">
        <thead>
          <tr>
            {TABLE_COLUMNS.map(({ key, label }) => (
              <th key={key} className={thClass}>
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
                className="px-4 py-6 text-center text-sm text-gray-500"
              >
                { isLoading ? "Loading..."  : "No application yet"}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
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
                <td className = {tdClass}>
                  <EditableCell 
                    value = {row.source}
                    onSave= {(v) => updateField(row.id, "source", v)}
                  />
                </td>
                <td className={tdClass}>
                  <EditableCell
                    value={row.status}
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
                        : "-"
                    }
                    onSave={(v) => updateField(row.id, "applied_at", v)}
                  />
                </td>
                <td className = {tdClass}>
                  <EditableCell
                    value={row.website ?? ""}
                    type="url"
                    display = {row.website ?? ""}
                    onSave = {(v) => updateField(row.id, "website", v)}
                  />
                </td>
                <td className = {tdClass}>
                  <EditableCell 
                    value = {row.location ?? ""}
                    display = {row.location ?? ""}
                    onSave = {(v) => updateField(row.id, "location", v)}
                  />
                </td>

                <td className={tdClass}>
                  <EditableCell
                    value={row.notes ?? ""}
                    display={row.notes ?? "-"}
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
