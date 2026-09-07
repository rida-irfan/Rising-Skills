"use client";

import { Bell } from "lucide-react";

export default function EmployerNavbar() {
  return (
    <header className="fixed left-64 right-0 top-0 z-30 h-20 border-b border-slate-200 bg-white">
      <div className="flex h-full items-center justify-between px-8">
        {/* Left */}
        <div>
          <p className="text-sm text-slate-500">
            Employer Portal
          </p>

          <h2 className="text-lg font-semibold text-slate-900">
            Employer Dashboard
          </h2>
        </div>

        {/* Right */}
        <div className="flex items-center gap-5">
          {/* Notification */}
          <button
            type="button"
            className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <Bell size={21} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-500" />
          </button>

          {/* Employer */}
          <div className="flex items-center gap-3 border-l border-slate-200 pl-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
              RA
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">
                RAN AI
              </p>

              <p className="text-xs text-slate-500">
                Employer
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}