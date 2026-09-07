"use client";

import ChallengeCard from "@/components/challenges/ChallengeCard";
import ChallengeFilters from "@/components/challenges/ChallengeFilters";
import {
  CheckCircle2,
  Clock3,
  Code2,
  Trophy,
} from "lucide-react";
import { useMemo, useState } from "react";
import { api, type ChallengePublic } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/ui/states";

export default function ChallengesPage() {
  const [search, setSearch] = useState("");

  const fetcher = useMemo(
    () => () =>
      api.challenges.list({
        search: search || undefined,
        page_size: 100,
      }),
    [search],
  );
  const { data, loading, error, refetch } = useFetch(fetcher, [search]);

  const challenges: ChallengePublic[] = data?.items || [];

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-indigo-600">
            PRACTICAL ASSESSMENT
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Practical Challenges
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Test your skills through real-world practical challenges.
            Complete a challenge, submit your work, and earn demonstrated
            skill evidence.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Available Challenges"
            value={String(challenges.length)}
            icon={<Code2 size={22} />}
            iconClass="bg-indigo-50 text-indigo-600"
          />
          <StatCard
            title="Published"
            value={String(
              challenges.filter((c) => c.status === "published").length,
            )}
            icon={<Clock3 size={22} />}
            iconClass="bg-amber-50 text-amber-600"
          />
          <StatCard
            title="Beginner Friendly"
            value={String(
              challenges.filter((c) => c.difficulty === "beginner").length,
            )}
            icon={<CheckCircle2 size={22} />}
            iconClass="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            title="Advanced"
            value={String(
              challenges.filter((c) => c.difficulty === "advanced").length,
            )}
            icon={<Trophy size={22} />}
            iconClass="bg-violet-50 text-violet-600"
          />
        </div>

        {/* Filters */}
        <ChallengeFilters
          search={search}
          onSearchChange={setSearch}
        />

        {/* Section */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Available Challenges
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose a challenge that matches your skills and interests.
            </p>
          </div>
          <span className="hidden rounded-lg bg-white px-3 py-2 text-sm text-slate-500 shadow-sm sm:block">
            {challenges.length} challenges
          </span>
        </div>

        {/* Body */}
        {loading ? (
          <LoadingState label="Loading challenges…" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : challenges.length === 0 ? (
          <EmptyState
            title="No challenges found"
            description="Try a different search or check back later."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {challenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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
