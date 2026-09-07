"use client";

import {
  CheckCircle2,
  ChevronRight,
  Edit,
  Trash2,
} from "lucide-react";

import SkillStateBadge from "./SkillStateBadge";

export type SkillState =
  | "Self-Reported"
  | "Assessed"
  | "Demonstrated"
  | "Verified";

export interface Skill {
  id: string | number;
  name: string;
  category: string;
  proficiency: string;
  state: SkillState;
  evidenceCount: number;
  lastUpdated: string;
  description?: string;
}

interface SkillCardProps {
  skill: Skill;
  onView: (skill: Skill) => void;
  onEdit: (skill: Skill) => void;
  onDelete: (id: string | number) => void;
}

export default function SkillCard({
  skill,
  onView,
  onEdit,
  onDelete,
}: SkillCardProps) {
  const canEdit = skill.state === "Self-Reported";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {skill.name}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {skill.category}
          </p>
        </div>

        <SkillStateBadge state={skill.state} />
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Proficiency
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-800">
          {skill.proficiency}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-400">
            Evidence
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-800">
            {skill.evidenceCount}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-400">
            Updated
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-800">
            {skill.lastUpdated}
          </p>
        </div>
      </div>

      {skill.state === "Verified" && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-xs font-medium text-green-700">
          <CheckCircle2 size={16} />
          This skill has verified evidence.
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <button
          onClick={() => onView(skill)}
          className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
        >
          View Details
          <ChevronRight size={16} />
        </button>

        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => onEdit(skill)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              title="Edit"
            >
              <Edit size={16} />
            </button>
          )}

          {canEdit && (
            <button
              onClick={() => onDelete(skill.id)}
              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}