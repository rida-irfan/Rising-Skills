"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  BriefcaseBusiness,
  FileText,
  Users,
  UserCheck,
  Plus,
  ArrowRight,
  MoreHorizontal,
  Trophy,
  Target,
} from "lucide-react";
import {
  api,
  type ApplicationPublic,
  type OpportunityPublic,
  type OrganizationAnalytics,
  type OrganizationResponse,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useFetch } from "@/lib/useFetch";
import { LoadingState, ErrorState } from "@/components/ui/states";

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  } catch {
    return iso;
  }
}

export default function EmployerDashboard() {
  const { token, profile } = useAuth();

  // Fetch the employer's first organization.
  const orgFetcher = useMemo(
    () => () =>
      token
        ? api.organizations
            .list(token)
            .then((orgs) => (orgs.length > 0 ? orgs[0] : null))
        : Promise.resolve(null as OrganizationResponse | null),
    [token],
  );
  const { data: org, loading: orgLoading, error: orgError } = useFetch(orgFetcher, [token]);

  // Fetch analytics for the organization.
  const analyticsFetcher = useMemo(
    () => () =>
      token && org
        ? api.analytics.organization(org.id, token).catch(() => null)
        : Promise.resolve(null as OrganizationAnalytics | null),
    [token, org],
  );
  const { data: analytics } = useFetch(analyticsFetcher, [token, org]);

  // Fetch recent opportunities.
  const oppFetcher = useMemo(
    () => () =>
      api.opportunities.list({ page_size: 5 }),
    [],
  );
  const { data: oppData } = useFetch(oppFetcher, []);
  const jobs: OpportunityPublic[] = oppData?.items || [];

  // Fetch recent applications.
  const appFetcher = useMemo(
    () => () =>
      token
        ? api.applications.list({ page_size: 5 }, token)
        : Promise.resolve({ items: [], total: 0, page: 1, page_size: 5, pages: 0 }),
    [token],
  );
  const { data: appData } = useFetch(appFetcher, [token]);
  const applications: ApplicationPublic[] = appData?.items || [];

  const stats = [
    {
      title: "Active Jobs",
      value: String(analytics?.published_opportunities ?? jobs.filter((j) => j.status === "published").length),
      description: "Currently published",
      icon: BriefcaseBusiness,
    },
    {
      title: "Applications",
      value: String(analytics?.total_applications ?? applications.length),
      description: "Total applications",
      icon: FileText,
    },
    {
      title: "Shortlisted",
      value: String(analytics?.shortlisted_applications ?? 0),
      description: "Candidates shortlisted",
      icon: UserCheck,
    },
    {
      title: "Accepted",
      value: String(analytics?.accepted_applications ?? 0),
      description: "Candidates accepted",
      icon: Users,
    },
  ];

  if (orgLoading) {
    return (
      <div className="space-y-7">
        <LoadingState label="Loading dashboard…" />
      </div>
    );
  }

  if (orgError) {
    return (
      <div className="space-y-7">
        <ErrorState message={orgError} />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-900 px-7 py-8 text-white shadow-sm">
        <div className="relative z-10">
          <p className="mb-2 text-sm font-medium text-slate-300">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""} 👋
          </p>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Find the right talent for your opportunities.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Manage your job opportunities, review applications,
            discover skilled candidates and build your ideal team.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/employers/jobs"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <Plus size={17} />
              Post a Job
            </Link>
            <Link
              href="/employers/matching"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Find Candidates
            </Link>
          </div>
        </div>
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
      </section>

      {!token && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Sign in as an employer to see live analytics and applications.
        </div>
      )}

      {/* Statistics */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon size={21} />
                </div>
                <MoreHorizontal size={20} className="text-slate-400" />
              </div>
              <p className="mt-5 text-sm font-medium text-slate-500">
                {stat.title}
              </p>
              <h3 className="mt-1 text-3xl font-bold text-slate-900">
                {stat.value}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                {stat.description}
              </p>
            </div>
          );
        })}
      </section>

      {/* Applications + Jobs */}
      <section className="grid gap-6 xl:grid-cols-3">
        {/* Applications */}
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="font-semibold text-slate-900">Recent Applications</h2>
              <p className="mt-1 text-xs text-slate-500">
                Latest candidate applications
              </p>
            </div>
            <Link
              href="/employers/applications"
              className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View all
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Candidate
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Position
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Applied
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-400">
                      No applications yet.
                    </td>
                  </tr>
                ) : (
                  applications.map((application) => (
                    <tr
                      key={application.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                            {application.profile_id.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-slate-800">
                            Candidate {application.profile_id.slice(0, 6)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {application.opportunity_id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {timeAgo(application.applied_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                            application.status === "shortlisted"
                              ? "bg-emerald-50 text-emerald-600"
                              : application.status === "reviewing"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {application.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Jobs */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="font-semibold text-slate-900">Active Jobs</h2>
              <p className="mt-1 text-xs text-slate-500">Your current opportunities</p>
            </div>
            <Link
              href="/employers/jobs"
              className="text-sm font-medium text-indigo-600"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {jobs.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-slate-400">
                No opportunities yet.
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="px-6 py-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        {job.title}
                      </h3>
                      <p className="mt-1 text-xs capitalize text-slate-500">
                        {job.opportunity_type}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium capitalize text-emerald-600">
                      {job.status}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                    <FileText size={14} />
                    {job.location || "Remote"}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 p-4">
            <Link
              href="/employers/jobs"
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Manage Jobs
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/employers/jobs"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200"
          >
            <BriefcaseBusiness className="text-indigo-600" size={22} />
            <h3 className="mt-4 text-sm font-semibold text-slate-900">Post a Job</h3>
            <p className="mt-1 text-xs text-slate-500">Create a new opportunity</p>
          </Link>
          <Link
            href="/employers/matching"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200"
          >
            <Users className="text-indigo-600" size={22} />
            <h3 className="mt-4 text-sm font-semibold text-slate-900">Find Candidates</h3>
            <p className="mt-1 text-xs text-slate-500">Discover suitable talent</p>
          </Link>
          <Link
            href="/employers/challenges"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200"
          >
            <Trophy className="text-indigo-600" size={22} />
            <h3 className="mt-4 text-sm font-semibold text-slate-900">Create Challenge</h3>
            <p className="mt-1 text-xs text-slate-500">Test candidate skills</p>
          </Link>
          <Link
            href="/employers/matching"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200"
          >
            <Target className="text-indigo-600" size={22} />
            <h3 className="mt-4 text-sm font-semibold text-slate-900">Candidate Matching</h3>
            <p className="mt-1 text-xs text-slate-500">Find high-match candidates</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
