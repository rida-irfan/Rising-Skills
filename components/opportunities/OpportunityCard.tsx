"use client";

import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  MapPin,
  Clock3,
} from "lucide-react";

export type Opportunity = {
  id: string;
  title: string;
  company?: string;
  type: string;
  location: string;
  workMode?: string;
  description: string;
  skills?: string[];
  experience?: string;
  deadline: string;
  status: string;
  salary?: string;
  match?: number;
};

export default function OpportunityCard({
  opportunity,
}: {
  opportunity: Opportunity;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Briefcase size={24} />
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {opportunity.status}
        </span>
      </div>

      <div className="mt-5">
        <h2 className="text-lg font-bold text-slate-900">
          {opportunity.title}
        </h2>

        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
          <Building2 size={15} />
          {opportunity.company || "Organization"}
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
        {opportunity.description}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {(opportunity.skills || []).map((skill) => (
          <span
            key={skill}
            className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MapPin size={15} />
          {opportunity.location}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock3 size={15} />
          {opportunity.workMode || (opportunity as { is_remote?: boolean }).is_remote ? "Remote" : "On-site"}
        </div>

        <div className="text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            {opportunity.type}
          </span>
        </div>

        <div className="text-xs text-slate-500">
          Match:{" "}
          <span className="font-semibold text-emerald-600">
            {opportunity.match != null ? `${opportunity.match}%` : "—"}
          </span>
        </div>
      </div>

      <Link
        href={`/dashboard/opportunities/${opportunity.id}`}
        className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        View Opportunity
        <ArrowRight size={17} />
      </Link>
    </div>
  );
}