"use client";

import { CheckCircle2, FileText, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type SubmissionMode = "file" | "repository";

type StoredSubmission = {
  challengeId: string;
  type: SubmissionMode;
  fileName?: string;
  fileSize?: number;
  repositoryUrl?: string;
  submittedAt: string;
};

type ChallengeSubmissionProps = {
  challengeId: string;
  challengeTitle: string;
};

const ACCEPTED_FILE_TYPES = [
  ".zip",
  ".pdf",
  ".rar",
  ".7z",
  ".tar",
  ".gz",
];

function isValidRepositoryUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function getStoredSubmission(challengeId: string) {
  const stored = localStorage.getItem("challenge-submissions");

  if (!stored) {
    return null;
  }

  try {
    const submissions = JSON.parse(stored) as StoredSubmission[];
    return submissions.find((item) => item.challengeId === challengeId) ?? null;
  } catch {
    return null;
  }
}

function saveSubmission(submission: StoredSubmission) {
  const stored = localStorage.getItem("challenge-submissions");
  let submissions: StoredSubmission[] = [];

  if (stored) {
    try {
      submissions = JSON.parse(stored) as StoredSubmission[];
    } catch {
      submissions = [];
    }
  }

  const updated = [
    ...submissions.filter((item) => item.challengeId !== submission.challengeId),
    submission,
  ];

  localStorage.setItem("challenge-submissions", JSON.stringify(updated));
}

export default function ChallengeSubmission({
  challengeId,
  challengeTitle,
}: ChallengeSubmissionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuth();

  const [activeMode, setActiveMode] = useState<SubmissionMode | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [deploymentUrl, setDeploymentUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingSubmission, setExistingSubmission] =
    useState<StoredSubmission | null>(null);

  useEffect(() => {
    setExistingSubmission(getStoredSubmission(challengeId));
  }, [challengeId]);

  const resetForm = () => {
    setActiveMode(null);
    setSelectedFile(null);
    setRepositoryUrl("");
    setError("");
    setSuccessMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileButtonClick = () => {
    setActiveMode("file");
    setError("");
    setSuccessMessage("");
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);
    setError("");
    setSuccessMessage("");
  };

  const handleRepositoryButtonClick = () => {
    setActiveMode("repository");
    setSelectedFile(null);
    setError("");
    setSuccessMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSubmit = () => {
    if (!selectedFile) {
      setError("Please select a file before submitting.");
      return;
    }

    const submission: StoredSubmission = {
      challengeId,
      type: "file",
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      submittedAt: new Date().toISOString(),
    };

    saveSubmission(submission);
    setExistingSubmission(submission);
    setSuccessMessage(`"${selectedFile.name}" submitted successfully.`);
    resetForm();
  };

  const handleRepositorySubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!repositoryUrl.trim()) {
      setError("Please enter a repository link.");
      return;
    }

    if (!isValidRepositoryUrl(repositoryUrl)) {
      setError("Please enter a valid URL starting with http:// or https://");
      return;
    }

    setSubmitting(true);
    setError("");

    if (token) {
      try {
        await api.challenges.submit(
          challengeId,
          {
            repository_url: repositoryUrl.trim(),
            deployment_url: deploymentUrl.trim() || null,
            description: description.trim() || null,
          },
          token,
        );
        setSuccessMessage("Repository link submitted successfully.");
        resetForm();
        return;
      } catch (err) {
        setError(
          err instanceof ApiError
            ? `Submission failed (${err.status}).`
            : err instanceof Error
              ? err.message
              : "Submission failed.",
        );
        return;
      } finally {
        setSubmitting(false);
      }
    }

    // Fallback: persist locally when not authenticated.
    const submission: StoredSubmission = {
      challengeId,
      type: "repository",
      repositoryUrl: repositoryUrl.trim(),
      submittedAt: new Date().toISOString(),
    };
    saveSubmission(submission);
    setExistingSubmission(submission);
    setSuccessMessage("Repository link saved locally (sign in to submit to backend).");
    resetForm();
    setSubmitting(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
      <h2 className="text-lg font-bold text-slate-900">Submit Your Challenge</h2>

      <p className="mt-2 text-sm text-slate-600">
        Choose one of the allowed submission formats.
      </p>

      {existingSubmission && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="mt-0.5 text-emerald-600" />

            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Submission received
              </p>

              <p className="mt-1 text-sm text-emerald-700">
                {existingSubmission.type === "file"
                  ? `File: ${existingSubmission.fileName}`
                  : `Repository: ${existingSubmission.repositoryUrl}`}
              </p>

              <p className="mt-1 text-xs text-emerald-600">
                Submitted on{" "}
                {new Date(existingSubmission.submittedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES.join(",")}
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={handleFileButtonClick}
          className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition ${
            activeMode === "file"
              ? "border-indigo-300 bg-white text-indigo-700"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Upload size={18} />
          Upload File
        </button>

        <button
          type="button"
          onClick={handleRepositoryButtonClick}
          className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
            activeMode === "repository"
              ? "bg-indigo-700 text-white"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          <FileText size={18} />
          Submit Repository Link
        </button>
      </div>

      {activeMode === "file" && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Upload your solution file
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Accepted formats: ZIP, PDF, RAR, 7Z, TAR, GZ
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close file upload"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
            {selectedFile ? (
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {selectedFile.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No file selected yet for {challengeTitle}.
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Choose File
            </button>

            <button
              type="button"
              onClick={handleFileSubmit}
              disabled={!selectedFile}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit File
            </button>
          </div>
        </div>
      )}

      {activeMode === "repository" && (
        <form
          onSubmit={handleRepositorySubmit}
          className="mt-5 rounded-xl border border-slate-200 bg-white p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Submit repository link
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Paste your GitHub, GitLab, or other public repository URL.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close repository form"
            >
              <X size={16} />
            </button>
          </div>

          <input
            type="url"
            value={repositoryUrl}
            onChange={(event) => {
              setRepositoryUrl(event.target.value);
              setError("");
              setSuccessMessage("");
            }}
            placeholder="https://github.com/username/project"
            className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
          />

          <input
            type="url"
            value={deploymentUrl}
            onChange={(event) => {
              setDeploymentUrl(event.target.value);
              setError("");
              setSuccessMessage("");
            }}
            placeholder="https://your-deployment-url.com (optional)"
            className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
          />

          <textarea
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setError("");
              setSuccessMessage("");
            }}
            placeholder="Short description of your submission (optional)"
            rows={3}
            className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
          />

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit Repository"}
          </button>
        </form>
      )}

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {successMessage && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </p>
      )}

      <p className="mt-4 text-xs text-slate-500">
        Accepted formats depend on the challenge submission rules.
      </p>
    </div>
  );
}
