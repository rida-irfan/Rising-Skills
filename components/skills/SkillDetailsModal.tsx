"use client";

import { X } from "lucide-react";

import { Skill } from "./SkillCard";
import SkillStateBadge from "./SkillStateBadge";
import EvidenceHistory from "./EvidenceHistory";

interface SkillDetailsModalProps {
  skill: Skill;
  onClose: () => void;
}

export default function SkillDetailsModal({
  skill,
  onClose,
}: SkillDetailsModalProps) {
  const evidence = [
    {
      id: 104,
      state: "Verified" as const,
      source: "Employer Verification",
      date: "Aug 28, 2026",
      details:
        "Skill independently confirmed by an employer.",
    },
    {
      id: 98,
      state: "Demonstrated" as const,
      source: "Practical Challenge",
      date: "Aug 20, 2026",
      details:
        "Passed evaluator-reviewed practical challenge with a 92% rubric score.",
    },
    {
      id: 91,
      state: "Assessed" as const,
      source: "React.js Assessment",
      date: "Aug 15, 2026",
      details:
        "Platform assessment completed with an 86% score.",
    },
    {
      id: 85,
      state: "Self-Reported" as const,
      source: "Student Profile",
      date: "Aug 10, 2026",
      details:
        "Skill originally added by the student.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
      <div className="mx-auto my-8 max-w-3xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 p-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {skill.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {skill.category}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-400">
              Current State
            </p>

            <div className="mt-2">
              <SkillStateBadge state={skill.state} />
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-400">
              Proficiency
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {skill.proficiency}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-400">
              Evidence
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {skill.evidenceCount} records
            </p>
          </div>
        </div>

        <div className="px-6 pb-6">
          <h3 className="mb-4 text-lg font-bold text-slate-900">
            Evidence History
          </h3>

          <EvidenceHistory evidence={evidence} />
        </div>
      </div>
    </div>
  );
}