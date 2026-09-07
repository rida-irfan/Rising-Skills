"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { api, type MatchPublic, type OpportunityDetailPublic, type SkillGapExplanationResponse } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { learningSearchUrl } from "@/lib/skill-match";

type SkillDetail = {
  skill_id: string;
  skill_name: string;
  status: "strong" | "weak" | "missing";
  coverage: number;
  has_verified_evidence: boolean;
};

type OpportunityGap = {
  id: string;
  title: string;
  score: number;
  skills: SkillDetail[];
};

export default function SkillGapPage() {
  const { token } = useAuth();
  const [matches, setMatches] = useState<MatchPublic[]>([]);
  const [opportunities, setOpportunities] = useState<Record<string, OpportunityDetailPublic>>({});
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<SkillGapExplanationResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    api.opportunities
      .list({ page: 1, page_size: 100 })
      .then(async (available) => {
        const calculatedMatches = (
          await Promise.all(
            available.items.map((opportunity) =>
              api.matches.calculate(opportunity.id, token).catch(() => null),
            ),
          )
        ).filter((match): match is MatchPublic => match !== null);
        const response = await api.matches
          .forLearner({ min_score: 0, page_size: 100 }, token)
          .catch(() => ({ items: [], total: 0, page: 1, page_size: 100, pages: 0 }));
        const currentMatches = [...calculatedMatches];
        response.items.forEach((match) => {
          if (!currentMatches.some((current) => current.opportunity_id === match.opportunity_id)) {
            currentMatches.push(match);
          }
        });
        const opportunityResults = await Promise.all(
          available.items.map(async (opportunity) => {
            try {
              return [opportunity.id, await api.opportunities.get(opportunity.id)] as const;
            } catch {
              return null;
            }
          }),
        );
        if (cancelled) return;
        const map: Record<string, OpportunityDetailPublic> = {};
        opportunityResults.forEach((result) => {
          if (result) map[result[0]] = result[1];
        });
        setMatches(currentMatches);
        setOpportunities(map);
        setSelectedOpportunityId((current) => current || available.items[0]?.id || "");
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load skill gaps");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token || !selectedOpportunityId) return;
    let cancelled = false;
    setAiLoading(true);
    setAiError(null);
    api.ai
      .skillGapExplanation(selectedOpportunityId, token)
      .then((result) => {
        if (!cancelled) setAiExplanation(result);
      })
      .catch((err) => {
        if (!cancelled) setAiError(err instanceof Error ? err.message : "Failed to load AI recommendations");
      })
      .finally(() => {
        if (!cancelled) setAiLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedOpportunityId, token]);

  const gapOpportunities = useMemo<OpportunityGap[]>(
    () =>
      matches
        .map((match) => {
          const details = match.breakdown?.skill_details;
          const skills = Array.isArray(details)
            ? (details as SkillDetail[]).map((skill) => ({
                ...skill,
                status:
                  skill.status ||
                  (skill.coverage >= 80 ? "strong" : skill.coverage > 0 ? "weak" : "missing"),
              }))
            : [];
          return {
            id: match.opportunity_id,
            title: opportunities[match.opportunity_id]?.title || "Opportunity match",
            score: Math.round(match.overall_score),
            skills,
          };
        })
        .filter((item) => item.skills.length > 0),
    [matches, opportunities],
  );

  const selectedOpportunity = gapOpportunities.find((item) => item.id === selectedOpportunityId);
  const visibleOpportunities = selectedOpportunity ? [selectedOpportunity] : gapOpportunities;
  const allSkills = visibleOpportunities.flatMap((item) => item.skills);
  const strong = allSkills.filter((skill) => skill.status === "strong");
  const weak = allSkills.filter((skill) => skill.status === "weak");
  const missing = allSkills.filter((skill) => skill.status === "missing");
  const gaps = [...weak, ...missing];
  const averageCoverage = allSkills.length
    ? Math.round(allSkills.reduce((sum, skill) => sum + skill.coverage, 0) / allSkills.length)
    : 0;
  const priorityGaps = [...gaps].sort((a, b) => a.coverage - b.coverage).slice(0, 5);

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 p-2 sm:p-4 lg:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-indigo-600">
              <Target size={18} />
              CAREER READINESS
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Skill Gap</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              See which skills need stronger evidence before you apply with confidence.
            </p>
          </div>
          <Link
            href="/dashboard/skills"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Build your skills
            <ArrowUpRight size={16} />
          </Link>
          <Link
            href="/dashboard/recommendations"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            AI guidance
            <ArrowUpRight size={16} />
          </Link>
        </header>

        {loading ? (
          <LoadingState label="Analyzing your skill coverage..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : !token ? (
          <EmptyState title="Sign in to view your skill gaps" description="Your readiness analysis is available for authenticated learners." />
        ) : matches.length === 0 || gapOpportunities.length === 0 ? (
          <EmptyState
            title="No published skill requirements yet"
            description="Your skill was added successfully. Skill gaps appear after an employer publishes an opportunity with required skills."
          />
        ) : (
          <>
            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <label htmlFor="target-opportunity" className="block text-sm font-semibold text-slate-900">
                Target role or opportunity
              </label>
              <p className="mt-1 text-sm text-slate-500">
                Choose the opportunity whose required skills you want to compare.
              </p>
              <select
                id="target-opportunity"
                value={selectedOpportunityId}
                onChange={(event) => setSelectedOpportunityId(event.target.value)}
                className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {gapOpportunities.map((opportunity) => (
                  <option key={opportunity.id} value={opportunity.id}>
                    {opportunity.title} · {opportunity.score}% match
                  </option>
                ))}
              </select>
            </section>

            <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard label="Missing skills" value={missing.length} icon={AlertTriangle} tone="amber" />
              <SummaryCard label="Strong skills" value={strong.length} icon={CheckCircle2} tone="emerald" />
              <SummaryCard label="Average coverage" value={`${averageCoverage}%`} icon={TrendingUp} tone="indigo" />
              <SummaryCard label="Required skills" value={allSkills.length} icon={Target} tone="violet" />
            </section>

            <section className="mb-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Priority skill gaps</h2>
                    <p className="mt-1 text-sm text-slate-500">Start with the skills showing the least verified coverage.</p>
                  </div>
                  <AlertTriangle className="text-amber-500" size={21} />
                </div>
                {priorityGaps.length === 0 ? (
                  <p className="rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">All required skills for this opportunity are fully covered.</p>
                ) : (
                  <div className="space-y-4">
                    {priorityGaps.map((skill) => <SkillRow key={skill.skill_id} skill={skill} />)}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">Coverage snapshot</h2>
                <p className="mt-1 text-sm text-slate-500">Your verified evidence across required skills.</p>
                <div className="mt-8 flex items-center gap-6">
                  <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-[14px] border-indigo-100">
                    <div className="absolute inset-[-14px] rounded-full border-[14px] border-indigo-600 border-b-transparent border-l-transparent" style={{ transform: `rotate(${45 + averageCoverage * 3.6}deg)` }} />
                    <div className="text-center"><p className="text-2xl font-bold text-slate-900">{averageCoverage}%</p><p className="text-[10px] uppercase tracking-wide text-slate-400">covered</p></div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <Legend color="bg-emerald-500" label="Strong" value={strong.length} />
                    <Legend color="bg-amber-400" label="Weak" value={weak.length} />
                    <Legend color="bg-red-400" label="Missing" value={missing.length} />
                    <Legend color="bg-slate-200" label="Tracked skills" value={allSkills.length} />
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-6 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-violet-700">
                <Sparkles size={18} />
                <h2 className="text-lg font-bold text-slate-900">AI learning recommendations</h2>
              </div>
              {aiLoading ? (
                <p className="text-sm text-slate-500">Generating recommendations for this job…</p>
              ) : aiError ? (
                <p className="text-sm text-red-600">{aiError}</p>
              ) : aiExplanation?.ai_available && aiExplanation.ai_explanation ? (
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{aiExplanation.ai_explanation}</p>
              ) : (
                <p className="text-sm leading-6 text-slate-600">
                  {priorityGaps.length > 0
                    ? "Start with these missing or weak skills to become eligible for the selected job."
                    : "No skill gaps were found for the selected job."}
                </p>
              )}
              {priorityGaps.length > 0 && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {priorityGaps.map((skill) => (
                    <a
                      key={skill.skill_id}
                      href={learningSearchUrl(skill.skill_name)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-violet-100 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-800 hover:bg-violet-100"
                    >
                      Learn {skill.skill_name}
                    </a>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5"><h2 className="text-lg font-bold text-slate-900">Gaps by opportunity</h2><p className="mt-1 text-sm text-slate-500">Understand what each opportunity expects from your profile.</p></div>
              <div className="space-y-4">
                {visibleOpportunities.map((item) => <OpportunityRow key={item.id} item={item} />)}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, tone }: { label: string; value: string | number; icon: typeof Target; tone: "amber" | "emerald" | "indigo" | "violet" }) {
  const tones = { amber: "bg-amber-50 text-amber-600", emerald: "bg-emerald-50 text-emerald-600", indigo: "bg-indigo-50 text-indigo-600", violet: "bg-violet-50 text-violet-600" };
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-slate-900">{value}</p></div><div className={`rounded-xl p-3 ${tones[tone]}`}><Icon size={21} /></div></div></div>;
}

function SkillRow({ skill }: { skill: SkillDetail }) {
  const missing = skill.status === "missing";
  return <div><div className="mb-2 flex items-center justify-between gap-3 text-sm"><span className="font-semibold text-slate-800">{skill.skill_name}</span><span className={`font-semibold ${missing ? "text-red-600" : "text-amber-600"}`}>{missing ? "Missing" : `${Math.round(skill.coverage)}% covered`}</span></div><div className="h-2 rounded-full bg-slate-100"><div className={`h-full rounded-full ${missing ? "bg-red-400" : "bg-amber-400"}`} style={{ width: `${Math.min(100, Math.max(0, skill.coverage))}%` }} /></div></div>;
}

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return <div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${color}`} /><span className="text-slate-600">{label}</span><span className="font-bold text-slate-900">{value}</span></div>;
}

function OpportunityRow({ item }: { item: OpportunityGap }) {
  const gaps = item.skills.filter((skill) => skill.status !== "strong");
  return <div className="rounded-xl border border-slate-100 bg-slate-50 p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="font-semibold text-slate-900">{item.title}</h3><p className="mt-1 text-xs text-slate-500">{gaps.length === 0 ? "All required skills covered" : `${gaps.length} skill gap${gaps.length === 1 ? "" : "s"}`} · {item.score}% overall match</p></div><Link href={`/dashboard/opportunities/${item.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800">View opportunity <ArrowUpRight size={14} /></Link></div><div className="mt-3 flex flex-wrap gap-2">{gaps.map((skill) => <span key={skill.skill_id} className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${skill.status === "missing" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{skill.skill_name}</span>)}</div></div>;
}