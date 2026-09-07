"use client";

import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  MapPin,
  Sparkles,
} from "lucide-react";

type Recommendation = {
  id: string;
  title: string;
  company: string;
  type: string;
  location: string;
  workMode: string;
  score: number;
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  aiReason: string;
};

type RecommendationCardProps = {
  recommendation: Recommendation;
};

export default function RecommendationCard({
  recommendation,
}: RecommendationCardProps) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Briefcase size={23} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {recommendation.title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {recommendation.company}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-indigo-50 px-3 py-2 text-center">
          <p className="text-lg font-bold text-indigo-700">
            {recommendation.score}%
          </p>

          <p className="text-[10px] font-semibold uppercase text-indigo-500">
            Match
          </p>
        </div>
      </div>

      {/* Opportunity info */}
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
          {recommendation.type}
        </span>

        <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
          <MapPin size={13} />
          {recommendation.location}
        </span>

        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
          {recommendation.workMode}
        </span>
      </div>

      {/* Skills */}
      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Matching Skills
        </p>

        <div className="flex flex-wrap gap-2">
          {recommendation.matchedSkills.map((skill) => (
            <span
              key={skill}
              className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700"
            >
              <CheckCircle2 size={13} />
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Missing skills */}
      {recommendation.missingSkills.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Skill Gaps
          </p>

          <div className="flex flex-wrap gap-2">
            {recommendation.missingSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI explanation */}
      <div className="mt-5 rounded-xl border border-violet-100 bg-violet-50 p-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-violet-600" />

          <p className="text-xs font-bold text-violet-700">
            AI-assisted explanation
          </p>
        </div>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {recommendation.aiReason}
        </p>
      </div>

      {/* Action */}
      <Link
        href={`/dashboard/opportunities/${recommendation.id}`}
        className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        View Opportunity
        <ArrowRight size={17} />
      </Link>
    </div>
  );
}