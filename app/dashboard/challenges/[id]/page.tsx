"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import ChallengeSubmission from "@/components/challenges/ChallengeSubmission";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useMemo } from "react";
import { api, type ChallengeDetailPublic } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/ui/states";

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

export default function ChallengeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const fetcher = useMemo(() => () => api.challenges.get(id), [id]);
  const { data: challenge, loading, error, refetch } =
    useFetch<ChallengeDetailPublic>(fetcher, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <LoadingState label="Loading challenge…" />
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/dashboard/challenges"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            <ArrowLeft size={18} />
            Back to Challenges
          </Link>
          {error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : (
            <EmptyState title="Challenge not found" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard/challenges"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft size={18} />
          Back to Challenges
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                Practical Challenge
              </span>
              <h1 className="mt-4 text-3xl font-bold text-slate-900">
                {challenge.title}
              </h1>
              <p className="mt-2 max-w-2xl text-slate-500">
                {challenge.description || "No description provided."}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-4 text-amber-700">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Clock size={18} />
                Deadline
              </div>
              <p className="mt-1 text-sm">
                {formatDate(challenge.submission_deadline)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Difficulty</p>
            <p className="mt-1 font-semibold capitalize text-slate-900">
              {challenge.difficulty}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Time Limit</p>
            <p className="mt-1 font-semibold text-slate-900">
              {challenge.time_limit_seconds
                ? `${Math.round(challenge.time_limit_seconds / 60)} min`
                : "Unlimited"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Status</p>
            <p className="mt-1 font-semibold capitalize text-slate-900">
              {challenge.status}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Skills Tested</h2>
          <p className="mt-1 text-sm text-slate-500">
            This challenge evaluates the following skills.
          </p>
          {challenge.skills.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No specific skills mapped.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {challenge.skills.map((skill) => (
                <span
                  key={skill.skill_id}
                  className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700"
                >
                  {skill.skill_name}
                </span>
              ))}
            </div>
          )}
        </div>

        {challenge.instructions && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Challenge Instructions
            </h2>
            <p className="mt-4 whitespace-pre-line leading-7 text-slate-600">
              {challenge.instructions}
            </p>
          </div>
        )}

        <ChallengeSubmission
          challengeId={challenge.id}
          challengeTitle={challenge.title}
        />
      </div>
    </div>
  );
}
