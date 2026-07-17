"use client";
import { useMemo } from "react";
import type { ReactNode } from "react";
import { Job } from "@/types/job";
import { LuFileText, LuMessageSquare, LuCircleX, LuPartyPopper } from "react-icons/lu";

type StatsbarProps = {
    apps: Job[];
};

type Stat = {
    label: string;
    value: string | number;
    icon: ReactNode;
    iconClass?: string;
};

function Statsbar({ apps }: StatsbarProps) {
    const stats = useMemo<Stat[]>(() => {
        const total = apps.length;
        const interviewing = apps.filter((a) => a.status.includes("interview")).length;
        const offers = apps.filter((a) => a.status === "offer").length;
        const rejected = apps.filter((a) => a.status === "rejected").length

        return [
            { icon: <LuFileText />, label: "Applied", value: total, iconClass: "bg-blue-50 text-blue-500" },
            { icon: <LuMessageSquare />, label: "Interviewing", value: interviewing, iconClass: "bg-violet-50 text-violet-500" },
            { icon: <LuPartyPopper />, label: "Offers", value: offers, iconClass: "bg-emerald-50 text-emerald-500" },
           { icon: <LuCircleX />, label: "Rejected", value: rejected, iconClass: "bg-rose-50 text-rose-500" }

        ];
    }, [apps]);

    return (
        <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm sm:px-6 sm:py-4"
                >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${stat.iconClass ?? "bg-gray-50 text-gray-400"}`}>
                        {stat.icon}
                    </span>
                    <span className="flex flex-col">
                        <span className="text-xs text-gray-400">{stat.label}</span>
                        <span className="text-2xl font-semibold tracking-tight text-gray-800">
                            {stat.value}
                        </span>
                    </span>
                </div>
            ))}
        </div>
    );
}

export default Statsbar;
