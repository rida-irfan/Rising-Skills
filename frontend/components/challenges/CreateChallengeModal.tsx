"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { api, type SkillResponse, type ChallengeCreate, type AssessmentPublic } from "@/lib/api";

interface CreateChallengeModalProps {
  token: string;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateChallengeModal({
  token,
  onClose,
  onCreated,
}: CreateChallengeModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<SkillResponse[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [assessments, setAssessments] = useState<AssessmentPublic[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "General",
    difficulty: "Easy",
    deadline: "",
    question: "",
  });

  // Load skills for required skills selection
  useEffect(() => {
    let cancelled = false;
    // Load skills
    api.skills
      .list({}, token)
      .then((res) => {
        if (!cancelled) setSkills(res.items);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load skills");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    // Load assessments for employer selection
    api.assessments
      .list({}, token)
      .then((res) => {
        if (!cancelled) setAssessments(res.items);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load assessments");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  function updateForm<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleSkill(id: string) {
    setSelectedSkillIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title required");
    if (selectedSkillIds.length === 0) return setError("Select at least one skill");
    const payload: ChallengeCreate = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      instructions: form.question?.trim() || undefined,
      difficulty: (function() {
        switch (form.difficulty) {
          case "Easy":
            return "beginner";
          case "Medium":
            return "intermediate";
          case "Hard":
            return "advanced";
          default:
            return "beginner";
        }
      })(),
      status: "published",
      submission_deadline: form.deadline ? new Date(`${form.deadline}T23:59:59`).toISOString() : undefined,
      skills: selectedSkillIds.map((skill_id) => ({ skill_id, importance_weight: 1 })),
    };
    setLoading(true);
    setError(null);
    try {
      await api.challenges.create(payload, token);
      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create challenge");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Create Challenge</h2>
            <p className="mt-1 text-sm text-slate-500">Define a new challenge for candidates.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Title *</span>
            <input
              required
              value={form.title}
              onChange={(e) => updateForm("title", e.target.value)}
              placeholder="Challenge title"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Question</span>
              <input
                value={form.question}
                onChange={(e) => updateForm("question", e.target.value)}
                placeholder="Optional question for the challenge"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <label className="block mt-4">
              <span className="mb-1 block text-sm font-medium text-slate-700">Assessment (optional)</span>
              <select
                value={selectedAssessmentId}
                onChange={(e) => setSelectedAssessmentId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">-- No assessment --</option>
                {assessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
            </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Description</span>
            <textarea
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
              placeholder="Optional description"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              rows={3}
            />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Category</span>
              <input
                value={form.category}
                onChange={(e) => updateForm("category", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Difficulty</span>
              <select
                value={form.difficulty}
                onChange={(e) => updateForm("difficulty", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Submission deadline</span>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => updateForm("deadline", e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <div className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Required skills</span>
            <div className="flex flex-wrap gap-2">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                skills.map((skill) => (
                  <button
                    type="button"
                    key={skill.id}
                    onClick={() => toggleSkill(skill.id)}
                    className={`rounded-full px-3 py-1 text-sm ${selectedSkillIds.includes(skill.id) ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-800"}`}
                  >
                    {skill.name}
                  </button>
                ))
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin inline-block mr-1" /> : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
