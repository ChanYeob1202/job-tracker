"use client";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "./Sidebar";
import JobPageNav from "./JobPageNav";

/**
 * Chooses the chrome around every page based on auth:
 *  - Signed in  → left Sidebar + full-width main (the app).
 *  - Signed out → the old top nav + centered container (landing / auth pages).
 *
 * Kept as a client component so the root layout can stay a server component;
 * it reads `user` from AuthContext, the same source JobPageNav already used.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="mx-auto flex min-h-full max-w-10xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <JobPageNav />
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
