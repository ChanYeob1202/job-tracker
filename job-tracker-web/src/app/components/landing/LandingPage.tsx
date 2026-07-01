"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { FaBuilding, FaNetworkWired, FaRegCalendar } from "react-icons/fa6";
import { SiCrowdsource } from "react-icons/si";
import { IoIosArrowDropdown } from "react-icons/io";

function LandingPage() {
  const { loginDemo } = useAuth();
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState("");

  const handleDemo = async () => {
    setDemoError("");
    setDemoLoading(true);
    try {
      // loginDemo() redirects to "/" on success; on failure it throws.
      await loginDemo();
    } catch (error) {
      if (error instanceof Error) setDemoError(error.message);
      setDemoLoading(false); // only reset on failure — success unmounts this page
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero — copy on the left, a static preview of the real board on the right. */}
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-8 lg:py-28">
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-500">
            <FaNetworkWired className="text-gray-400" />
            Job search tracker
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Every application,{" "}
            <span className="text-brand-600">in one clear board.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-gray-600 lg:mx-0 mx-auto">
            Stop juggling spreadsheets and email threads. Track applications,
            interviews, and offers in one place.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <button
              type="button"
              onClick={handleDemo}
              disabled={demoLoading}
              className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:cursor-pointer hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {demoLoading ? "Loading demo…" : "Try the live demo"}
            </button>
            <Link
              href="/signup"
              className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
            >
              Get started
            </Link>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            No signup required to explore the demo.
          </p>
          {demoError && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {demoError}
            </p>
          )}
        </div>

        <BoardPreview />
      </section>

      {/* Features — quiet cards, single accent color, no gradients. */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Feature
            title="One board, every status"
            body="Applied, interviewing, offer, rejected — see where each application stands at a glance."
          />
          <Feature
            title="Edit inline"
            body="Update company, role, or status directly in the table. No modals, no friction."
          />
          <Feature
            title="Notes that stick"
            body="Capture interview prep, recruiter contacts, and follow-ups next to each application."
          />
        </div>
      </section>
    </div>
  );
}

/* Static replica of JobTable — same column headers, pill styles, and row
   layout, but with hardcoded rows and no editing. Kept intentionally in sync
   with JobTable's visual language so the landing shows the real product. */
const STATUS_STYLE: Record<string, string> = {
  applied: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  waiting: "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
  "interview 2": "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  offer: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
};

const PREVIEW_COLUMNS = [
  { label: "Company", icon: <FaBuilding /> },
  { label: "Role", icon: <FaNetworkWired /> },
  { label: "Source", icon: <SiCrowdsource /> },
  { label: "Status", icon: <IoIosArrowDropdown /> },
  { label: "Applied Date", icon: <FaRegCalendar /> },
];

const PREVIEW_ROWS = [
  { company: "Stripe", role: "Frontend Engineer", source: "Referral", status: "offer", applied: "May 2" },
  { company: "Notion", role: "Product Engineer", source: "LinkedIn", status: "interview 2", applied: "May 6" },
  { company: "Linear", role: "Fullstack Engineer", source: "Careers page", status: "applied", applied: "May 9" },
  { company: "Vercel", role: "DX Engineer", source: "Referral", status: "waiting", applied: "May 12" },
];

const thClass =
  "border-b border-gray-100 px-4 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap";
const tdClass =
  "border-b border-gray-100 px-4 py-2.5 text-sm text-gray-700 align-middle whitespace-nowrap";

function BoardPreview() {
  return (
    <div
      aria-hidden
      className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm"
    >
      <table className="w-full min-w-max table-auto border-collapse">
        <thead>
          <tr className="bg-gray-50/70">
            {PREVIEW_COLUMNS.map(({ label, icon }) => (
              <th key={label} className={thClass}>
                <span className="inline-flex items-center gap-1.5 text-gray-400">
                  {icon}
                  {label}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PREVIEW_ROWS.map((row) => (
            <tr key={row.company} className="transition-colors hover:bg-gray-50/60">
              <td className={`${tdClass} font-medium text-gray-900`}>{row.company}</td>
              <td className={tdClass}>{row.role}</td>
              <td className={tdClass}>{row.source}</td>
              <td className={tdClass}>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[row.status]}`}
                >
                  {row.status}
                </span>
              </td>
              <td className={tdClass}>{row.applied}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-gray-300">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{body}</p>
    </div>
  );
}

export default LandingPage;
