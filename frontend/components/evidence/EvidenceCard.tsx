"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  ShieldCheck,
} from "lucide-react";

export type Evidence = {
  id: string;
  skill: string;
  state: "Assessed" | "Demonstrated" | "Verified" | "Unverified" | "Pending" | "Rejected";
  sourceType: string;
  sourceTitle: string;
  score?: number;
  evaluator?: string;
  date: string;
  description: string;
};

const stateConfig: Record<string, { icon: any; className: string }> = {
  Assessed: { icon: BookOpenCheck, className: "bg-indigo-50 text-indigo-700" },
  Demonstrated: { icon: Award, className: "bg-amber-50 text-amber-700" },
  Verified: { icon: ShieldCheck, className: "bg-emerald-50 text-emerald-700" },
  Unverified: { icon: Clock3, className: "bg-slate-100 text-slate-600" },
  Pending: { icon: Clock3, className: "bg-amber-50 text-amber-700" },
  Rejected: { icon: CheckCircle2, className: "bg-red-50 text-red-700" },
};

export default function EvidenceCard({
  evidence,
}: {
  evidence: Evidence;
}) {
  const config = stateConfig[evidence.state] || stateConfig.Unverified;
  const Icon = config.icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${config.className}`}>
            <Icon size={22} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              {evidence.skill}
            </h2>

            <p className="text-xs text-slate-500">
              {evidence.sourceType}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
        >
          {evidence.state}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Evidence Source
        </p>

        <p className="mt-1 font-semibold text-slate-800">
          {evidence.sourceTitle}
        </p>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        {evidence.description}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
        {evidence.score !== undefined && (
          <div>
            <p className="text-xs text-slate-400">Score</p>
            <p className="mt-1 font-semibold text-slate-800">
              {evidence.score}%
            </p>
          </div>
        )}

        <div>
          <p className="text-xs text-slate-400">Date</p>
          <div className="mt-1 flex items-center gap-1 text-sm font-medium text-slate-700">
            <Clock3 size={14} />
            {evidence.date}
          </div>
        </div>

        {evidence.evaluator && (
          <div className="col-span-2">
            <p className="text-xs text-slate-400">Evaluator</p>
            <p className="mt-1 text-sm font-medium text-slate-700">
              {evidence.evaluator}
            </p>
          </div>
        )}
      </div>

      <Link
        href={`/dashboard/evidence/${evidence.id}`}
        className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
      >
        View Evidence
        <ArrowRight size={17} />
      </Link>
    </div>
  );
}