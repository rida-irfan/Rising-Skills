"use client";

import { useState } from "react";
import { Info } from "lucide-react";

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

      <div className="text-center py-16">
        <div className="w-14 h-14 rounded-full bg-[#F1EDFF] flex items-center justify-center mx-auto text-2xl">
          📋
        </div>
        <h3 className="text-base font-semibold text-[#222] mt-4">
          Version tracking coming soon
        </h3>
        <p className="text-sm text-[#999] mt-1 max-w-md mx-auto">
          The backend does not yet support assessment versioning. Each
          assessment edit creates a new record. Version history will be
          available once the versioning system is added.
        </p>
      </div>
    </div>
  );
}

