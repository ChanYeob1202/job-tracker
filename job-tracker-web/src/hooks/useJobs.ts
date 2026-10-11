"use client";
import { useState, useEffect } from "react";
import type { Job } from "@/types/job";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export function useJobs() {
  const { user, isLoading: authLoading } = useAuth();

  const [rows, setRows] = useState<Job[] | null>(null);

  const router = useRouter();

  //  fetching rows from API

  const loadJobs = async () => {
    const res = await apiFetch(`/jobs`, { cache: "no-store" });

    if (res?.ok) {
      const data = await res.json();
      setRows(data.rows ?? []);
    } else {
      setRows([]);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    (async () => {
      await loadJobs();
    })();
  }, [user, authLoading]);

  const isLoading = rows === null;

  async function updateField(id: string, field: keyof Job,nameValue: string): Promise<void> {

    const res = await apiFetch(`/jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ [field]: nameValue }),
    });

    if (res) {
      const data = (await res.json()) as { row: Job } ;
      setRows((prev) =>
        (prev ?? []).map((r) => (r.id === id ? { ...r, ...data.row } : r)),
      );
    }
    router.refresh();
  }
  return { rows, setRows, loadJobs, isLoading, updateField };
}

  