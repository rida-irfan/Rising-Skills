"use client";

import EvidenceCard, {
  Evidence,
} from "@/components/evidence/EvidenceCard";
import EvidenceFilters from "@/components/evidence/EvidenceFilters";
import {
  Award,
  BookOpenCheck,
  Loader2,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
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

// mapEvidence is defined inside the component to access skillMap

function StatCard({
  label,
  value,
  icon,
  iconClass,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClass}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function EvidencePage() {
  const { token } = useAuth();
  const [skillMap, setSkillMap] = useState<Record<string, string>>({});
  const targetSkillId = "9459f01f-8f20-4ee6-be77-3d0bf8fb1d8d";
  // Load all skills
  useEffect(() => {
    if (!token) return;
    api.skills.list({}, token).then((res) => {
      const map: Record<string, string> = {};
      res.items.forEach((s) => {
        // @ts-ignore - assume SkillResponse has id and name
        map[s.id] = s.name;
      });
      setSkillMap(map);
    });
  }, [token]);
  // Ensure the specific skill is present; fetch individually if missing
  useEffect(() => {
    if (!token) return;
    if (skillMap[targetSkillId]) return; // already have it
    api.skills.get(targetSkillId).then((res) => {
      setSkillMap((prev) => ({ ...prev, [targetSkillId]: res.name }));
    }).catch(() => {
      // ignore errors; name will remain missing
    });
  }, [token, skillMap]);

  function mapEvidence(e: EvidencePublic): Evidence {
    const state: Evidence["state"] =
      e.source_type === "assessment"
        ? "Assessed"
        : "Demonstrated";
    const skillName = skillMap[e.skill_id] ?? "";
    return {
      id: e.id,
      skill: skillName || "Unknown Skill",
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
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

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

  const fetchAiSummary = async () => {
    if (aiSummary || aiLoading) return;
    if (!token) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await api.ai.evidenceSummary(token);
      if (res.ai_available && res.summary) {
        setAiSummary(res.summary);
      } else {
        setAiSummary("AI summary is currently unavailable. Your evidence records are shown below.");
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Failed to load AI summary");
    } finally {
      setAiLoading(false);
    }
  };

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

        {/* AI Summary Section */}
        {evidence.length > 0 && (
          <div className="mb-8 rounded-2xl border border-violet-100 bg-violet-50 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-violet-600">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    AI Portfolio Summary
                  </h3>
                  <p className="text-xs text-slate-500">
                    Get an AI-generated analysis of your evidence portfolio
                  </p>
                </div>
              </div>
              {!aiSummary && (
                <button
                  onClick={fetchAiSummary}
                  disabled={aiLoading || !token}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate Summary
                    </>
                  )}
                </button>
              )}
            </div>

            {aiSummary && (
              <div className="mt-4 rounded-xl bg-white p-4">
                <p className="text-sm leading-7 text-slate-700 whitespace-pre-line">
                  {aiSummary}
                </p>
                <button
                  onClick={() => setAiSummary(null)}
                  className="mt-3 text-xs font-semibold text-violet-600 hover:text-violet-800"
                >
                  Clear summary
                </button>
              </div>
            )}

            {aiError && (
              <p className="mt-3 flex items-center gap-1 text-sm text-red-600">
                <XCircle size={14} />
                {aiError}
              </p>
            )}
          </div>
        )}

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


