"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Code2,
  Trophy,
} from "lucide-react";

export interface ChallengeCardData {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  status: string;
  submission_deadline: string | null;
  skills?: Array<{ skill_id: string; skill_name: string }>;
  skillsText?: string[];
  submissionType?: string;
  points?: number;
}

function formatDate(iso: string | null): string {
  if (!iso) return "No deadline";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function ChallengeCard({
  challenge,
}: {
  challenge: ChallengeCardData;
}) {
  const skills = challenge.skills
    ? challenge.skills.map((s) => s.skill_name)
    : challenge.skillsText || [];

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {/* Top */}
      <div className="mb-5 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Code2 size={24} />
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
            challenge.status === "published" || challenge.status === "Open"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {challenge.status}
        </span>
      </div>

      {/* Title */}
      <h2 className="text-lg font-bold text-slate-900">
        {challenge.title}
      </h2>

      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
        {challenge.description || "No description provided."}
      </p>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Skills Tested
          </p>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span
                key={`${skill}-${i}`}
                className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Information */}
      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
        <div className="flex items-center gap-2 text-xs capitalize text-slate-500">
          <Trophy size={15} className="text-indigo-500" />
          {challenge.difficulty}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <CalendarDays size={15} className="text-indigo-500" />
          {formatDate(challenge.submission_deadline)}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Code2 size={15} className="text-indigo-500" />
          {challenge.submissionType || "Repository Link"}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Trophy size={15} className="text-indigo-500" />
          {challenge.points != null ? `${challenge.points} points` : "—"}
        </div>
      </div>

      {/* Button */}
      <Link
        href={`/dashboard/challenges/${challenge.id}`}
        className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        View Challenge
        <ArrowRight size={17} />
      </Link>
    </div>
  );
}
