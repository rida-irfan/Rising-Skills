"use client";

import { Search, SlidersHorizontal } from "lucide-react";

export default function EvidenceFilters() {
  return (
    <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search evidence..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white"
          />
        </div>

        <select className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none focus:border-indigo-500">
          <option>All Skills</option>
          <option>React.js</option>
          <option>JavaScript</option>
          <option>TypeScript</option>
          <option>HTML & CSS</option>
        </select>

        <select className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none focus:border-indigo-500">
          <option>All States</option>
          <option>Assessed</option>
          <option>Demonstrated</option>
          <option>Verified</option>
        </select>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
        <SlidersHorizontal size={14} />
        Filter your evidence by skill or verification state.
      </div>
    </div>
  );
}