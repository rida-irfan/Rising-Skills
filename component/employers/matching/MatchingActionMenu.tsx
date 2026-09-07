"use client";

import { useState } from "react";
import { MoreHorizontal, Eye, UserCheck, X } from "lucide-react";

interface MatchingActionMenuProps {
  onView: () => void;
  onShortlist: () => void;
  onReject: () => void;
}

export default function MatchingActionMenu({
  onView,
  onShortlist,
  onReject,
}: MatchingActionMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
          <button
            onClick={() => {
              onView();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <Eye className="h-4 w-4" />
            View Profile
          </button>

          <button
            onClick={() => {
              onShortlist();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-emerald-600 hover:bg-emerald-50"
          >
            <UserCheck className="h-4 w-4" />
            Shortlist
          </button>

          <button
            onClick={() => {
              onReject();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}