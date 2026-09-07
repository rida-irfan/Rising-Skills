
"use client";

import { Bell, ChevronDown, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/lib/api";

export default function Navbar() {
  const { profile } = useAuth();

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

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/0 px-6">

      {/* Left */}
      <div>
        {/* <h1 className="text-lg font-semibold text-slate-900">
          Student Dashboard
        </h1>

        <p className="text-xs text-slate-500">
          Track your skills and career progress
        </p> */}
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">

        {/* Notifications */}
        <button
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          type="button"
        >
          <Bell size={20} />

          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-indigo-600" />
        </button>

        {/* User */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-5">

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
            <User size={18} />
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">
              {displayName}
            </p>

            <p className="text-xs text-slate-500">
              {displayRole}
            </p>
          </div>

          <ChevronDown size={16} className="text-slate-400" />

        </div>

      </div>

    </header>
  );
}

