"use client";

import { Search, SlidersHorizontal } from "lucide-react";

interface Props {
  search?: string;
  onSearchChange?: (value: string) => void;
}

export default function ChallengeFilters({
  search = "",
  onSearchChange,
}: Props) {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search challenges..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white"
          />
        </div>

        {/* Difficulty (client-side visual only for now) */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={17} className="text-slate-400" />
          <select
            disabled
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400 outline-none"
          >
            <option>All Difficulties</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>

        {/* Status */}
        <select
          disabled
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400 outline-none"
        >
          <option>All Challenges</option>
          <option>Open</option>
          <option>Submitted</option>
          <option>Evaluated</option>
        </select>
      </div>
    </div>
  );
}
