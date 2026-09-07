"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

interface Result {
  id: string;
  assessmentName: string;
  version: string;
  student: string;
  score: number;
  passThreshold: number;
  attempt: number;
  submittedDate: string;
  duration: string;
  status: "Passed" | "Failed";
  skills: string[];
}

const mockResults: Result[] = [
  {
    id: "RES-001",
    assessmentName: "Frontend Developer Assessment",
    version: "1.2",
    student: "Ali Raza",
    score: 85,
    passThreshold: 70,
    attempt: 1,
    submittedDate: "2026-08-28",
    duration: "24 min",
    status: "Passed",
    skills: ["React.js", "JavaScript", "UI Development"],
  },
  {
    id: "RES-002",
    assessmentName: "JavaScript Fundamentals",
    version: "1.0",
    student: "Hina Khan",
    score: 58,
    passThreshold: 60,
    attempt: 2,
    submittedDate: "2026-08-27",
    duration: "18 min",
    status: "Failed",
    skills: ["JavaScript", "ES6+"],
  },
  {
    id: "RES-003",
    assessmentName: "React.js Skills Assessment",
    version: "1.2",
    student: "Ahmed Hassan",
    score: 92,
    passThreshold: 70,
    attempt: 1,
    submittedDate: "2026-08-26",
    duration: "35 min",
    status: "Passed",
    skills: ["React.js", "Hooks", "Redux"],
  },
  {
    id: "RES-004",
    assessmentName: "Frontend Developer Assessment",
    version: "1.0",
    student: "Sara Malik",
    score: 72,
    passThreshold: 70,
    attempt: 1,
    submittedDate: "2026-08-25",
    duration: "28 min",
    status: "Passed",
    skills: ["React.js", "JavaScript"],
  },
];

export default function AssessmentResults() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);

  const filtered = mockResults.filter((r) => {
    const matchesSearch =
      r.student.toLowerCase().includes(search.toLowerCase()) ||
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
            Review student submissions and performance
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
              placeholder="Search student or assessment"
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

          <select className="border border-[#DDD] rounded-lg px-3 py-2 text-sm text-[#555]">
            <option>All Skills</option>
            <option>React.js</option>
            <option>JavaScript</option>
            <option>TypeScript</option>
          </select>

          <input
            type="date"
            className="border border-[#DDD] rounded-lg px-3 py-2 text-sm text-[#555]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#EAEAEA] text-left text-xs text-[#999]">
                <th className="pb-3 font-medium">Assessment</th>
                <th className="pb-3 font-medium">Student</th>
                <th className="pb-3 font-medium">Score</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Attempt</th>
                <th className="pb-3 font-medium">Submitted</th>
                <th className="pb-3 font-medium">Duration</th>
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
                      v{result.version}
                    </p>
                  </td>
                  <td className="py-4 text-[#444]">{result.student}</td>
                  <td className="py-4">
                    <span className="font-semibold text-[#222]">
                      {result.score}%
                    </span>
                  </td>
                  <td className="py-4">
                    <StatusBadge status={result.status} />
                  </td>
                  <td className="py-4 text-[#666]">
                    {result.attempt}
                  </td>
                  <td className="py-4 text-[#666]">
                    {result.submittedDate}
                  </td>
                  <td className="py-4 text-[#666]">
                    {result.duration}
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
        No results found
      </h3>
      <p className="text-sm text-[#999] mt-1">
        Results will appear here once students complete assessments.
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
          <DetailRow label="Version" value={`v${result.version}`} />
          <DetailRow label="Student" value={result.student} />
          <DetailRow label="Attempt" value={`Attempt ${result.attempt}`} />
          <DetailRow label="Submitted" value={result.submittedDate} />
          <DetailRow label="Duration" value={result.duration} />

          <div>
            <p className="text-xs text-[#999] mb-2">Skills Assessed</p>
            <div className="flex flex-wrap gap-2">
              {result.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 bg-[#F4F1FF] text-[#6C4DF6] rounded-md text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#EAEAEA] p-5">
          <button
            onClick={onClose}
            className="border border-[#DDD] px-4 py-2 rounded-lg text-sm"
          >
            Close
          </button>
          <button className="bg-[#6C4DF6] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5D3FE4]">
            View Integrity Report
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
