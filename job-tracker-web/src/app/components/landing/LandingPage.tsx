import Link from "next/link";

function LandingPage() {
  return (
    <div className="flex flex-col">
      <section className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Track every job application in one place.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-gray-600">
          Stop juggling spreadsheets and email threads. JobTracker keeps your
          applications, interviews, and offers organized so you can focus on
          landing the role.
        </p>

        <div className="mt-10 flex flex-row gap-4">
          <Link
            href="/signup"
            className="rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-gray-700"
          >
            Get started free
          </Link>
          <Link
            href="/signin"
            className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-900 hover:bg-gray-100"
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
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

      <section className="flex flex-col items-center px-6 py-16 text-center">
        <h2 className="text-3xl font-semibold text-gray-900">
          Ready to get organized?
        </h2>
        <Link
          href="/signup"
          className="mt-6 rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-gray-700"
        >
          Create your free account
        </Link>
      </section>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{body}</p>
    </div>
  );
}

export default LandingPage;
