"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import type { OpportunityType } from "@/lib/api";

interface Props {
  search?: string;
  onSearchChange?: (value: string) => void;
  typeFilter?: OpportunityType | "all";
  onTypeChange?: (value: OpportunityType | "all") => void;
}

export default function OpportunityFilters({
  search = "",
  onSearchChange,
  typeFilter = "all",
  onTypeChange,
}: Props) {
  return (
    <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search opportunities..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) =>
            onTypeChange?.(e.target.value as OpportunityType | "all")
          }
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none focus:border-indigo-400"
        >
          <option value="all">All Types</option>
          <option value="internship">Internship</option>
          <option value="apprenticeship">Apprenticeship</option>
          <option value="project">Project</option>
          <option value="job">Job</option>
        </select>

        <select
          disabled
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400 outline-none"
        >
          <option>All Work Modes</option>
          <option>Remote</option>
          <option>Hybrid</option>
          <option>On-site</option>
        </select>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <SlidersHorizontal size={14} />
        Showing opportunities based on your profile and skills.
      </div>
    </div>
  );
}
