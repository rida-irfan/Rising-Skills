"use client";

import { useMemo, useState } from "react";
import { Plus, Search, X, Loader2 } from "lucide-react";
import {
  api,
  type SkillResponse,
  type AssessmentPublic,
  type AssessmentQuestionPublic,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useFetch } from "@/lib/useFetch";

interface Question {
  id: string;
  text: string;
  type: "Multiple Choice" | "True / False" | "Short Answer";
  skill: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Active" | "Retired";
  createdDate: string;
  assessmentTitle?: string;
}

function mapQuestion(
  q: AssessmentQuestionPublic,
  assessment: AssessmentPublic,
): Question {
  const typeMap: Record<string, Question["type"]> = {
    multiple_choice: "Multiple Choice",
    single_choice: "Short Answer",
    true_false: "True / False",
  };
  return {
    id: q.id,
    text: q.question_text,
    type: typeMap[q.question_type] ?? "Short Answer",
    skill: assessment.skill?.name ?? "Unknown",
    difficulty:
      assessment.difficulty === "beginner"
        ? "Easy"
        : assessment.difficulty === "advanced"
          ? "Hard"
          : "Medium",
    status: "Active",
    createdDate: new Date(assessment.created_at).toISOString().split("T")[0],
    assessmentTitle: assessment.title,
  };
}

export default function QuestionBank() {
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [retireTarget, setRetireTarget] = useState<Question | null>(null);
  const [localRetired, setLocalRetired] = useState<string[]>([]);
  const [skillFilter, setSkillFilter] = useState("All Skills");
  const [difficultyFilter, setDifficultyFilter] = useState("All Difficulties");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const skillsFetcher = useMemo(
    () => () =>
      api.skills.list({ page_size: 100 }) as Promise<{ items: SkillResponse[] }>,
    [],
  );
  const { data: skillsData } = useFetch(skillsFetcher, []);
  const skills = skillsData?.items ?? [];
  const loadingSkills = !skillsData;

  const questionsFetcher = useMemo(
    () => async () => {
      const res = await api.assessments.list({ page_size: 100 }, token);
      const allQuestions: Question[] = [];
      await Promise.all(
        res.items.map(async (assessment) => {
          try {
            const detail = await api.assessments.get(assessment.id);
            for (const q of detail.questions) {
              allQuestions.push(mapQuestion(q, assessment));
            }
          } catch {
            /* skip assessment on error */
          }
        }),
      );
      return allQuestions;
    },
    [token],
  );
  const { data: questions, loading, error, refetch } = useFetch(questionsFetcher, [token]);

  const handleRetire = () => {
    if (!retireTarget) return;
    setLocalRetired((prev) => [...prev, retireTarget.id]);
    setRetireTarget(null);
  };

  const filtered = (questions ?? []).filter((q) => {
    const matchesSearch =
      q.text.toLowerCase().includes(search.toLowerCase()) ||
      q.skill.toLowerCase().includes(search.toLowerCase());
    const matchesSkill = skillFilter === "All Skills" || q.skill === skillFilter;
    const matchesDifficulty =
      difficultyFilter === "All Difficulties" || q.difficulty === difficultyFilter;
    const matchesType = typeFilter === "All Types" || q.type === typeFilter;
    const isRetired = localRetired.includes(q.id);
    const matchesStatus =
      statusFilter === "All Status" ||
      (statusFilter === "Active" && !isRetired) ||
      (statusFilter === "Retired" && isRetired);
    return (
      matchesSearch &&
      matchesSkill &&
      matchesDifficulty &&
      matchesType &&
      matchesStatus
    );
  });

  return (
    <div className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-[#222]">Question Bank</h2>
          <p className="text-xs text-[#999] mt-1">
            Questions sourced from all assessments
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#6C4DF6] hover:bg-[#5D3FE4] text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus size={16} />
          Add Question
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions"
            className="w-56 border border-[#DDD] rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-[#6C4DF6]"
          />
        </div>

        <select
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          className="border border-[#DDD] rounded-lg px-3 py-2 text-sm text-[#555]"
        >
          <option>All Skills</option>
          {skills.map((s) => (
            <option key={s.id}>{s.name}</option>
          ))}
        </select>

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="border border-[#DDD] rounded-lg px-3 py-2 text-sm text-[#555]"
        >
          <option>All Difficulties</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-[#DDD] rounded-lg px-3 py-2 text-sm text-[#555]"
        >
          <option>All Types</option>
          <option>Multiple Choice</option>
          <option>True / False</option>
          <option>Short Answer</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-[#DDD] rounded-lg px-3 py-2 text-sm text-[#555]"
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Retired</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16">
          <Loader2 size={20} className="animate-spin text-[#6C4DF6]" />
          <span className="text-sm text-[#999]">Loading questions...</span>
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
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-full bg-[#F1EDFF] flex items-center justify-center mx-auto text-2xl">
            ❓
          </div>
          <h3 className="text-base font-semibold text-[#222] mt-4">
            No questions found
          </h3>
          <p className="text-sm text-[#999] mt-1">
            Questions appear here once assessments are created.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#EAEAEA] text-left text-xs text-[#999]">
                <th className="pb-3 font-medium">Question</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Skill</th>
                <th className="pb-3 font-medium">Difficulty</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Created</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((question) => {
                const isRetired = localRetired.includes(question.id);
                return (
                  <tr
                    key={question.id}
                    className="border-b border-[#F0F0F0] hover:bg-[#FAFAFC] transition"
                  >
                    <td className="py-4 max-w-xs">
                      <p className="font-medium text-[#222] line-clamp-2">
                        {question.text}
                      </p>
                      {question.assessmentTitle && (
                        <p className="text-xs text-[#999] mt-0.5">
                          From: {question.assessmentTitle}
                        </p>
                      )}
                    </td>
                    <td className="py-4 text-[#666]">{question.type}</td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-[#F4F1FF] text-[#6C4DF6] rounded-md text-xs">
                        {question.skill}
                      </span>
                    </td>
                    <td className="py-4">
                      <DifficultyBadge difficulty={question.difficulty} />
                    </td>
                    <td className="py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full ${
                          !isRetired
                            ? "bg-[#E8F8EF] text-[#199B52]"
                            : "bg-[#F0F0F0] text-[#777]"
                        }`}
                      >
                        {isRetired ? "Retired" : "Active"}
                      </span>
                    </td>
                    <td className="py-4 text-[#666]">{question.createdDate}</td>
                    <td className="py-4">
                      <div className="flex gap-3">
                        <button className="text-[#6C4DF6] text-sm hover:underline">
                          View
                        </button>
                        {!isRetired && (
                          <button
                            onClick={() => setRetireTarget(question)}
                            className="text-red-500 text-sm hover:underline"
                          >
                            Retire
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <AddQuestionModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => refetch()}
          skills={skills}
          loadingSkills={loadingSkills}
          token={token}
        />
      )}

      {retireTarget && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-[#222]">
              Retire Question?
            </h2>
            <p className="text-sm text-[#666] mt-2">
              This question will no longer be available for new assessments.
              Existing assessments using this question will not be affected.
            </p>
            <p className="text-sm text-[#444] mt-3 font-medium line-clamp-2">
              &ldquo;{retireTarget.text}&rdquo;
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setRetireTarget(null)}
                className="border border-[#DDD] px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRetire}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
              >
                Retire Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DifficultyBadge({
  difficulty,
}: {
  difficulty: "Easy" | "Medium" | "Hard";
}) {
  const styles = {
    Easy: "bg-[#E8F8EF] text-[#199B52]",
    Medium: "bg-[#FFF4DC] text-[#C78100]",
    Hard: "bg-[#FEECEC] text-[#D93025]",
  };

  return (
    <span className={`text-xs px-2.5 py-1 rounded-full ${styles[difficulty]}`}>
      {difficulty}
    </span>
  );
}

function AddQuestionModal({
  onClose,
  onAdded,
  skills,
  loadingSkills,
  token,
}: {
  onClose: () => void;
  onAdded: () => void;
  skills: SkillResponse[];
  loadingSkills: boolean;
  token?: string | null;
}) {
  const [form, setForm] = useState({
    text: "",
    type: "Multiple Choice" as Question["type"],
    skill: "",
    difficulty: "Easy" as Question["difficulty"],
    options: ["", "", "", ""],
    correctAnswer: "0",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!form.text.trim() || !form.skill) {
      setError("Please enter question text and select a skill.");
      return;
    }
    if (!token) {
      setError("Sign in to create a question.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const skill = skills.find((s) => s.name === form.skill);
      if (!skill) {
        setError("Selected skill not found.");
        setSaving(false);
        return;
      }

      const isTrueFalse = form.type === "True / False";
      const options = isTrueFalse
        ? [
            { id: "a", text: "True" },
            { id: "b", text: "False" },
          ]
        : form.options
            .filter(Boolean)
            .map((opt, idx) => ({
              id: String.fromCharCode(97 + idx),
              text: opt,
            }));

      const correctIdx = Number(form.correctAnswer);
      const correctAnswer = String.fromCharCode(
        97 + Math.min(correctIdx, options.length - 1),
      );

      await api.assessments.create(
        {
          title: `Question Bank: ${form.text.slice(0, 50)}`,
          description: null,
          skill_id: skill.id,
          role_id: null,
          difficulty:
            form.difficulty === "Easy"
              ? "beginner"
              : form.difficulty === "Hard"
                ? "advanced"
                : "intermediate",
          duration_seconds: 300,
          passing_score: 50,
          status: "published",
          questions: [
            {
              question_text: form.text,
              question_type:
                form.type === "Multiple Choice"
                  ? "multiple_choice"
                  : form.type === "True / False"
                    ? "true_false"
                    : "single_choice",
              options,
              correct_answer: correctAnswer,
              points: 10,
              display_order: 1,
            },
          ],
        },
        token,
      );

      onAdded();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create question",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#EAEAEA] p-5">
          <div>
            <h2 className="text-lg font-semibold text-[#222]">Add Question</h2>
            <p className="text-xs text-[#999] mt-1">
              Creates a draft assessment to hold this question
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <Field label="Question Text">
            <textarea
              rows={3}
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              placeholder="Enter your question..."
              className="w-full border border-[#DDD] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#6C4DF6] resize-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Question Type">
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as Question["type"] })
                }
                className="w-full border border-[#DDD] rounded-lg px-3 py-2.5 text-sm"
              >
                <option>Multiple Choice</option>
                <option>True / False</option>
                <option>Short Answer</option>
              </select>
            </Field>

            <Field label="Skill">
              {loadingSkills ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm text-gray-500">Loading skills...</span>
                </div>
              ) : (
                <select
                  value={form.skill}
                  onChange={(e) =>
                    setForm({ ...form, skill: e.target.value })
                  }
                  className="w-full border border-[#DDD] rounded-lg px-3 py-2.5 text-sm"
                >
                  <option value="">Select skill</option>
                  {skills.map((skill) => (
                    <option key={skill.id} value={skill.name}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>

          <Field label="Difficulty">
            <select
              value={form.difficulty}
              onChange={(e) =>
                setForm({
                  ...form,
                  difficulty: e.target.value as Question["difficulty"],
                })
              }
              className="w-full border border-[#DDD] rounded-lg px-3 py-2.5 text-sm"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </Field>

          {form.type === "Multiple Choice" && (
            <div>
              <p className="text-sm font-medium text-[#333] mb-2">
                Options &amp; Correct Answer
              </p>
              <div className="space-y-2">
                {form.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="correct"
                      checked={form.correctAnswer === String(idx)}
                      onChange={() =>
                        setForm({ ...form, correctAnswer: String(idx) })
                      }
                      className="accent-[#6C4DF6]"
                    />
                    <input
                      type="text"
                      value={opt}
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      onChange={(e) => {
                        const updated = [...form.options];
                        updated[idx] = e.target.value;
                        setForm({ ...form, options: updated });
                      }}
                      className="flex-1 border border-[#DDD] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#6C4DF6]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {form.type === "True / False" && (
            <Field label="Correct Answer">
              <select
                value={form.correctAnswer}
                onChange={(e) =>
                  setForm({ ...form, correctAnswer: e.target.value })
                }
                className="w-full border border-[#DDD] rounded-lg px-3 py-2.5 text-sm"
              >
                <option value="0">True</option>
                <option value="1">False</option>
              </select>
            </Field>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-[#EAEAEA] p-5">
          <button
            onClick={onClose}
            className="border border-[#DDD] px-4 py-2 rounded-lg text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={saving}
            className="bg-[#6C4DF6] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5D3FE4] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Add Question"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-[#333] block mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
