"use client";

import { useState } from "react";
import { Info } from "lucide-react";

interface Version {
  id: string;
  version: number;
  publishedDate: string | null;
  createdBy: string;
  questionCount: number;
  status: "Published" | "Draft" | "Archived";
  attempts: number;
  changes: string;
}

const mockVersions: Version[] = [
  {
    id: "v3",
    version: 3,
    publishedDate: null,
    createdBy: "Admin User",
    questionCount: 22,
    status: "Draft",
    attempts: 0,
    changes: "Added 2 new React hooks questions",
  },
  {
    id: "v2",
    version: 2,
    publishedDate: "2026-08-15",
    createdBy: "Admin User",
    questionCount: 20,
    status: "Published",
    attempts: 48,
    changes: "Updated pass threshold and time limit",
  },
  {
    id: "v1",
    version: 1,
    publishedDate: "2026-07-01",
    createdBy: "Admin User",
    questionCount: 18,
    status: "Published",
    attempts: 112,
    changes: "Initial published version",
  },
];

export default function AssessmentVersions() {
  const [selectedAssessment] = useState("Frontend Developer Assessment");

  return (
    <div className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-[#222]">
            Version History
          </h2>
          <p className="text-xs text-[#999] mt-1">
            Track changes across assessment versions
          </p>
        </div>

        <select className="border border-[#DDD] rounded-lg px-3 py-2 text-sm text-[#555]">
          <option>{selectedAssessment}</option>
          <option>JavaScript Fundamentals</option>
          <option>React.js Skills Assessment</option>
        </select>
      </div>

      <div className="flex items-start gap-3 bg-[#F1EDFF] border border-[#E0D8FF] rounded-lg p-4 mb-6">
        <Info size={18} className="text-[#6C4DF6] shrink-0 mt-0.5" />
        <p className="text-sm text-[#5D3FE4]">
          Published versions are locked and historical results remain
          associated with their original version.
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-[#E8E8ED]" />

        <div className="space-y-4">
          {mockVersions.map((version, index) => (
            <VersionCard
              key={version.id}
              version={version}
              isLatest={index === 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function VersionCard({
  version,
  isLatest,
}: {
  version: Version;
  isLatest: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="relative z-10 shrink-0">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 ${
            version.status === "Published"
              ? "bg-[#E8F8EF] border-[#199B52] text-[#199B52]"
              : version.status === "Draft"
                ? "bg-[#FFF4DC] border-[#C78100] text-[#C78100]"
                : "bg-[#F0F0F0] border-[#999] text-[#999]"
          }`}
        >
          v{version.version}
        </div>
      </div>

      <div
        className={`flex-1 border rounded-xl p-5 ${
          isLatest ? "border-[#6C4DF6] bg-[#FAFAFF]" : "border-[#E8E8ED] bg-white"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-[#222]">
              Version {version.version}
            </h3>
            <StatusBadge status={version.status} />
            {isLatest && (
              <span className="text-xs px-2 py-0.5 bg-[#F1EDFF] text-[#6C4DF6] rounded-full">
                Current
              </span>
            )}
          </div>

          {version.publishedDate && (
            <p className="text-xs text-[#999]">
              Published {version.publishedDate}
            </p>
          )}
        </div>

        <p className="text-sm text-[#666] mt-2">{version.changes}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-[#F0F0F0]">
          <MetaItem label="Created by" value={version.createdBy} />
          <MetaItem
            label="Questions"
            value={version.questionCount.toString()}
          />
          <MetaItem label="Attempts" value={version.attempts.toString()} />
          <MetaItem label="Status" value={version.status} />
        </div>

        <div className="flex gap-3 mt-4">
          <button className="text-sm text-[#6C4DF6] font-medium hover:underline">
            View Details
          </button>
          {version.status === "Draft" && (
            <button className="text-sm text-[#6C4DF6] font-medium hover:underline">
              Continue Editing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "Published" | "Draft" | "Archived";
}) {
  const styles = {
    Published: "bg-[#E8F8EF] text-[#199B52]",
    Draft: "bg-[#FFF4DC] text-[#C78100]",
    Archived: "bg-[#F0F0F0] text-[#777]",
  };

  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#999]">{label}</p>
      <p className="text-sm font-medium text-[#333] mt-0.5">{value}</p>
    </div>
  );
}
