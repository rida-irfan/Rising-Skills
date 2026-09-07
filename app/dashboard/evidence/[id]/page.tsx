"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ShieldCheck,
} from "lucide-react";
import { useMemo } from "react";
import { api, type EvidencePublic, type VerificationPublic } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useFetch } from "@/lib/useFetch";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";

export default function EvidenceDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const { token } = useAuth();

  const fetcher = useMemo(
    () => () => api.evidence.get(id, token),
    [id, token],
  );
  const { data: evidence, loading, error, refetch } =
    useFetch<EvidencePublic>(fetcher, [id, token]);

  const verFetcher = useMemo(
    () => () =>
      token
        ? api.verifications.forEvidence(id, token).catch(() => [] as VerificationPublic[])
        : Promise.resolve([] as VerificationPublic[]),
    [id, token],
  );
  const { data: verifications } = useFetch<VerificationPublic[]>(verFetcher, [id, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <LoadingState label="Loading evidence…" />
        </div>
      </div>
    );
  }

  if (error || !evidence) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/dashboard/evidence"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            <ArrowLeft size={18} />
            Back to Evidence
          </Link>
          {error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : (
            <EmptyState title="Evidence not found" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard/evidence"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft size={18} />
          Back to Evidence
        </Link>

        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <ShieldCheck size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold capitalize text-indigo-600">
                  {evidence.status} EVIDENCE
                </p>
                <h1 className="mt-2 text-2xl font-bold text-slate-900">
                  {evidence.source_type === "assessment"
                    ? "Assessment Evidence"
                    : "Challenge Submission Evidence"}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Skill ID: {evidence.skill_id}
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-400">Score</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                {Math.round(evidence.score)}%
              </p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Details</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Row label="Source Type" value={evidence.source_type} />
              <Row label="Source ID" value={evidence.source_id} />
              <Row label="Status" value={evidence.status} />
              <Row
                label="Created"
                value={new Date(evidence.created_at).toLocaleString()}
              />
              <Row
                label="Updated"
                value={new Date(evidence.updated_at).toLocaleString()}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Verification Audit Trail
            </h2>
            {!token ? (
              <p className="mt-4 text-sm text-slate-500">
                Sign in to view the verification history.
              </p>
            ) : verifications && verifications.length > 0 ? (
              <div className="mt-4 space-y-4">
                {verifications.map((v) => (
                  <div
                    key={v.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      {v.from_status} → {v.to_status}
                    </div>
                    {v.notes && (
                      <p className="mt-1 text-xs text-slate-500">{v.notes}</p>
                    )}
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <Clock3 size={12} />
                      {new Date(v.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                No verification events recorded yet.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium capitalize text-slate-700">{value}</span>
    </div>
  );
}
