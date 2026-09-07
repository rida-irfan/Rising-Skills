
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  Bell,
  Briefcase,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/lib/api";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/profile",
    label: "My Profile",
    icon: User,
  },
  {
    href: "/dashboard/skills",
    label: "My Skills",
    icon: GraduationCap,
  },
  {
    href: "/dashboard/assessments",
    label: "Assessments",
    icon: ClipboardCheck,
  },
  {
    href: "/dashboard/challenges",
    label: "Practical Challenges",
    icon: Zap,
  },
  {
    href: "/dashboard/evidence",
    label: "My Evidence",
    icon: FileCheck2,
  },
  {
    href: "/dashboard/opportunities",
    label: "Opportunities",
    icon: Briefcase,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();

  // Map backend role to a friendly display label.
  const roleLabel = (role: UserRole | undefined): string => {
    switch (role) {
      case "employer":
        return "Employer";
      case "admin":
        return "Admin";
      case "learner":
      default:
        return "Student";
    }
  };

  const displayName = profile?.full_name?.trim() || "User";
  const displayRole = roleLabel(profile?.role);

  const handleLogout = () => {
    signOut();
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      
      {/* Logo */}
      <div className="border-b border-slate-200 px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <GraduationCap size={23} />
          </div>

          <div>
            <p className="text-base font-bold text-slate-900">
              Rising Skills
            </p>

            <p className="text-xs text-slate-500">
              Career Development Platform
            </p>
          </div>
        </Link>
      </div>

      {/* User mini profile */}
      <div className="border-b border-slate-200 px-4 py-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
            <User size={18} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {displayName}
            </p>

            <p className="truncate text-xs text-slate-500">
              {displayRole}
            </p>
          </div>

        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </p>

        <div className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  size={18}
                  className={
                    isActive
                      ? "text-indigo-600"
                      : "text-slate-400 group-hover:text-slate-600"
                  }
                />

                <span>{label}</span>

                {label === "Opportunities" && (
                  <span className="ml-auto rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                    New
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Career Section */}
        <p className="mb-3 mt-7 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Career
        </p>

        <div className="space-y-1">
          <Link
            href="/dashboard/recommendations"
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              pathname.startsWith("/dashboard/recommendations")
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Award size={18} />
            AI Recommendations
          </Link>

          <Link
            href="/dashboard/notifications"
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              pathname.startsWith("/dashboard/notifications")
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Bell size={18} />
            Notifications
          </Link>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-slate-200 p-3">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <Settings size={18} />
          Settings
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

