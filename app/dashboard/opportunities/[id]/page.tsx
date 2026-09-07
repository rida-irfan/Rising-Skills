"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Sparkles,
  Target,
  UserCheck,
  XCircle,
} from "lucide-react";

import { useMemo, useState } from "react";
import {
  api,
  ApiError,
  type MatchPublic,
  type OpportunityDetailPublic,
  type OrganizationResponse,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useFetch } from "@/lib/useFetch";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/ui/states";

function formatDate(iso: string | null): string {
  if (!iso) return "Not specified";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function OpportunityDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const { token } = useAuth();

  const [applied, setApplied] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [coverNote, setCoverNote] = useState("");

  const detailFetcher = useMemo(
    () => () => api.opportunities.get(id),
    [id],
  );
  const { data: opportunity, loading, error, refetch } =
    useFetch<OpportunityDetailPublic>(detailFetcher, [id]);

  const matchFetcher = useMemo(
    () => () =>
      token
        ? api.matches.calculate(id, token).catch(() => null)
        : Promise.resolve(null),
    [id, token],
  );
  const { data: match } = useFetch<MatchPublic | null>(matchFetcher, [id, token]);

  const orgFetcher = useMemo(
    () => () =>
      opportunity?.organization_id
        ? api.organizations
            .get(opportunity.organization_id, token)
            .catch(() => null)
        : Promise.resolve(null),
    [opportunity?.organization_id, token],
  );
  const { data: org } = useFetch<OrganizationResponse | null>(orgFetcher, [
    opportunity?.organization_id,
    token,
  ]);

  async function handleApply() {
    if (!token) {
      setApplyError("You must be signed in to apply.");
      return;
    }
    setApplying(true);
    setApplyError(null);
    try {
      await api.opportunities.apply(
        id,
        { cover_note: coverNote || undefined },
        token,
      );
      setApplied(true);
    } catch (err) {
      setApplyError(
        err instanceof ApiError
          ? `Application failed (${err.status}).`
          : err instanceof Error
            ? err.message
            : "Application failed.",
      );
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <LoadingState label="Loading opportunity…" />
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/dashboard/opportunities"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            <ArrowLeft size={18} />
            Back to Opportunities
          </Link>
          {error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : (
            <EmptyState title="Opportunity not found" />
          )}
        </div>
      </div>
    );
  }

  const matchPct = match ? Math.round(match.overall_score) : null;

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Back */}
        <Link
          href="/dashboard/opportunities"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft size={18} />
          Back to Opportunities
        </Link>

        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Building2 size={30} />
              </div>
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold capitalize text-indigo-700">
                    {opportunity.opportunity_type}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                    {opportunity.status}
                  </span>
                </div>

                <h1 className="mt-3 text-3xl font-bold text-slate-900">
                  {opportunity.title}
                </h1>

                <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <Building2 size={16} />
                  {org?.name || "Organization"}
                </p>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-2">
                    <MapPin size={16} />
                    {opportunity.location || "Not specified"}
                  </span>
                  <span className="flex items-center gap-2">
                    <Briefcase size={16} />
                    {opportunity.is_remote ? "Remote" : "On-site"}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock3 size={16} />
                    {opportunity.opportunity_type}
                  </span>
                </div>
              </div>
            </div>

            {/* Match */}
            <div className="min-w-[190px] rounded-2xl bg-indigo-50 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                <Target size={18} />
                Match Score
              </div>
              <p className="mt-2 text-4xl font-bold text-indigo-700">
                {matchPct != null ? `${matchPct}%` : "—"}
              </p>
              <p className="mt-1 text-xs text-indigo-600">
                {matchPct != null
                  ? matchPct >= 70
                    ? "Strong match with your profile"
                    : matchPct >= 40
                      ? "Partial match"
                      : "Low match"
                  : "Sign in to see your match"}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* LEFT */}
          <div className="space-y-6 lg:col-span-2">
            <Section title="About this Opportunity">
              <p className="leading-7 text-slate-600">
                {opportunity.description || "No description provided."}
              </p>
            </Section>

            <Section title="Opportunity Information">
              <div className="grid gap-4 sm:grid-cols-2">
                <Info
                  icon={<Briefcase size={18} />}
                  label="Opportunity Type"
                  value={opportunity.opportunity_type}
                />
                <Info
                  icon={<MapPin size={18} />}
                  label="Location"
                  value={opportunity.location || "Not specified"}
                />
                <Info
                  icon={<Clock3 size={18} />}
                  label="Work Mode"
                  value={opportunity.is_remote ? "Remote" : "On-site"}
                />
                <Info
                  icon={<CalendarDays size={18} />}
                  label="Deadline"
                  value={formatDate(opportunity.deadline)}
                />
              </div>
            </Section>

            <Section title="Required Skills">
              {opportunity.skills.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No required skills listed.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {opportunity.skills.map((skill) => (
                    <span
                      key={skill.skill_id}
                      className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700"
                    >
                      {skill.skill_name}
                      <span className="ml-2 text-xs text-indigo-400">
                        {Math.round(skill.importance_weight * 100)}%
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </Section>

            {match && (
              <Section title="Match Breakdown">
                <div className="grid gap-3 sm:grid-cols-3">
                  <ScorePill
                    label="Skill"
                    value={Math.round(match.skill_score)}
                  />
                  <ScorePill
                    label="Evidence"
                    value={Math.round(match.evidence_score)}
                  />
                  <ScorePill
                    label="Experience"
                    value={Math.round(match.experience_score)}
                  />
                </div>
              </Section>
            )}
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* Eligibility */}
            <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                  <UserCheck size={21} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Eligibility</h2>
                  <p className="text-xs text-slate-500">
                    Match-based eligibility check
                  </p>
                </div>
              </div>
              <div
                className={`mt-5 rounded-xl p-4 ${
                  matchPct != null && matchPct >= 60
                    ? "bg-emerald-50"
                    : "bg-amber-50"
                }`}
              >
                <div
                  className={`flex items-center gap-2 text-sm font-semibold ${
                    matchPct != null && matchPct >= 60
                      ? "text-emerald-700"
                      : "text-amber-700"
                  }`}
                >
                  {matchPct != null && matchPct >= 60 ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <XCircle size={18} />
                  )}
                  {matchPct != null && matchPct >= 60
                    ? "You are eligible"
                    : "Below eligibility threshold"}
                </div>
                <p
                  className={`mt-2 text-xs leading-5 ${
                    matchPct != null && matchPct >= 60
                      ? "text-emerald-700"
                      : "text-amber-700"
                  }`}
                >
                  {matchPct != null
                    ? matchPct >= 60
                      ? "You meet the recommended match threshold for this opportunity."
                      : "Improve your skills to raise your match score above 60%."
                    : "Sign in to calculate your eligibility."}
                </p>
              </div>
            </section>

            {/* Apply */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              {!applied ? (
                <>
                  <h2 className="text-lg font-bold text-slate-900">
                    Interested in this Opportunity?
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Submit your application and let the employer review your
                    profile.
                  </p>

                  <textarea
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Optional cover note (max 5000 chars)"
                    rows={4}
                    maxLength={5000}
                    className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400"
                  />

                  {applyError && (
                    <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                      {applyError}
                    </p>
                  )}

                  <button
                    onClick={handleApply}
                    disabled={applying || !token}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {applying ? "Applying…" : "Apply Now"}
                    <ArrowRight size={17} />
                  </button>
                  {!token && (
                    <p className="mt-2 text-center text-xs text-slate-400">
                      Sign in to apply.
                    </p>
                  )}
                </>
              ) : (
                <ApplicationStatus />
              )}
            </section>

            {/* Company */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                About the Company
              </h2>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <Building2 size={21} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {org?.name || "Organization"}
                  </p>
                  {org?.website_url && (
                    <a
                      href={org.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      {org.website_url}
                    </a>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Section */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

/* Info */
function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
      <div className="rounded-lg bg-white p-2 text-indigo-600 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="mt-1 text-sm font-semibold capitalize text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 text-center">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}%</p>
    </div>
  );
}

/* Application Status */
function ApplicationStatus() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
          <CheckCircle2 size={21} />
        </div>
        <div>
          <h2 className="font-bold text-slate-900">Application Submitted</h2>
          <p className="text-xs text-slate-500">
            Your application has been received.
          </p>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        <Step title="Submitted" description="Application submitted successfully" active />
        <Step title="Under Review" description="Waiting for employer review" />
        <Step title="Shortlisted" description="Candidate selected for next stage" />
        <Step
          title="Offered / Rejected / Closed"
          description="Final application outcome"
          last
        />
      </div>
    </div>
  );
}

/* Step */
function Step({
  title,
  description,
  active = false,
  last = false,
}: {
  title: string;
  description: string;
  active?: boolean;
  last?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full ${
            active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
          }`}
        >
          {active ? <CheckCircle2 size={16} /> : <span className="text-xs">•</span>}
        </div>
        {!last && <div className="mt-1 h-8 w-px bg-slate-200" />}
      </div>
      <div>
        <p
          className={`text-sm font-semibold ${
            active ? "text-slate-900" : "text-slate-400"
          }`}
        >
          {title}
        </p>
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      </div>
    </div>
  );
}
