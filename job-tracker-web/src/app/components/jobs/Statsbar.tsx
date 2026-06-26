"use client";
import { useMemo, useState } from "react";
import { Job } from "@/types/job";
import Link from 'next/link'



type StatsbarProps = {
    apps: Job[];
};

type Stat = {
    label: string;
    value: string | number;
    emoji: string;
    hint?: string;
};

function Statsbar({ apps }: StatsbarProps) {
    // Capture "now" once on mount via a lazy initializer. Reading the clock
    // directly during render (Date.now()) is impure and breaks React's
    // purity rule; this keeps render deterministic.
    const [now] = useState(() => Date.now());

    const stats = useMemo<Stat[]>(() => {
        const total = apps.length;
        const interviewing = apps.filter((a) => a.status.includes("interview")).length;
        const waiting = apps.filter((a) => a.status.includes("waiting")).length;
        const offers = apps.filter((a) => a.status === "offer").length;
        const rejected = apps.filter((a) => a.status === "rejected").length;

        // "Responded" = anything that isn't still just applied/waiting on a reply.
        const responded = interviewing + offers + rejected;
        // "Positive" = made it to an interview or got an offer.
        const positive = interviewing + offers;

        const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

        // Applied within the last 7 days.
        // TODO [ ] : check if Neon returns different date format for "this week".
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const thisWeek = apps.filter(
            (a) => a.applied_at && new Date(a.applied_at).getTime() >= weekAgo
        ).length;

        return [
            { emoji: "📄", label: "Applied", value: total },
            { emoji: "🎯", label: "Interviewing", value: interviewing },
            { emoji: "📍", label: "Waiting", value: waiting },
            { emoji: "✅", label: "Offers", value: offers },
            {
                emoji: "📬",
                label: "Response Rate",
                value: `${pct(responded)}%`,
                hint: "interview · offer · rejected",
            },
            {
                emoji: "⭐",
                label: "Interview Rate",
                value: `${pct(positive)}%`,
                hint: "interview · offer",
            },
            { emoji: "🗓️", label: "This Week", value: `${thisWeek} new` },
        ];
    }, [apps, now]);

    return (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            <Link href="/jobs/new">add job</Link>
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="flex flex-col gap-1 rounded-xl border border-gray-100 bg-white/80 p-4 shadow-sm backdrop-blur-md transition hover:shadow-md"
                >
                    <span className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                        {stat.emoji} {stat.label}
                    </span>
                    <span className="bg-linear-to-r from-brand-600 to-accent-600 bg-clip-text text-2xl font-bold text-transparent">
                        {stat.value}
                    </span>
                    {stat.hint && (
                        <span className="text-[10px] text-gray-400">{stat.hint}</span>
                    )}
                </div>
            ))}
        </div>
    );
}

export default Statsbar;
