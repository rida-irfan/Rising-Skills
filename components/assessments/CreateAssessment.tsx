"use client";

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, GripVertical, Loader2 } from "lucide-react";
import { api, type SkillResponse, type AssessmentPublic, type AssessmentCreate } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface CreateAssessmentProps {
  onClose: () => void;
}

interface AssessmentForm {
  title: string;
  description: string;
  instructions: string;
  skills: string[];
  difficulty: string;
  passThreshold: number;
  maxAttempts: number;
  timeLimit: number;
  randomize: boolean;
  oneAtATime: boolean;
  showScore: boolean;
  allowRetake: boolean;
}

const STEPS = [
  "Basic Information",
  "Select Questions",
  "Settings",
  "Review & Publish",
];

const mockBankQuestions: Question[] = [];

interface Question {
  id: string;
  text: string;
  type: string;
  skill: string;
  difficulty: string;
  options?: string[];
  correctAnswer?: string;
}

export default function CreateAssessment({ onClose }: CreateAssessmentProps) {
  const { token } = useAuth();
  const [step, setStep] = useState(0);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [skills, setSkills] = useState<SkillResponse[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<AssessmentForm>({
    title: "",
    description: "",
    instructions: "",
    skills: [],
    difficulty: "Medium",
    passThreshold: 70,
    maxAttempts: 2,
    timeLimit: 30,
    randomize: false,
    oneAtATime: true,
    showScore: true,
    allowRetake: true,
  });

  const [newQuestion, setNewQuestion] = useState({
    text: "",
    type: "Multiple Choice",
    skill: "",
    difficulty: "Medium",
    options: ["", "", "", ""],
    correctAnswer: "0",
  });

  useEffect(() => {
    api.skills.list({ page_size: 100 })
      .then((res) => {
        setSkills(res.items);
      })
      .catch((err) => {
        console.error("Failed to load skills:", err);
      })
      .finally(() => setLoadingSkills(false));
  }, []);

  const toggleQuestion = (id: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  const handlePublish = async () => {
    if (!token) {
      setError("Sign in to create assessment.");
      return;
    }
    
    if (!form.title.trim()) {
      setError("Please enter an assessment title.");
      return;
    }
    if (!form.skills[0]) {
      setError("Please select a skill for this assessment.");
      return;
    }
    setPublishing(true);
    setError(null);
    try {
      
      const assessmentData: AssessmentCreate = {
        title: form.title,
        description: form.description,
        skill_id: form.skills[0],
        role_id: null,
        difficulty: form.difficulty === "Easy" ? "beginner" : form.difficulty === "Medium" ? "intermediate" : "advanced",
        duration_seconds: form.timeLimit * 60,
        passing_score: form.passThreshold,
        status: "published",
        questions: customQuestions.map((q, index) => ({
          question_text: q.text,
          question_type: q.type === "Multiple Choice" ? "multiple_choice" : q.type === "True / False" ? "true_false" : "single_choice",
          options: q.options ? q.options.map((opt, idx) => ({ id: String.fromCharCode(97 + idx), text: opt })) : [],
          correct_answer: q.correctAnswer
            ? String.fromCharCode(97 + Math.min(Number(q.correctAnswer), (q.options?.length ?? 4) - 1))
            : "a",
          points: 10,
          display_order: index + 1,
        }))}
       await api.assessments.create(assessmentData, token);
      setShowPublishConfirm(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create assessment"); 
    } finally {
      setPublishing(false);
    }
  };

  const handleAddCustomQuestion = () => {
    if (!newQuestion.text.trim() || !newQuestion.skill) return;

    const isTrueFalse = newQuestion.type === "True / False";
    const question: Question = {
      id: `Q-${Date.now()}`,
      text: newQuestion.text,
      type: newQuestion.type,
      skill: newQuestion.skill,
      difficulty: newQuestion.difficulty,
      options: isTrueFalse
        ? ["True", "False"]
        : newQuestion.type === "Multiple Choice"
          ? newQuestion.options.filter(Boolean)
          : undefined,
      correctAnswer: newQuestion.correctAnswer,
    };

    setCustomQuestions([...customQuestions, question]);
    setNewQuestion({
      text: "",
      type: "Multiple Choice",
      skill: "",
      difficulty: "Medium",
      options: ["", "", "", ""],
      correctAnswer: "0",
    });
    setShowAddQuestion(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-[#EAEAEA] p-5 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-[#222]">
              Create Assessment
            </h2>
            <p className="text-xs text-[#999] mt-1">
              Step {step + 1} of {STEPS.length} — {STEPS[step]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pt-4 shrink-0">
          <div className="flex gap-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex-1">
                <div
                  className={`h-1 rounded-full ${
                    i <= step ? "bg-[#6C4DF6]" : "bg-[#E8E8ED]"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {step === 0 && (
            <StepBasicInfo
              form={form}
              setForm={setForm}
              skills={skills}
              loadingSkills={loadingSkills}
            />
          )}
          {step === 1 && (
            <StepSelectQuestions
              selected={selectedQuestions}
              onToggle={toggleQuestion}
              customQuestions={customQuestions}
              onAddQuestion={() => setShowAddQuestion(true)}
            />
          )}
          {step === 2 && (
            <StepSettings form={form} setForm={setForm} />
          )}
          {step === 3 && (
            <StepReview
              form={form}
              selectedQuestions={selectedQuestions}
              customQuestions={customQuestions}
            />
          )}
        </div>

        <div className="flex justify-between border-t border-[#EAEAEA] p-5 shrink-0">
          <button
            onClick={step === 0 ? onClose : () => setStep(step - 1)}
            className="flex items-center gap-1 border border-[#DDD] px-4 py-2 rounded-lg text-sm"
          >
            {step > 0 && <ChevronLeft size={16} />}
            {step === 0 ? "Cancel" : "Back"}
          </button>

          <div className="flex gap-3">
            <button className="border border-[#DDD] px-4 py-2 rounded-lg text-sm">
              Save Draft
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1 bg-[#6C4DF6] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5D3FE4]"
              >
                Next
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => setShowPublishConfirm(true)}
                className="bg-[#6C4DF6] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5D3FE4]"
              >
                Publish Assessment
              </button>
            )}
          </div>
        </div>
      </div>

      {showPublishConfirm && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-[#222]">
              Publish Assessment?
            </h2>
            <p className="text-sm text-[#666] mt-2">
              Once published, this version will be locked. Students can be
              assigned to this assessment and historical results will remain
              associated with this version.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPublishConfirm(false)}
                className="border border-[#DDD] px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="bg-[#6C4DF6] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5D3FE4] disabled:opacity-60"
              >
                {publishing ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddQuestion && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-[#222] mb-4">
              Add Custom Question
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#333] block mb-1.5">
                  Question Text
                </label>
                <textarea
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                  rows={3}
                  placeholder="Enter your question..."
                  className="w-full border border-[#DDD] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#6C4DF6] resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#333] block mb-1.5">
                    Type
                  </label>
                  <select
                    value={newQuestion.type}
                    onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
                    className="w-full border border-[#DDD] rounded-lg px-3 py-2.5 text-sm"
                  >
                    <option>Multiple Choice</option>
                    <option>True / False</option>
                    <option>Short Answer</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#333] block mb-1.5">
                    Skill
                  </label>
                  <select
                    value={newQuestion.skill}
                    onChange={(e) => setNewQuestion({ ...newQuestion, skill: e.target.value })}
                    className="w-full border border-[#DDD] rounded-lg px-3 py-2.5 text-sm"
                  >
                    <option value="">Select skill</option>
                    {skills.map((skill) => (
                      <option key={skill.id} value={skill.name}>
                        {skill.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#333] block mb-1.5">
                    Difficulty
                  </label>
                  <select
                    value={newQuestion.difficulty}
                    onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                    className="w-full border border-[#DDD] rounded-lg px-3 py-2.5 text-sm"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>

              {newQuestion.type === "True / False" && (
                <div>
                  <label className="text-sm font-medium text-[#333] block mb-1.5">
                    Correct Answer
                  </label>
                  <select
                    value={newQuestion.correctAnswer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                    className="w-full border border-[#DDD] rounded-lg px-3 py-2.5 text-sm"
                  >
                    <option value="0">True</option>
                    <option value="1">False</option>
                  </select>
                </div>
              )}

              {newQuestion.type === "Multiple Choice" && (
                <div>
                  <label className="text-sm font-medium text-[#333] block mb-1.5">
                    Options (A, B, C, D)
                  </label>
                  <div className="space-y-2">
                    {newQuestion.options.map((opt, idx) => (
                      <input
                        key={idx}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...newQuestion.options];
                          updated[idx] = e.target.value;
                          setNewQuestion({ ...newQuestion, options: updated });
                        }}
                        className="w-full border border-[#DDD] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#6C4DF6]"
                      />
                    ))}
                  </div>
                  <label className="text-sm font-medium text-[#333] block mb-1.5 mt-3">
                    Correct Answer
                  </label>
                  <select
                    value={newQuestion.correctAnswer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                    className="w-full border border-[#DDD] rounded-lg px-3 py-2.5 text-sm"
                  >
                    <option value="0">A</option>
                    <option value="1">B</option>
                    <option value="2">C</option>
                    <option value="3">D</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddQuestion(false)}
                className="border border-[#DDD] px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomQuestion}
                className="bg-[#6C4DF6] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5D3FE4]"
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StepBasicInfo({
  form,
  setForm,
  skills,
  loadingSkills,
}: {
  form: AssessmentForm;
  setForm: React.Dispatch<React.SetStateAction<AssessmentForm>>;
  skills: SkillResponse[];
  loadingSkills: boolean;
}) {
  return (
    <div className="space-y-4">
      <Field label="Assessment Title">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Frontend Developer Assessment"
          className="w-full border border-[#DDD] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#6C4DF6]"
        />
      </Field>

      <Field label="Description">
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          placeholder="Brief description of the assessment..."
          className="w-full border border-[#DDD] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#6C4DF6] resize-none"
        />
      </Field>

      <Field label="Instructions">
        <textarea
          value={form.instructions}
          onChange={(e) => setForm({ ...form, instructions: e.target.value })}
          rows={3}
          placeholder="Instructions shown to students before starting..."
          className="w-full border border-[#DDD] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#6C4DF6] resize-none"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Difficulty">
          <select
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            className="w-full border border-[#DDD] rounded-lg px-3 py-2.5 text-sm"
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </Field>

        <Field label="Skills">
          {loadingSkills ? (
            <div className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm text-gray-500">Loading skills...</span>
            </div>
          ) : (
            <select
              className="w-full border border-[#DDD] rounded-lg px-3 py-2.5 text-sm"
              onChange={(e) => setForm({ ...form, skills: [e.target.value] })}
            >
              <option value="">Select a skill</option>
              {skills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Pass Threshold (%)">
          <input
            type="number"
            value={form.passThreshold}
            onChange={(e) =>
              setForm({ ...form, passThreshold: Number(e.target.value) })
            }
            className="w-full border border-[#DDD] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#6C4DF6]"
          />
        </Field>

        <Field label="Maximum Attempts">
          <input
            type="number"
            value={form.maxAttempts}
            onChange={(e) =>
              setForm({ ...form, maxAttempts: Number(e.target.value) })
            }
            className="w-full border border-[#DDD] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#6C4DF6]"
          />
        </Field>

        <Field label="Time Limit (min)">
          <input
            type="number"
            value={form.timeLimit}
            onChange={(e) =>
              setForm({ ...form, timeLimit: Number(e.target.value) })
            }
            className="w-full border border-[#DDD] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#6C4DF6]"
          />
        </Field>
      </div>
    </div>
  );
}

function StepSelectQuestions({
  selected,
  onToggle,
  customQuestions,
  onAddQuestion,
}: {
  selected: string[];
  onToggle: (id: string) => void;
  customQuestions: Question[];
  onAddQuestion: () => void;
}) {
  const allQuestions = [...mockBankQuestions, ...customQuestions];


  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          placeholder="Search questions"
          className="flex-1 min-w-48 border border-[#DDD] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#6C4DF6]"
        />
        <select className="border border-[#DDD] rounded-lg px-3 py-2 text-sm">
          <option>All Skills</option>
          <option>React.js</option>
          <option>JavaScript</option>
        </select>
        <select className="border border-[#DDD] rounded-lg px-3 py-2 text-sm">
          <option>All Difficulties</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
        <select className="border border-[#DDD] rounded-lg px-3 py-2 text-sm">
          <option>All Types</option>
          <option>Multiple Choice</option>
          <option>True / False</option>
          <option>Short Answer</option>
        </select>
        <button
          onClick={onAddQuestion}
          className="bg-[#6C4DF6] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5D3FE4]"
        >
          + Add Question
        </button>
      </div>

      <div className="bg-[#F1EDFF] rounded-lg px-4 py-2.5 mb-4">
        <p className="text-sm font-semibold text-[#6C4DF6]">
          {selected.length} Question{selected.length !== 1 ? "s" : ""} Selected
        </p>
      </div>

      {allQuestions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E8E8ED] p-8 text-center">
          <p className="text-sm text-[#666]">No questions added yet.</p>
          <p className="text-xs text-[#999] mt-1">Click "+ Add Question" to create your first question.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {allQuestions.map((q) => (
            <label
              key={q.id}
              className={`flex items-start gap-3 border rounded-lg p-4 cursor-pointer transition ${
                selected.includes(q.id)
                  ? "border-[#6C4DF6] bg-[#FAFAFF]"
                  : "border-[#E8E8ED] hover:border-[#CCC]"
              }`}
            >
              <input
                type="checkbox"
                checked={selected.includes(q.id)}
                onChange={() => onToggle(q.id)}
                className="mt-1 accent-[#6C4DF6]"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#222]">{q.text}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 bg-[#F0F0F0] rounded text-[#666]">
                    {q.type}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-[#F4F1FF] text-[#6C4DF6] rounded">
                    {q.skill}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-[#FFF4DC] text-[#C78100] rounded">
                    {q.difficulty}
                  </span>
                  {customQuestions.find((cq) => cq.id === q.id) && (
                    <span className="text-xs px-2 py-0.5 bg-[#E8F4E8] text-[#059669] rounded">
                      Custom
                    </span>
                  )}
                </div>
              </div>
              {selected.includes(q.id) && (
                <GripVertical size={16} className="text-[#CCC] shrink-0 mt-1" />
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function StepSettings({
  form,
  setForm,
}: {
  form: AssessmentForm;
  setForm: React.Dispatch<React.SetStateAction<AssessmentForm>>;
}) {
  return (
    <div className="space-y-1">
      <SettingRow label="Time Limit">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={form.timeLimit}
            onChange={(e) =>
              setForm({ ...form, timeLimit: Number(e.target.value) })
            }
            className="w-20 border border-[#DDD] rounded-lg px-3 py-1.5 text-sm text-right"
          />
          <span className="text-sm text-[#666]">minutes</span>
        </div>
      </SettingRow>

      <SettingRow label="Maximum Attempts">
        <input
          type="number"
          value={form.maxAttempts}
          onChange={(e) =>
            setForm({ ...form, maxAttempts: Number(e.target.value) })
          }
          className="w-20 border border-[#DDD] rounded-lg px-3 py-1.5 text-sm text-right"
        />
      </SettingRow>

      <SettingRow label="Randomize Questions">
        <Toggle
          checked={form.randomize}
          onChange={(v) => setForm({ ...form, randomize: v })}
        />
      </SettingRow>

      <SettingRow label="One Question at a Time">
        <Toggle
          checked={form.oneAtATime}
          onChange={(v) => setForm({ ...form, oneAtATime: v })}
        />
      </SettingRow>

      <SettingRow label="Show Score After Submission">
        <Toggle
          checked={form.showScore}
          onChange={(v) => setForm({ ...form, showScore: v })}
        />
      </SettingRow>

      <SettingRow label="Allow Retake">
        <Toggle
          checked={form.allowRetake}
          onChange={(v) => setForm({ ...form, allowRetake: v })}
        />
      </SettingRow>
    </div>
  );
}

function StepReview({
  form,
  selectedQuestions,
  customQuestions,
}: {
  form: AssessmentForm;
  selectedQuestions: string[];
  customQuestions: Question[];
}) {

  const allQuestions = [...mockBankQuestions, ...customQuestions];
  const selected = allQuestions.filter((q) =>
    selectedQuestions.includes(q.id)
  );

  return (
    <div className="space-y-5">
      <div className="bg-[#F8F9FC] rounded-xl p-5">
        <h3 className="font-semibold text-[#222] text-lg">
          {form.title || "Untitled Assessment"}
        </h3>
        <p className="text-sm text-[#666] mt-1">
          {form.description || "No description provided"}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#E8E8ED]">
          <SummaryItem label="Difficulty" value={form.difficulty} />
          <SummaryItem
            label="Questions"
            value={selectedQuestions.length.toString()}
          />
          <SummaryItem
            label="Pass Threshold"
            value={`${form.passThreshold}%`}
          />
          <SummaryItem
            label="Max Attempts"
            value={form.maxAttempts.toString()}
          />
          <SummaryItem
            label="Time Limit"
            value={`${form.timeLimit} min`}
          />
          <SummaryItem
            label="Randomize"
            value={form.randomize ? "Yes" : "No"}
          />
          <SummaryItem
            label="One at a Time"
            value={form.oneAtATime ? "Yes" : "No"}
          />
        </div>
      </div>

      {selected.length > 0 ? (
        <div>
          <h4 className="text-sm font-semibold text-[#222] mb-3">
            Selected Questions ({selected.length})
          </h4>
          <div className="space-y-2">
            {selected.map((q, i) => (
              <div
                key={q.id}
                className="flex items-start gap-3 border border-[#E8E8ED] rounded-lg p-3"
              >
                <span className="text-xs font-semibold text-[#6C4DF6] bg-[#F1EDFF] w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-[#444]">{q.text}</p>
                {customQuestions.find((cq) => cq.id === q.id) && (
                  <span className="text-xs px-2 py-0.5 bg-[#E8F4E8] text-[#059669] rounded">
                    Custom
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#E8E8ED] p-8 text-center">
          <p className="text-sm text-[#666]">No questions selected.</p>
          <p className="text-xs text-[#999] mt-1">Go back to Step 2 to add and select questions.</p>
        </div>
      )}
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

function SettingRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#F0F0F0]">
      <span className="text-sm font-medium text-[#333]">{label}</span>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition ${
        checked ? "bg-[#6C4DF6]" : "bg-[#DDD]"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#999]">{label}</p>
      <p className="text-sm font-medium text-[#222] mt-0.5">{value}</p>
    </div>
  );
}










