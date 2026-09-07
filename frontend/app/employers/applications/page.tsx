"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BriefcaseBusiness, Users } from "lucide-react";

import ApplicationStats from "../../../component/employers/applications/ApplicationStats";
import ApplicationFilters from "../../../component/employers/applications/ApplicationFilters";
import ApplicationTable, {
  Application,
} from "../../../component/employers/applications/ApplicationTable";
import { api, type ApplicationPublic, type ApplicationStatus } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useFetch } from "@/lib/useFetch";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";

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

function mapApp(a: ApplicationPublic): Application {
  return {
    id: a.id,
    name: `Candidate ${a.profile_id.slice(0, 6)}`,
    email: "—",
    job: a.opportunity_id,
    location: "—",
    applied: timeAgo(a.applied_at),
    experience: "—",
    skills: [],
    status: a.status,
  };
}

const STATUS_OPTIONS: ApplicationStatus[] = [
  "submitted",
  "reviewing",
  "shortlisted",
  "rejected",
  "accepted",
  "withdrawn",
];

export default function ApplicationsPage() {
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetcher = useMemo(
    () => () =>
      token
        ? api.applications.list({ page_size: 100 }, token)
        : Promise.resolve({ items: [], total: 0, page: 1, page_size: 100, pages: 0 }),
    [token],
  );
  const { data, loading, error, refetch } = useFetch(fetcher, [token]);

  const applications: Application[] = useMemo(
    () => (data?.items || []).map(mapApp),
    [data],
  );

  const filteredApplications = applications.filter((application) => {
    const text = search.toLowerCase();
    const matchesSearch =
      application.name.toLowerCase().includes(text) ||
      application.job.toLowerCase().includes(text);
    const matchesStatus = status === "All" || application.status === status;
    return matchesSearch && matchesStatus;
  });

  async function handleStatusUpdate(
    id: string,
    newStatus: ApplicationStatus,
  ) {
    if (!token) return;
    setUpdating(id);
    try {
      await api.applications.updateStatus(id, { status: newStatus }, token);
      refetch();
    } catch {
      /* ignore */
    } finally {
      setUpdating(null);
    }
  }

  const handleDelete = (id: string | number) => {
    void id;
  };

  const handleView = (application: Application) => {
    alert(
      `Candidate: ${application.name}\nJob: ${application.job}\nStatus: ${application.status}`,
    );
  };

  const handleEdit = (application: Application) => {
    const newStatus = window.prompt(
      `Enter new status:\n${STATUS_OPTIONS.join(", ")}`,
      application.status,
    );
    if (!newStatus) return;
    if (!STATUS_OPTIONS.includes(newStatus as ApplicationStatus)) {
      alert("Invalid status.");
      return;
    }
    handleStatusUpdate(String(application.id), newStatus as ApplicationStatus);
  };

  const newCount = applications.filter((a) => a.status === "submitted").length;
  const shortlisted = applications.filter((a) => a.status === "shortlisted").length;
  const interviews = applications.filter((a) => a.status === "accepted").length;

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <BriefcaseBusiness className="h-4 w-4" />
            <span>Employer Portal</span>
            <span>/</span>
            <span>Applications</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Applications</h1>
          <p className="mt-1 text-slate-500">
            Review and manage candidate applications.
          </p>
        </div>
        <Link
          href="/employers/matching"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <Users className="h-5 w-5" />
          Browse Candidates
        </Link>
      </div>

      {!token && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Sign in as an employer to view applications.
        </div>
      )}

      {/* Stats */}
      <ApplicationStats
        total={applications.length}
        newCount={newCount}
        shortlisted={shortlisted}
        interviews={interviews}
      />

      {/* Applications */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ApplicationFilters
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
        />

        {loading ? (
          <LoadingState label="Loading applications…" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            title="No applications found"
            description="Try changing your search or filter."
          />
        ) : (
          <ApplicationTable
            applications={filteredApplications}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
          <p className="text-sm text-slate-500">
            Showing {filteredApplications.length} applications
            {updating && " • Updating…"}
          </p>
        </div>
      </div>
    </div>
  );
}
