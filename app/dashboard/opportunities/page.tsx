"use client";

import OpportunityCard, {
  Opportunity,
} from "@/components/opportunities/OpportunityCard";
import OpportunityFilters from "@/components/opportunities/OpportunityFilters";
import {
  Briefcase,
  CheckCircle2,
  Sparkles,
  Target,
} from "lucide-react";
import { useMemo, useState } from "react";
import { api, type OpportunityPublic, type OpportunityType } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";
import { useAuth } from "@/lib/auth-context";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/ui/states";

function formatDeadline(iso: string | null): string {
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

function mapOpportunity(o: OpportunityPublic): Opportunity {
  return {
    id: o.id,
    title: o.title,
    type: o.opportunity_type,
    location: o.location || "Not specified",
    workMode: o.is_remote ? "Remote" : "On-site",
    description: o.description || "",
    deadline: formatDeadline(o.deadline),
    status: o.status,
  };
}

export default function OpportunitiesPage() {
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<OpportunityType | "all">("all");

  const fetcher = useMemo(
    () => () =>
      api.opportunities.list({
        search: search || undefined,
        opportunity_type: typeFilter === "all" ? undefined : typeFilter,
        page_size: 100,
      }),
    [search, typeFilter],
  );

  const { data, loading, error, refetch } = useFetch(fetcher, [search, typeFilter]);

  const opportunities = useMemo(
    () => (data?.items || []).map(mapOpportunity),
    [data],
  );

  // Match scores for the authenticated learner (if available).
  const matchesFetcher = useMemo(
    () => () => (token ? api.matches.forLearner({ page_size: 100 }, token) : Promise.resolve(null)),
    [token],
  );
  const { data: matchesData } = useFetch(matchesFetcher, [token]);
  const matchById = useMemo(() => {
    const m = new Map<string, number>();
    for (const item of matchesData?.items || []) {
      m.set(item.opportunity_id, Math.round(item.overall_score));
    }
    return m;
  }, [matchesData]);

  const withMatches = useMemo(
    () =>
      opportunities.map((o) => ({
        ...o,
        match: matchById.get(o.id) ?? o.match,
      })),
    [opportunities, matchById],
  );

  const stats = useMemo(() => {
    const total = withMatches.length;
    const eligible = withMatches.filter((o) => (o.match ?? 0) >= 60).length;
    const avg =
      total > 0
        ? Math.round(
            withMatches.reduce((s, o) => s + (o.match ?? 0), 0) / total,
          )
        : 0;
    return { total, eligible, avg };
  }, [withMatches]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-indigo-600">
            CAREER OPPORTUNITIES
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Opportunities
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Discover opportunities that match your skills, proficiency and
            verified evidence.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Available"
            value={String(stats.total)}
            icon={<Sparkles size={22} />}
            iconClass="bg-indigo-50 text-indigo-600"
          />
          <StatCard
            title="Eligible (60%+)"
            value={String(stats.eligible)}
            icon={<CheckCircle2 size={22} />}
            iconClass="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            title="Matched"
            value={String(matchById.size)}
            icon={<Briefcase size={22} />}
            iconClass="bg-amber-50 text-amber-600"
          />
          <StatCard
            title="Average Match"
            value={`${stats.avg}%`}
            icon={<Target size={22} />}
            iconClass="bg-violet-50 text-violet-600"
          />
        </div>

        {/* AI Recommendation Banner */}
        <div className="mb-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                <Sparkles size={22} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">
                  Recommended for You
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  These opportunities are ranked using your current skill
                  states, evidence and role requirements.
                </p>
              </div>
            </div>
            <span className="w-fit rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700">
              Deterministic match
            </span>
          </div>
        </div>

        {/* Filters */}
        <OpportunityFilters
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
        />

        {/* Section Header */}
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Recommended Opportunities
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Opportunities ranked according to your profile.
            </p>
          </div>
          <span className="hidden rounded-lg bg-white px-3 py-2 text-sm text-slate-500 shadow-sm sm:block">
            {withMatches.length} opportunities
          </span>
        </div>

        {/* Body */}
        {loading ? (
          <LoadingState label="Loading opportunities…" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : withMatches.length === 0 ? (
          <EmptyState
            title="No opportunities found"
            description="Try adjusting your filters or check back later."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {withMatches.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* Stats Component */
function StatCard({
  title,
  value,
  icon,
  iconClass,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className={`rounded-xl p-3 ${iconClass}`}>{icon}</div>
      </div>
    </div>
  );
}
