"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  BriefcaseBusiness,
  FileText,
  Users,
  Trophy,
  Target,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/employers/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Company Profile",
    href: "/employers/profile",
    icon: Building2,
  },
  {
    label: "Jobs",
    href: "/employers/jobs",
    icon: BriefcaseBusiness,
  },
  {
    label: "Applications",
    href: "/employers/applications",
    icon: FileText,
  },
  // {
  //   label: "Candidates",
  //   href: "/employers/candidates",
  //   icon: Users,
  // },
  {
    label: "Challenges",
    href: "/employers/challenges",
    icon: Trophy,
  },
  {
    label: "Matching",
    href: "/employers/matching",
    icon: Target,
  },
  // {
  //   label: "Feedback",
  //   href: "/employers/feedback",
  //   icon: MessageSquare,
  // },
  // {
  //   label: "Notifications",
  //   href: "/employers/notifications",
  //   icon: Bell,
  // },
  // {
  //   label: "Settings",
  //   href: "/employers/settings",
  //   icon: Settings,
  // },
];

export default function EmployerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center border-b border-slate-100 px-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Rising Skills
            </h1>
            <p className="text-xs text-slate-500">
              Career Growth Platform
            </p>
          </div>
        </div>

        {/* Portal Label */}
        <div className="px-5 pt-6 pb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Employer Portal
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={19} />

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}