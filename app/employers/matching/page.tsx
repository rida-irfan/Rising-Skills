"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Users,
  Target,
  UserCheck,
  Star,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  BriefcaseBusiness,
  MapPin,
  Clock3,
  ChevronDown,
} from "lucide-react";
import {
  api,
  type MatchPublic,
  type OpportunityPublic,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useFetch } from "@/lib/useFetch";
import { LoadingState, ErrorState } from "@/components/ui/states";

type MatchLevel = "High" | "Medium" | "Low";
type CandidateStatus = "Matched" | "Shortlisted" | "Rejected";

type Candidate = {
  id: string;
  name: string;
  role: string;
  experience: string;
  location: string;
  skills: string[];
  score: number;
  status: CandidateStatus;
  opportunityId: string;
};

const getMatchLevel = (score: number): MatchLevel => {
  if (score >= 80) return "High";
  if (score >= 60) return "Medium";
  return "Low";
};

export default function MatchingPage() {
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState("All Jobs");
  const [matchLevel, setMatchLevel] = useState("All Match Levels");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  // Fetch opportunities to populate the job filter and match against.
  const oppFetcher = useMemo(
    () => () => api.opportunities.list({ page_size: 50 }),
    [],
  );
  const { data: oppData, loading, error } = useFetch(oppFetcher, []);
  const opportunities: OpportunityPublic[] = oppData?.items || [];

  const jobOptions = useMemo(
    () => ["All Jobs", ...opportunities.map((o) => o.title)],
    [opportunities],
  );

  // Fetch matches for each opportunity and flatten into candidates.
  useEffect(() => {
    if (opportunities.length === 0 || !token) {
      setCandidates([]);
      return;
    }
    let cancelled = false;
    Promise.all(
      opportunities.map((opp) =>
        api.opportunities
          .matches(opp.id, { min_score: 0, page_size: 50 }, token)
          .then((res) =>
            res.items.map(
              (m: MatchPublic): Candidate => ({
                id: m.id,
                name: `Candidate ${m.profile_id.slice(0, 6)}`,
                role: opp.title,
                experience: "—",
                location: "—",
                skills: [],
                score: Math.round(m.overall_score),
                status: "Matched",
                opportunityId: opp.id,
              }),
            ),
          )
          .catch(() => [] as Candidate[]),
      ),
    ).then((results) => {
      if (cancelled) return;
      const all = results.flat().sort((a, b) => b.score - a.score);
      setCandidates(all);
    });
    return () => {
      cancelled = true;
    };
  }, [opportunities, token]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const searchText = search.toLowerCase();
      const matchesSearch =
        candidate.name.toLowerCase().includes(searchText) ||
        candidate.role.toLowerCase().includes(searchText);
      const matchesJob = selectedJob === "All Jobs" || candidate.role === selectedJob;
      const candidateLevel = getMatchLevel(candidate.score);
      const matchesLevel =
        matchLevel === "All Match Levels" || candidateLevel === matchLevel;
      return matchesSearch && matchesJob && matchesLevel;
    });
  }, [candidates, search, selectedJob, matchLevel]);

  const matchedCount = candidates.filter((c) => c.status === "Matched").length;
  const highMatchCount = candidates.filter((c) => c.score >= 80).length;
  const shortlistedCount = candidates.filter((c) => c.status === "Shortlisted").length;
  const averageScore =
    candidates.length > 0
      ? Math.round(
          candidates.reduce((total, c) => total + c.score, 0) / candidates.length,
        )
      : 0;

  const handleViewProfile = (candidate: Candidate) => {
    alert(
      `Candidate Profile\n\nName: ${candidate.name}\nRole: ${candidate.role}\nMatch Score: ${candidate.score}%`,
    );
    setOpenMenu(null);
  };

  const handleShortlist = (id: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "Shortlisted" } : c)),
    );
    setOpenMenu(null);
  };

  const handleReject = (id: string) => {
    const candidate = candidates.find((item) => item.id === id);
    if (!candidate) return;
    const confirmed = window.confirm(`Reject ${candidate.name}?`);
    if (!confirmed) return;
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "Rejected" } : c)),
    );
    setOpenMenu(null);
  };

  const getScoreClasses = (score: number) => {
    if (score >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (score >= 60) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-red-50 text-red-700 border-red-200";
  };

  const getStatusClasses = (status: CandidateStatus) => {
    if (status === "Shortlisted") return "bg-indigo-50 text-indigo-700 border-indigo-200";
    if (status === "Rejected") return "bg-red-50 text-red-700 border-red-200";
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Target size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Candidate Matching</h1>
              <p className="mt-1 text-sm text-slate-500">
                Find the best candidates for your job opportunities.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
            <Target size={18} className="text-indigo-600" />
            <div>
              <p className="text-xs font-medium text-indigo-600">AI Matching</p>
              <p className="text-sm font-semibold text-indigo-900">
                Smart Candidate Recommendations
              </p>
            </div>
          </div>
        </div>
      </section>

      {!token && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Sign in as an employer to view candidate matches.
        </div>
      )}

      {/* Stats */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Matched Candidates</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">{matchedCount}</h2>
              <p className="mt-1 text-xs text-emerald-600">Active matches</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users size={21} />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">High Match</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">{highMatchCount}</h2>
              <p className="mt-1 text-xs text-emerald-600">80%+ match score</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Star size={21} />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Shortlisted</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">{shortlistedCount}</h2>
              <p className="mt-1 text-xs text-indigo-600">Ready for next step</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <UserCheck size={21} />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Average Match</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">{averageScore}%</h2>
              <p className="mt-1 text-xs text-emerald-600">Overall candidate quality</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Target size={21} />
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-slate-600" />
          <h2 className="font-semibold text-slate-900">Find Candidates</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidates..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="relative">
            <BriefcaseBusiness size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              {jobOptions.map((job) => (
                <option key={job} value={job}>
                  {job}
                </option>
              ))}
            </select>
            <ChevronDown size={17} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <div className="relative">
            <Target size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={matchLevel}
              onChange={(e) => setMatchLevel(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option>All Match Levels</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <ChevronDown size={17} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </section>

      {/* Candidate Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">Matching Candidates</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredCandidates.length} candidates found
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Target size={16} className="text-indigo-600" />
            AI-based matching score
          </div>
        </div>

        {loading ? (
          <LoadingState label="Loading matches…" />
        ) : error ? (
          <ErrorState message={error} />
        ) : filteredCandidates.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Users size={25} />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">No candidates found</h3>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              {token
                ? "Try changing your search or filter options."
                : "Sign in as an employer to view candidate matches."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Candidate</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Position</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Match Score</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate) => {
                  const level = getMatchLevel(candidate.score);
                  return (
                    <tr key={candidate.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                            {candidate.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{candidate.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">{candidate.role}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getScoreClasses(candidate.score)}`}>
                            {candidate.score}%
                          </span>
                          <span className="text-xs font-medium text-slate-500">{level}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(candidate.status)}`}>
                          {candidate.status === "Shortlisted" && <UserCheck size={13} />}
                          {candidate.status === "Matched" && <CheckCircle2 size={13} />}
                          {candidate.status === "Rejected" && <XCircle size={13} />}
                          {candidate.status}
                        </span>
                      </td>
                      <td className="relative px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setOpenMenu(openMenu === candidate.id ? null : candidate.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        {openMenu === candidate.id && (
                          <div className="absolute right-5 top-14 z-20 w-48 rounded-xl border border-slate-200 bg-white p-2 text-left shadow-xl">
                            <button
                              type="button"
                              onClick={() => handleViewProfile(candidate)}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                            >
                              <Eye size={16} />
                              View Profile
                            </button>
                            {candidate.status !== "Shortlisted" && candidate.status !== "Rejected" && (
                              <button
                                type="button"
                                onClick={() => handleShortlist(candidate.id)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                              >
                                <UserCheck size={16} />
                                Shortlist
                              </button>
                            )}
                            {candidate.status !== "Rejected" && (
                              <button
                                type="button"
                                onClick={() => handleReject(candidate.id)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                              >
                                <XCircle size={16} />
                                Reject
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
