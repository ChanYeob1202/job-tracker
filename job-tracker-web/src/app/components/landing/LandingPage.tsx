import Link from "next/link";

function LandingPage() {
  return (
    <div className="relative isolate flex flex-col overflow-hidden">
      {/* Soft gradient glow behind the hero — purely decorative */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center blur-3xl"
      >
        <div className="h-112 w-xl bg-linear-to-tr from-brand-300 via-accent-300 to-sky-200 opacity-40 [clip-path:polygon(20%_0%,80%_10%,100%_60%,70%_100%,20%_90%,0%_40%)]" />
      </div>

      <section className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
          <span className="h-2 w-2 rounded-full bg-brand-500" />
          Your job search, finally organized
        </span>

        <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Track every job application in{" "}
          <span className="bg-linear-to-r from-brand-600 via-accent-600 to-sky-500 bg-clip-text text-transparent">
            one place.
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-gray-600">
          Stop juggling spreadsheets and email threads. Landr keeps your
          applications, interviews, and offers organized so you can focus on
          landing the role.
        </p>

        <div className="mt-10 flex flex-row gap-4">
          <Link
            href="/signup"
            className="rounded-xl bg-linear-to-r from-brand-600 to-accent-600 px-6 py-3 font-semibold text-white shadow-lg shadow-accent-500/30 transition hover:shadow-xl hover:shadow-accent-500/40 hover:brightness-110"
          >
            Get started free
          </Link>
          <Link
            href="/signin"
            className="rounded-xl border border-gray-300 bg-white/70 px-6 py-3 font-semibold text-gray-900 backdrop-blur transition hover:border-brand-300 hover:bg-white hover:text-brand-700"
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
          <Feature
            accent="from-brand-500 to-accent-500"
            icon="◧"
            title="One board, every status"
            body="Applied, interviewing, offer, rejected — see where each application stands at a glance."
          />
          <Feature
            accent="from-accent-500 to-accent-600"
            icon="✎"
            title="Edit inline"
            body="Update company, role, or status directly in the table. No modals, no friction."
          />
          <Feature
            accent="from-sky-500 to-brand-500"
            icon="✦"
            title="Notes that stick"
            body="Capture interview prep, recruiter contacts, and follow-ups next to each application."
          />
        </div>
      </section>

      <section className="mx-6 mb-16 flex flex-col items-center rounded-3xl bg-linear-to-r from-brand-600 via-accent-600 to-brand-700 px-6 py-16 text-center shadow-xl shadow-accent-500/20">
        <h2 className="text-3xl font-semibold text-white">
          Ready to get organized?
        </h2>
        <p className="mt-3 max-w-md text-brand-100">
          Create an account in seconds — no credit card required.
        </p>
        <Link
          href="/signup"
          className="mt-8 rounded-xl bg-white px-6 py-3 font-semibold text-brand-700 shadow-lg transition hover:bg-brand-50"
        >
          Create your free account
        </Link>
      </section>
    </div>
  );
}

function Feature({
  title,
  body,
  icon,
  accent,
}: {
  title: string;
  body: string;
  icon: string;
  accent: string;
}) {
  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/10">
      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br ${accent} text-lg text-white shadow-sm`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{body}</p>
    </div>
  );
}

export default LandingPage;
