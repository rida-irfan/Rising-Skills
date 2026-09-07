"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Plus,
  Search,
  Eye,
  Pencil,
  MoreHorizontal,
  Users,
  Clock3,
  CheckCircle2,
  PauseCircle,
  XCircle,
  MapPin,
  CalendarDays,
} from "lucide-react";
import { api, type OpportunityPublic } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
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

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} week(s) ago`;
    return `${Math.floor(days / 30)} month(s) ago`;
  } catch {
    return iso;
  }
}

export default function JobsPage() {
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch all opportunities — the API returns opportunities the employer
  // is allowed to see based on their auth token.
  const fetcher = useMemo(
    () => () =>
      api.opportunities.list({
        search: search || undefined,
        page_size: 100,
      }),
    [search],
  );
  const { data, loading, error, refetch } = useFetch(fetcher, [search]);

  const jobs: OpportunityPublic[] = data?.items || [];

  const filteredJobs = jobs.filter((job) => {
    const matchesStatus =
      statusFilter === "all" || job.status === statusFilter;
    return matchesStatus;
  });

  const activeCount = jobs.filter((j) => j.status === "published").length;
  const draftCount = jobs.filter((j) => j.status === "draft").length;
  const closedCount = jobs.filter((j) => j.status === "closed").length;

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <BriefcaseBusiness className="h-4 w-4" />
            <span>Employer Portal</span>
            <span>/</span>
            <span>Jobs</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Job Opportunities
          </h1>
          <p className="mt-1 text-slate-500">
            Create and manage your company&apos;s job opportunities.
          </p>
        </div>
        <Link
          href="/dashboard/opportunities"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Post New Job
        </Link>
      </div>

      {!token && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Sign in as an employer to manage your organization&apos;s opportunities.
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Jobs"
          value={String(jobs.length)}
          icon={<BriefcaseBusiness className="h-5 w-5" />}
          text="All job postings"
        />
        <StatCard
          title="Active Jobs"
          value={String(activeCount)}
          icon={<CheckCircle2 className="h-5 w-5" />}
          text="Currently hiring"
        />
        <StatCard
          title="Draft Jobs"
          value={String(draftCount)}
          icon={<PauseCircle className="h-5 w-5" />}
          text="Not published yet"
        />
        <StatCard
          title="Closed Jobs"
          value={String(closedCount)}
          icon={<XCircle className="h-5 w-5" />}
          text="No longer accepting"
        />
      </div>

      {/* Main Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Filters */}
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {["all", "published", "draft", "closed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
                    statusFilter === status
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Job List */}
        {loading ? (
          <LoadingState label="Loading jobs…" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : filteredJobs.length === 0 ? (
          <EmptyState
            title="No jobs found"
            description="Try changing your search or filter."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredJobs.map((job) => (
              <div key={job.id} className="p-5 transition hover:bg-slate-50">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <BriefcaseBusiness className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900">
                          {job.title}
                        </h3>
                        <StatusBadge status={job.status} />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {job.description
                          ? job.description.slice(0, 80)
                          : "No description"}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {job.location || "Not specified"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BriefcaseBusiness className="h-4 w-4" />
                          <span className="capitalize">
                            {job.opportunity_type}
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4" />
                          Deadline: {formatDate(job.deadline)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock3 className="h-4 w-4" />
                          Posted {timeAgo(job.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-5 xl:justify-end">
                    <Link
                      href={`/dashboard/opportunities/${job.id}`}
                      className="text-left xl:text-right"
                    >
                      <p className="text-sm font-semibold text-blue-600">
                        View
                      </p>
                    </Link>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/opportunities/${job.id}`}
                        title="View Job"
                        className="rounded-lg border border-slate-200 p-2.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        title="Edit Job"
                        className="rounded-lg border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        title="More Options"
                        className="rounded-lg border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
          <div className="flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {filteredJobs.length} of {jobs.length} jobs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  text,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">{value}</h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-400">{text}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-emerald-50 text-emerald-700 border-emerald-200",
    draft: "bg-amber-50 text-amber-700 border-amber-200",
    closed: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
        styles[status] || "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      {status}
    </span>
  );
}
