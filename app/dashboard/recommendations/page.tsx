"use client";

import {
  CheckCircle2,
  Filter,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";

import RecommendationCard from "@/components/recommendations/RecommendationCard";
import MatchScore from "@/components/recommendations/MatchScore";
import SkillMatch from "@/components/recommendations/SkillMatch";
import { api, type MatchPublic, type OpportunityDetailPublic } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useFetch } from "@/lib/useFetch";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";
import { useEffect, useMemo, useState } from "react";

export default function RecommendationsPage() {
  const { token } = useAuth();

  const matchFetcher = useMemo(
    () => () =>
      token
        ? api.matches.forLearner({ min_score: 0, page_size: 100 }, token)
        : Promise.resolve({ items: [], total: 0, page: 1, page_size: 100, pages: 0 }),
    [token],
  );
  const { data: matchData, loading, error, refetch } = useFetch(matchFetcher, [token]);

  const matches: MatchPublic[] = matchData?.items || [];

  // Fetch each matched opportunity to populate the card.
  const [opportunities, setOpportunities] = useState<Record<string, OpportunityDetailPublic>>({});

  useEffect(() => {
    if (matches.length === 0) {
      setOpportunities({});
      return;
    }
    let cancelled = false;
    Promise.all(
      matches.map((m) =>
        api.opportunities
          .get(m.opportunity_id)
          .then((o) => [m.opportunity_id, o] as const)
          .catch(() => null),
      ),
    ).then((results) => {
      if (cancelled) return;
      const map: Record<string, OpportunityDetailPublic> = {};
      for (const r of results) {
        if (r) map[r[0]] = r[1];
      }
      setOpportunities(map);
    });
    return () => {
      cancelled = true;
    };
  }, [matches]);

  const recommendations = useMemo(() => {
    return matches
      .map((m) => {
        const opp = opportunities[m.opportunity_id];
        if (!opp) return null;
        const requiredSkills = opp.skills.map((s) => s.skill_name);
        return {
          id: opp.id,
          title: opp.title,
          company: "Organization",
          type: opp.opportunity_type,
          location: opp.location || "Not specified",
          workMode: opp.is_remote ? "Remote" : "On-site",
          score: Math.round(m.overall_score),
          requiredSkills,
          matchedSkills: requiredSkills,
          missingSkills: [] as string[],
          aiReason: `Your profile matches this opportunity with an overall score of ${Math.round(m.overall_score)}%.`,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.score - a.score);
  }, [matches, opportunities]);

  const eligible = recommendations.filter((r) => r.score >= 60).length;
  const avgMatch =
    recommendations.length > 0
      ? Math.round(
          recommendations.reduce((sum, r) => sum + r.score, 0) /
            recommendations.length,
        )
      : 0;
  const topScore = recommendations[0]?.score ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-indigo-600">
                SMART MATCHING
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Recommendations
              </h1>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Discover opportunities that match your skills, proficiency,
            evidence and career profile.
          </p>
        </div>

        {/* Overview */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Recommended</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {recommendations.length}
                </p>
              </div>
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Target size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Eligible</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {eligible}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <CheckCircle2 size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Average Match</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {avgMatch}%
                </p>
              </div>
              <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                <TrendingUp size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Top Match</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {topScore}%
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <ShieldCheck size={21} />
              </div>
            </div>
          </div>
        </div>

        {/* Eligibility explanation */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">
                How your recommendations work
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Opportunities are scored against your profile using a
                deterministic matching algorithm. Skill, evidence and
                experience scores combine into an overall match score.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 size={14} />
                  Hard Eligibility
                </span>
                <span className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700">
                  <Target size={14} />
                  Base Match Score
                </span>
                <span className="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700">
                  <Sparkles size={14} />
                  AI-Assisted Explanation
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Personal match */}
        {recommendations[0] && (
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <MatchScore score={recommendations[0].score} />
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Match Breakdown — {recommendations[0].title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Skill, evidence and experience sub-scores for your top match.
              </p>
              <div className="mt-5 space-y-4">
                <ScoreBar
                  label="Skill Score"
                  value={Math.round(matches[0]?.skill_score ?? 0)}
                  color="bg-indigo-500"
                />
                <ScoreBar
                  label="Evidence Score"
                  value={Math.round(matches[0]?.evidence_score ?? 0)}
                  color="bg-violet-500"
                />
                <ScoreBar
                  label="Experience Score"
                  value={Math.round(matches[0]?.experience_score ?? 0)}
                  color="bg-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Recommended Opportunities
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Ranked by overall match score (highest first).
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                <Filter size={16} />
                Filters
              </button>
              <button className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
                Best Match
              </button>
              <button className="rounded-xl px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50">
                Latest
              </button>
            </div>
          </div>
        </div>

        {/* Recommendation cards */}
        {loading ? (
          <LoadingState label="Loading recommendations…" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : !token ? (
          <EmptyState
            title="Sign in to see recommendations"
            description="Match scores are calculated for authenticated learners."
          />
        ) : recommendations.length === 0 ? (
          <EmptyState
            title="No recommendations yet"
            description="Complete your profile and add skills to get matched opportunities."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {recommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
              />
            ))}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <XCircle size={18} className="mt-0.5 text-slate-400" />
            <div>
              <p className="text-sm font-semibold text-slate-700">Important</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                AI-assisted recommendations cannot override mandatory
                eligibility rules. The deterministic match score remains
                separate from any AI-generated explanation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}
