"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "./Sidebar";
import JobPageNav from "./JobPageNav";
import { LuMenu } from "react-icons/lu";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // Mobile drawer state lives here (not in Sidebar) because both the hamburger
  // button below and the Sidebar are siblings that must agree on one boolean.
  // Navigation closes the drawer via each nav link's onClose (see Sidebar).
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close the drawer on Escape, matching the profile popover's behavior.
  useEffect(() => {
    if (!sidebarOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSidebarOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [sidebarOpen]);

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
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Backdrop — only on mobile, only while the drawer is open. Tap to close. */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          aria-hidden
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar: hamburger + logo. Hidden once the sidebar is static. */}
        <header className="flex items-center gap-3 border-b border-gray-100 bg-white/80 px-4 py-3 backdrop-blur-md md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="grid h-9 w-9 place-items-center rounded-lg text-gray-700 transition hover:bg-gray-100 hover:cursor-pointer"
          >
            <LuMenu className="text-xl" />
          </button>
          <span className="text-lg font-bold tracking-tight text-gray-900">
            Landr
          </span>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
