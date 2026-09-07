"use client";

import {
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
  Trophy,
  UserRound,
} from "lucide-react";

import SkillStateBadge from "./SkillStateBadge";

interface Evidence {
  id: number;
  state:
    | "Self-Reported"
    | "Assessed"
    | "Demonstrated"
    | "Verified";
  source: string;
  date: string;
  details: string;
}

interface EvidenceHistoryProps {
  evidence: Evidence[];
}

export default function EvidenceHistory({
  evidence,
}: EvidenceHistoryProps) {
  const getIcon = (state: Evidence["state"]) => {
    if (state === "Verified") {
      return <ShieldCheck size={18} />;
    }

    if (state === "Demonstrated") {
      return <Trophy size={18} />;
    }

    if (state === "Assessed") {
      return <FileCheck2 size={18} />;
    }

    return <UserRound size={18} />;
  };

  return (
    <div className="space-y-4">
      {evidence.map((item) => (
        <div
          key={item.id}
          className="relative rounded-xl border border-slate-200 p-4"
        >
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              {getIcon(item.state)}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <SkillStateBadge state={item.state} />

                <span className="text-xs text-slate-400">
                  {item.date}
                </span>
              </div>

              <h4 className="mt-2 text-sm font-bold text-slate-900">
                {item.source}
              </h4>

              <p className="mt-1 text-sm text-slate-500">
                {item.details}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Evidence ID: EV-{item.id}
              </p>
            </div>
          </div>
        </div>
      ))}

      {evidence.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <CheckCircle2
            className="mx-auto text-slate-300"
            size={32}
          />

          <p className="mt-2 text-sm text-slate-500">
            No evidence available yet.
          </p>
        </div>
      )}
    </div>
  );
}