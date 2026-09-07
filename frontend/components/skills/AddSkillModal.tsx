"use client";

import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { api, type SkillResponse } from "@/lib/api";
import { SKILL_CATEGORIES } from "@/lib/skill-categories";

interface AddSkillModalProps {
  onClose: () => void;
  skills: SkillResponse[];
  token?: string | null;
  onAdd: (skill: {
    skill_id: string;
    proficiency: string;
    description: string;
  }) => void;
}

export default function AddSkillModal({
  onClose,
  skills,
  token,
  onAdd,
}: AddSkillModalProps) {
  const [skillInput, setSkillInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [proficiency, setProficiency] = useState("Beginner");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const matchedSkill = useMemo(() => {
    const name = skillInput.trim().toLowerCase();
    if (!name) return undefined;
    return skills.find((s) => s.name.toLowerCase() === name);
  }, [skills, skillInput]);

  const isNewSkill = Boolean(skillInput.trim() && !matchedSkill);

  const handleSkillInput = (value: string) => {
    setSkillInput(value);
    setFormError(null);
    const found = skills.find(
      (s) => s.name.toLowerCase() === value.trim().toLowerCase(),
    );
    if (found) {
      setCategoryInput(found.category);
    } else {
      setCategoryInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const name = skillInput.trim();
    if (!name) {
      setFormError("Please enter a skill name.");
      return;
    }

    if (!token) {
      setFormError("Please sign in to add a skill.");
      return;
    }

    setSubmitting(true);

    try {
      let targetSkillId = matchedSkill?.id;

      // If the skill is not in the local list, search the backend first
      if (!targetSkillId) {
        const searchRes = await api.skills.list({
          search: name,
          page_size: 50,
        });
        const found = searchRes.items.find(
          (s) => s.name.toLowerCase() === name.toLowerCase(),
        );
        if (found) {
          targetSkillId = found.id;
        }
      }

      // Learners can claim taxonomy skills, but cannot modify the global taxonomy.
      if (!targetSkillId) {
        setFormError("Select a skill from the existing taxonomy.");
        setSubmitting(false);
        return;
      }

      onAdd({
        skill_id: targetSkillId!,
        proficiency,
        description,
      });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to add skill to profile";
      setFormError(msg);
      console.error("Add skill error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Add Skill</h2>

            <p className="mt-1 text-xs text-slate-500">
              Add a skill to your profile as a self-reported claim.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {formError && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </p>
          )}

          <div>
            <label
              htmlFor="skill-input"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Skill
            </label>

            <input
              id="skill-input"
              type="text"
              value={skillInput}
              onChange={(e) => handleSkillInput(e.target.value)}
              placeholder="e.g. React.js"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />

            {matchedSkill && (
              <p className="mt-2 text-xs text-emerald-600">
                This skill exists in the taxonomy. It will be added to your
                profile.
              </p>
            )}

            {isNewSkill && (
              <p className="mt-2 text-xs text-indigo-600">
                This skill is not in the taxonomy. Select an existing skill.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="category-input"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Category
            </label>
            <select
              id="category-input"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              disabled={Boolean(matchedSkill)}
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-indigo-500 ${
                matchedSkill
                  ? "border-slate-200 bg-slate-50 text-slate-600"
                  : "border-slate-200"
              }`}
            >
              <option value="">
                {matchedSkill ? "Auto-filled from taxonomy" : "Select an existing skill first"}
              </option>
              {SKILL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {matchedSkill && (
              <p className="mt-1 text-xs text-slate-500">
                Category is set from the existing skill.
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Proficiency
            </label>

            <select
              value={proficiency}
              onChange={(e) => setProficiency(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
              <option>Expert</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Briefly describe your experience..."
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div className="rounded-xl bg-blue-50 p-3 text-xs text-blue-700">
            New skills are initially stored as
            <strong> Self-Reported</strong>. Assessment, Demonstrated and
            Verified states can only be produced through their respective
            system workflows.
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || !skillInput.trim()}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {submitting ? "Saving..." : "Add Skill"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
