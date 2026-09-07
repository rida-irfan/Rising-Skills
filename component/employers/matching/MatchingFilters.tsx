"use client";

import { Search, SlidersHorizontal } from "lucide-react";

interface MatchingFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  job: string;
  setJob: (value: string) => void;
  matchLevel: string;
  setMatchLevel: (value: string) => void;
}

export default function MatchingFilters({
  search,
  setSearch,
  job,
  setJob,
  matchLevel,
  setMatchLevel,
}: MatchingFiltersProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            placeholder="Search candidate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-400" />

          <select
            value={job}
            onChange={(e) => setJob(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Jobs</option>
            <option value="React.js Frontend Developer">
              React.js Frontend Developer
            </option>
            <option value="AI / Machine Learning Engineer">
              AI / Machine Learning Engineer
            </option>
            <option value="UI/UX Designer">UI/UX Designer</option>
            <option value="Backend Developer">Backend Developer</option>
          </select>

          <select
            value={matchLevel}
            onChange={(e) => setMatchLevel(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Matches</option>
            <option value="High">High Match</option>
            <option value="Medium">Medium Match</option>
            <option value="Low">Low Match</option>
          </select>
        </div>
      </div>
    </div>
  );
}