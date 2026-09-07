"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Trophy } from "lucide-react";

import ChallengeStats from "../../../component/employers/challenges/ChallengeStats";
import ChallengeFilters from "../../../component/employers/challenges/ChallengeFilters";
import ChallengeTable, {
  Challenge,
} from "../../../component/employers/challenges/ChallengeTable";
import { api, type ChallengePublic } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";

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

function mapChallenge(c: ChallengePublic): Challenge {
  return {
    id: c.id,
    title: c.title,
    category: "General",
    difficulty: c.difficulty,
    participants: 0,
    deadline: formatDate(c.submission_deadline),
    duration: c.time_limit_seconds
      ? `${Math.round(c.time_limit_seconds / 60)} min`
      : "Unlimited",
    status: c.status,
  };
}

export default function ChallengesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const fetcher = useMemo(
    () => () =>
      api.challenges.list({
        search: search || undefined,
        page_size: 100,
      }),
    [search],
  );
  const { data, loading, error, refetch } = useFetch(fetcher, [search]);

  const challenges: Challenge[] = useMemo(
    () => (data?.items || []).map(mapChallenge),
    [data],
  );

  const filteredChallenges = challenges.filter((challenge) => {
    const matchesStatus = status === "All" || challenge.status === status;
    return matchesStatus;
  });

  const activeCount = challenges.filter(
    (item) => item.status === "published",
  ).length;
  const participants = challenges.reduce(
    (total, item) => total + item.participants,
    0,
  );
  const completedCount = challenges.filter(
    (item) => item.status === "closed",
  ).length;

  const handleView = (challenge: Challenge) => {
    alert(
      `Challenge: ${challenge.title}\nCategory: ${challenge.category}\nDifficulty: ${challenge.difficulty}`,
    );
  };

  const handleEdit = (challenge: Challenge) => {
    alert(
      `Editing ${challenge.title} is not yet supported via the API. Status: ${challenge.status}`,
    );
  };

  const handleDelete = (id: string | number) => {
    void id;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Trophy className="h-4 w-4" />
            <span>Employer Portal</span>
            <span>/</span>
            <span>Challenges</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Challenges</h1>
          <p className="mt-1 text-slate-500">
            Create and manage practical challenges for candidates.
          </p>
        </div>
        <Link
          href="/dashboard/challenges"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Create Challenge
        </Link>
      </div>

      {/* Stats */}
      <ChallengeStats
        total={challenges.length}
        active={activeCount}
        participants={participants}
        completed={completedCount}
      />

      {/* Main */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ChallengeFilters
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
        />

        {loading ? (
          <LoadingState label="Loading challenges…" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : filteredChallenges.length === 0 ? (
          <EmptyState
            title="No challenges found"
            description="Try changing your search or filter."
          />
        ) : (
          <ChallengeTable
            challenges={filteredChallenges}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
          <p className="text-sm text-slate-500">
            Showing {filteredChallenges.length} challenges
          </p>
        </div>
      </div>
    </div>
  );
}
