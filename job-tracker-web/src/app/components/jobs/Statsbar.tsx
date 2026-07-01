"use client";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Job } from "@/types/job";
import { LuFileText, LuMessageSquare, LuClock, LuPartyPopper, LuTrendingUp, LuCalendarDays, LuChartBar } from "react-icons/lu";

type StatsbarProps = {
    apps: Job[];
};

type Stat = {
    label: string;
    value: string | number;
    icon: ReactNode;
    hint?: string;
};

function Statsbar({ apps }: StatsbarProps) {
    const [now] = useState(() => Date.now());

    const stats = useMemo<Stat[]>(() => {
        const total = apps.length;
        const interviewing = apps.filter((a) => a.status.includes("interview")).length;
        const waiting = apps.filter((a) => a.status.includes("waiting")).length;
        const offers = apps.filter((a) => a.status === "offer").length;
        const rejected = apps.filter((a) => a.status === "rejected").length;

        const responded = interviewing + offers + rejected;
        const positive = interviewing + offers;

        const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const thisWeek = apps.filter(
            (a) => a.applied_at && new Date(a.applied_at).getTime() >= weekAgo
        ).length;

        return [
            { icon: <LuFileText />, label: "Applied", value: total },
            { icon: <LuMessageSquare />, label: "Interviewing", value: interviewing },
            { icon: <LuClock />, label: "Waiting", value: waiting },
            { icon: <LuPartyPopper />, label: "Offers", value: offers },
            {
                icon: <LuChartBar />,
                label: "Response Rate",
                value: `${pct(responded)}%`,
                hint: "interview · offer · rejected",
            },
            {
                icon: <LuTrendingUp />,
                label: "Interview Rate",
                value: `${pct(positive)}%`,
                hint: "interview · offer",
            },
            { icon: <LuCalendarDays />, label: "This Week", value: thisWeek },
        ];
    }, [apps, now]);

    const countStats = stats.slice(0, 4);
    const rateStats = stats.slice(4);

    return (
        <div className="mt-2 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            {/* Row 1 — counts */}
            <div className="grid grid-cols-4 divide-x divide-gray-100">
                {countStats.map((stat) => (
                    <div key={stat.label} className="flex flex-col gap-1.5 px-6 py-4">
                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                            {stat.icon}
                            {stat.label}
                        </span>
                        <span className="text-2xl font-semibold tracking-tight text-gray-800">
                            {stat.value}
                        </span>
                    </div>
                ))}
            </div>
            {/* Row 2 — rates + this week */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100 bg-gray-50/50">
                {rateStats.map((stat) => (
                    <div key={stat.label} className="flex items-center gap-4 px-6 py-3">
                        <span className="flex items-center gap-1.5 text-xs text-gray-400 whitespace-nowrap">
                            {stat.icon}
                            {stat.label}
                        </span>
                        <span className="text-base font-semibold text-gray-700">
                            {stat.value}
                        </span>
                        {stat.hint && (
                            <span className="text-[10px] text-gray-300 hidden sm:block">{stat.hint}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Statsbar;
