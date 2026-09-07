"use client";

import EvidenceCard, {
  Evidence,
} from "@/components/evidence/EvidenceCard";
import EvidenceFilters from "@/components/evidence/EvidenceFilters";
import {
  Award,
  BookOpenCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo } from "react";
import { api, type EvidencePublic } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useFetch } from "@/lib/useFetch";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";

function mapState(status: EvidencePublic["status"]): Evidence["state"] {
  switch (status) {
    case "verified":
      return "Verified";
    case "pending":
      return "Pending";
    case "rejected":
      return "Rejected";
    case "unverified":
    default:
      return "Unverified";
  }
}

function mapSource(type: EvidencePublic["source_type"]): string {
  return type === "assessment" ? "Assessment" : "Challenge Submission";
}

function mapEvidence(e: EvidencePublic): Evidence {
  const state: Evidence["state"] =
    e.source_type === "assessment"
      ? "Assessed"
      : "Demonstrated";
  return {
    id: e.id,
    skill: e.skill_id,
    state: e.status === "verified" ? "Verified" : state,
    sourceType: mapSource(e.source_type),
    sourceTitle: e.source_type === "assessment" ? "Assessment Result" : "Challenge Submission",
    score: Math.round(e.score),
    date: new Date(e.created_at).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    description: `Evidence from ${mapSource(e.source_type).toLowerCase()} (status: ${e.status}).`,
  };
}

export default function EvidencePage() {
  const { token } = useAuth();

  const fetcher = useMemo(
    () => () =>
      token
        ? api.evidence.list({ page_size: 100 }, token)
        : Promise.resolve({ items: [], total: 0, page: 1, page_size: 100, pages: 0 }),
    [token],
  );
  const { data, loading, error, refetch } = useFetch(fetcher, [token]);

  const evidence = useMemo(
    () => (data?.items || []).map(mapEvidence),
    [data],
  );

  const assessed = evidence.filter((e) => e.state === "Assessed").length;
  const demonstrated = evidence.filter((e) => e.state === "Demonstrated").length;
  const verified = evidence.filter((e) => e.state === "Verified").length;

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-indigo-600">
            SKILL EVIDENCE
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            My Evidence
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            View the evidence behind your skills, including assessments,
            practical challenges, and independent verification.
          </p>
        </div>

        {/* Important notice */}
        <div className="mb-8 flex gap-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">
              Evidence is your skill proof
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Evidence is generated from trusted platform activities.
              It cannot be manually edited or deleted by the student.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Evidence"
            value={evidence.length}
            icon={<Sparkles size={22} />}
            iconClass="bg-indigo-50 text-indigo-600"
          />
          <StatCard
            label="Assessed"
            value={assessed}
            icon={<BookOpenCheck size={22} />}
            iconClass="bg-indigo-50 text-indigo-600"
          />
          <StatCard
            label="Demonstrated"
            value={demonstrated}
            icon={<Award size={22} />}
            iconClass="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="Verified"
            value={verified}
            icon={<ShieldCheck size={22} />}
            iconClass="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* Filters */}
        <EvidenceFilters />

        {/* Evidence list */}
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">
            Evidence History
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your evidence records from assessments, challenges, and
            verification events.
          </p>
        </div>

        {loading ? (
          <LoadingState label="Loading evidence…" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : evidence.length === 0 ? (
          <EmptyState
            title="No evidence yet"
            description={
              token
                ? "Complete assessments or challenges to generate evidence."
                : "Sign in to load your evidence from the backend."
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {evidence.map((item) => (
              <EvidenceCard key={item.id} evidence={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  iconClass,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className={`rounded-xl p-3 ${iconClass}`}>{icon}</div>
      </div>
    </div>
  );
}
