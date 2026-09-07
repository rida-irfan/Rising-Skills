"use client";

interface Props {
  search?: string;
  onSearchChange?: (value: string) => void;
}

export default function AssessmentFilters({
  search = "",
  onSearchChange,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-base font-semibold text-[#222]">
          Assessment Library
        </h2>
        <p className="text-xs text-[#999] mt-1">
          Browse and take available assessments
        </p>
      </div>

      <div className="flex gap-3">
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-[#999]">🔍</span>
          <input
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search assessments"
            className="w-60 border border-[#DDD]
            rounded-lg pl-9 pr-3 py-2 text-sm
            outline-none focus:border-[#6C4DF6]"
          />
        </div>

        <select
          disabled
          className="border border-[#DDD] rounded-lg
          px-3 py-2 text-sm text-[#999]"
        >
          <option>All Status</option>
          <option>Published</option>
          <option>Draft</option>
        </select>
      </div>
    </div>
  );
}
