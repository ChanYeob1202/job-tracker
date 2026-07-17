"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LuLayoutDashboard,
  LuSearch,
  LuBookmark,
  LuSettings,
  LuLogOut,
  LuChevronsUpDown,
} from "react-icons/lu";
import type { IconType } from "react-icons";

type NavItem = {
  label: string;
  href: string;
  icon: IconType;
  /** Placeholder routes that don't exist yet render as inert, muted items. */
  ready?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LuLayoutDashboard, ready: true },
  { label: "Job Search", href: "/search", icon: LuSearch },
  { label: "Saved Jobs", href: "/saved", icon: LuBookmark },
  { label: "Settings", href: "/settings", icon: LuSettings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logOut } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close the profile menu when clicking anywhere outside it, or on Escape.
  // We listen on the whole document only while the menu is open, then clean up.
  useEffect(() => {
    if (!menuOpen) return;

    function handlePointer(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  return (
    <aside className="sticky top-0 flex h-screen w-50 shrink-0 flex-col border-r border-gray-100 bg-white/80 px-4 py-5 backdrop-blur-md">
      {/* Logo */}
      <button
        type="button"
        onClick={() => router.push("/")}
        className="flex items-center gap-2.5 px-2 hover:cursor-pointer"
      >
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-linear-to-br from-brand-600 to-accent-600 text-sm font-bold text-white">
          L
        </span>
        <span className="text-lg font-bold tracking-tight text-gray-900">
          Landr
        </span>
      </button>

      {/* Nav */}
      <nav className="mt-8 flex flex-col gap-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon, ready }) => {
          const active = pathname === href;

          const base =
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition";

          if (!ready) {
            // No page exists yet — show it, but make clear it's not clickable.
            return (
              <span
                key={label}
                title="Coming soon"
                className={`${base} cursor-not-allowed text-gray-300`}
              >
                <Icon className="text-lg" />
                {label}
              </span>
            );
          }

          return (
            <Link
              key={label}
              href={href}
              className={`${base} ${
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="text-lg" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User menu, pinned to the bottom. Sign out lives in a popover that
          opens on click; `relative` anchors the absolutely-positioned menu. */}
      <div ref={profileRef} className="relative mt-auto border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition hover:bg-gray-100 hover:cursor-pointer"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-linear-to-br from-brand-600 to-accent-600 text-sm font-semibold text-white">
            {user?.userName?.charAt(0).toUpperCase() ?? "?"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {user?.userName}
            </p>
            <p className="truncate text-xs text-gray-400">{user?.email}</p>
          </div>
          <LuChevronsUpDown className="shrink-0 text-gray-400" />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute bottom-full left-0 mb-2 w-full rounded-lg border border-gray-100 bg-white p-1 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                logOut();
                router.push("/");
              }}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 hover:cursor-pointer"
            >
              <LuLogOut className="text-lg" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
