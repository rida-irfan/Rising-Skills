"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { api, getStoredAttemptIds } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useFetch } from "@/lib/useFetch";

interface Result {
  id: string;
  attemptId: string;
  assessmentId: string;
  assessmentName: string;
  score: number;
  passThreshold: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  answeredQuestions: number;
  earnedPoints: number;
  totalPoints: number;
  evaluatedAt: string;
  status: "Passed" | "Failed";
}

export default function AssessmentResults() {
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);

  const fetcher = useMemo(
    () => async () => {
      if (!token) return [] as Result[];
      const attemptIds = getStoredAttemptIds();
      if (attemptIds.length === 0) return [] as Result[];

      const fetched: Result[] = [];
      await Promise.all(
        attemptIds.map(async (attemptId) => {
          try {
            const res = await api.attempts.result(attemptId, token);
            fetched.push({
              id: res.id,
              attemptId: res.attempt_id,
              assessmentId: res.assessment_id,
              assessmentName: res.assessment_title,
              score: Math.round(res.score_percentage),
              passThreshold: res.passing_score,
              passed: res.passed,
              totalQuestions: res.total_questions,
              correctAnswers: res.correct_answers,
              answeredQuestions: res.answered_questions,
              earnedPoints: res.earned_points,
              totalPoints: res.total_points,
              evaluatedAt: res.evaluated_at,
              status: res.passed ? "Passed" : "Failed",
            });
          } catch {
            /* skip attempts that can't be fetched (e.g. not yet submitted) */
          }
        }),
      );
      return fetched;
    },
    [token],
  );

  const { data: results, loading, error, refetch } = useFetch(fetcher, [token]);

  const filtered = (results ?? []).filter((r) => {
    const matchesSearch =
      r.assessmentName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || r.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-[#222]">
            Assessment Results
          </h2>
          <p className="text-xs text-[#999] mt-1">
            Your assessment attempt results
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assessment"
              className="w-56 border border-[#DDD] rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-[#6C4DF6]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-[#DDD] rounded-lg px-3 py-2 text-sm text-[#555]"
          >
            <option value="all">All Status</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16">
          <span className="text-sm text-[#999]">Loading results...</span>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={refetch}
            className="mt-3 text-sm text-[#6C4DF6] font-medium hover:underline"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#EAEAEA] text-left text-xs text-[#999]">
                <th className="pb-3 font-medium">Assessment</th>
                <th className="pb-3 font-medium">Score</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Correct</th>
                <th className="pb-3 font-medium">Submitted</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((result) => (
                <tr
                  key={result.id}
                  className="border-b border-[#F0F0F0] hover:bg-[#FAFAFC] transition"
                >
                  <td className="py-4">
                    <p className="font-medium text-[#222]">
                      {result.assessmentName}
                    </p>
                    <p className="text-xs text-[#999] mt-0.5">
                      Attempt ID: {result.attemptId.slice(0, 8)}…
                    </p>
                  </td>
                  <td className="py-4">
                    <span className="font-semibold text-[#222]">
                      {result.score}%
                    </span>
                  </td>
                  <td className="py-4">
                    <StatusBadge status={result.status} />
                  </td>
                  <td className="py-4 text-[#666]">
                    {result.correctAnswers}/{result.totalQuestions}
                  </td>
                  <td className="py-4 text-[#666]">
                    {new Date(result.evaluatedAt).toLocaleDateString()}
                  </td>
                  <td className="py-4">
                    <button
                      onClick={() => setSelectedResult(result)}
                      className="text-[#6C4DF6] text-sm font-medium hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedResult && (
        <ResultDetailModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: "Passed" | "Failed" }) {
  return (
    <span
      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
        status === "Passed"
          ? "bg-[#E8F8EF] text-[#199B52]"
          : "bg-[#FEECEC] text-[#D93025]"
      }`}
    >
      {status}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="w-14 h-14 rounded-full bg-[#F1EDFF] flex items-center justify-center mx-auto text-2xl">
        📊
      </div>
      <h3 className="text-base font-semibold text-[#222] mt-4">
        No results yet
      </h3>
      <p className="text-sm text-[#999] mt-1">
        Start and submit an assessment to see your results here.
      </p>
    </div>
  );
}

function ResultDetailModal({
  result,
  onClose,
}: {
  result: Result;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#EAEAEA] p-5">
          <div>
            <h2 className="text-lg font-semibold text-[#222]">
              Result Details
            </h2>
            <p className="text-xs text-[#999] mt-1">{result.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-[#666]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="text-center py-4 bg-[#F8F9FC] rounded-xl">
            <p className="text-4xl font-bold text-[#222]">{result.score}%</p>
            <StatusBadge status={result.status} />
            <p className="text-xs text-[#999] mt-2">
              Pass threshold: {result.passThreshold}%
            </p>
          </div>

          <DetailRow label="Assessment" value={result.assessmentName} />
          <DetailRow
            label="Correct Answers"
            value={`${result.correctAnswers} / ${result.totalQuestions}`}
          />
          <DetailRow
            label="Answered"
            value={`${result.answeredQuestions} / ${result.totalQuestions}`}
          />
          <DetailRow
            label="Points"
            value={`${result.earnedPoints} / ${result.totalPoints}`}
          />
          <DetailRow
            label="Submitted"
            value={new Date(result.evaluatedAt).toLocaleString()}
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-[#EAEAEA] p-5">
          <button
            onClick={onClose}
            className="border border-[#DDD] px-4 py-2 rounded-lg text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-[#999]">{label}</span>
      <span className="font-medium text-[#222]">{value}</span>
    </div>
  );
}
