"use client";

import { Sparkles } from "lucide-react";

type MatchScoreProps = {
  score: number;
};

export default function MatchScore({ score }: MatchScoreProps) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            Match Score
          </p>

          <div className="mt-1 flex items-center gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {score}%
            </span>

            <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-indigo-600">
              Strong Match
            </span>
          </div>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-indigo-600">
          <Sparkles size={22} />
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all"
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Based on your skills, proficiency and available evidence.
      </p>
    </div>
  );
}