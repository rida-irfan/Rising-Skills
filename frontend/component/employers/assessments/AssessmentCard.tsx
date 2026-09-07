"use client";

import { useEffect, useState } from "react";
import {
  api,
  ApiError,
  type AssessmentPublic,
  type AttemptStartResponse,
  type ProfileResponse,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface Assessment extends AssessmentPublic {
  skills?: string[];
  questionCount?: number;
  attempts?: number;
  version?: string;
}

export default function AssessmentCard({
  assessment,
}: {
  assessment: Assessment;
}) {
  const { token } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [starting, setStarting] = useState(false);
  const [attempt, setAttempt] = useState<AttemptStartResponse | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  // Handler to delete an assessment
  const handleDelete = async () => {
    if (!window.confirm('Delete this assessment?')) return;
    try {
      await api.assessments.delete(assessment.id, token);
      // Refresh the page to reflect deletion
      window.location.reload();
    } catch (e) {
      setStartError(e instanceof Error ? e.message : 'Failed to delete assessment');
    }
  };
  const [learners, setLearners] = useState<ProfileResponse[]>([]);
  const [selectedLearner, setSelectedLearner] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState(false);

  useEffect(() => {
    if (showAssign && token && learners.length === 0) {
      api.profiles
        .learners(token)
        .then(setLearners)
        .catch(() => {});
    }
  }, [showAssign, token, learners.length]);

  async function handleStart() {
    if (!token) {
      setStartError("Sign in to start an assessment attempt.");
      return;
    }
    setStarting(true);
    setStartError(null);
    try {
      const res = await api.assessments.startAttempt(assessment.id, token);
      setAttempt(res);
    } catch (err) {
      setStartError(
        err instanceof ApiError
          ? `Failed to start (${err.status}).`
          : err instanceof Error
            ? err.message
            : "Failed to start attempt.",
      );
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="border border-[#E8E8ED] rounded-xl p-5 hover:shadow-sm transition">

      <div className="flex justify-between">

        <div className="flex gap-4">

          {/* Icon */}
          <div className="w-11 h-11 rounded-lg bg-[#F1EDFF]
            flex items-center justify-center text-[#6C4DF6]">
            📝
          </div>

          <div>

            <div className="flex items-center gap-3">

              <h3 className="font-semibold text-[#222]">
                {assessment.title}
              </h3>

              <span
                className={`text-xs px-2.5 py-1 rounded-full capitalize ${
                  assessment.status === "published"
                    ? "bg-[#E8F8EF] text-[#199B52]"
                    : "bg-[#FFF4DC] text-[#C78100]"
                }`}
              >
                {assessment.status}
              </span>

            </div>

            <p className="text-xs text-[#999] mt-1">
              {assessment.id}
              {assessment.skill?.name ? ` • ${assessment.skill.name}` : ""}
            </p>

            <p className="text-sm text-[#777] mt-3 max-w-2xl">
              {assessment.description || "No description provided."}
            </p>

          </div>

        </div>

        {/* Menu */}
        <div className="relative">

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-xl text-[#999] hover:text-[#444]"
          >
            ⋮
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 bg-white
              border border-[#E5E5E5] rounded-lg shadow-lg
              w-40 z-10 py-1">

              <button className="block w-full text-left px-4 py-2
                text-sm hover:bg-gray-50">
                Edit
              </button>

              <button className="block w-full text-left px-4 py-2
                text-sm hover:bg-gray-50">
                Duplicate
              </button>

              <button className="block w-full text-left px-4 py-2
                text-sm text-red-500 hover:bg-gray-50">
                Archive
              </button>

              <button className="block w-full text-left px-4 py-2
                text-sm text-red-600 hover:bg-gray-50"
                onClick={handleDelete}>
                Delete
              </button>

            </div>
          )}

        </div>

      </div>

      {/* Skills */}
      {assessment.skills && assessment.skills.length > 0 && (
        <div className="flex gap-2 mt-4 ml-15">
          {assessment.skills.map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-1 bg-[#F4F1FF]
              text-[#6C4DF6] rounded-md text-xs"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Details */}
      <div className="grid grid-cols-4 border-t mt-5 pt-4">

        <Detail
          label="Questions"
          value={
            assessment.questionCount != null
              ? assessment.questionCount.toString()
              : "—"
          }
        />

        <Detail
          label="Duration"
          value={`${Math.round(assessment.duration_seconds / 60)} min`}
        />

        <Detail
          label="Pass Score"
          value={`${assessment.passing_score}%`}
        />

        <Detail
          label="Difficulty"
          value={assessment.difficulty}
        />

      </div>

      {startError && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {startError}
        </p>
      )}

      {attempt && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-800">
            Attempt #{attempt.attempt_number} started
          </p>
          <p className="mt-1 text-xs text-emerald-700">
            {attempt.questions.length} questions • Expires{" "}
            {new Date(attempt.expires_at).toLocaleString()}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-4">



      </div>

      {/* Assign Dialog */}
      {showAssign && (
        <div className="fixed inset-0 bg-black/30 z-50
          flex items-center justify-center">

          <div className="bg-white rounded-xl w-[430px] p-6">

            <h2 className="text-lg font-semibold">
              Assign Assessment
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Assign this assessment to a student.
            </p>

            {assignSuccess && (
              <p className="mt-3 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
                Assessment assigned successfully!
              </p>
            )}

            {assignError && (
              <p className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {assignError}
              </p>
            )}

            <div className="mt-5 space-y-4">

              <div>
                <label className="text-sm font-medium">
                  Student
                </label>

                <select
                  value={selectedLearner}
                  onChange={(e) => setSelectedLearner(e.target.value)}
                  className="w-full mt-1 border rounded-lg
                  px-3 py-2.5 text-sm"
                >
                  <option value="">Select Student</option>
                  {learners.length === 0 ? (
                    <option disabled>Loading students...</option>
                  ) : (
                    learners.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.full_name || l.id}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Due Date
                </label>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full mt-1 border rounded-lg
                  px-3 py-2.5 text-sm"
                />
              </div>

            </div>

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => {
                  setShowAssign(false);
                  setSelectedLearner("");
                  setDueDate("");
                  setAssignError(null);
                  setAssignSuccess(false);
                }}
                className="border px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (!selectedLearner) {
                    setAssignError("Please select a student.");
                    return;
                  }
                  setAssignSuccess(true);
                  setSelectedLearner("");
                  setDueDate("");
                  setTimeout(() => {
                    setShowAssign(false);
                    setAssignSuccess(false);
                  }, 2000);
                }}
                className="bg-[#6C4DF6] text-white px-4 py-2
                rounded-lg text-sm"
              >
                Assign
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-[#999]">
        {label}
      </p>

      <p className="text-sm font-semibold text-[#333] mt-1">
        {value}
      </p>
    </div>
  );
}