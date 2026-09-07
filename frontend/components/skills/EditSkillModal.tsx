"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Skill } from "./SkillCard";

interface EditSkillModalProps {
  skill: Skill;
  onClose: () => void;
  onSave: (data: {
    proficiency: string;
    description: string;
  }) => void;
}

export default function EditSkillModal({
  skill,
  onClose,
  onSave,
}: EditSkillModalProps) {
  const [proficiency, setProficiency] =
    useState(skill.proficiency);

  const [description, setDescription] = useState(
    skill.description || ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      proficiency,
      description,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-lg font-bold">
              Edit Skill
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {skill.name}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">
              Proficiency
            </label>

            <select
              value={proficiency}
              onChange={(e) =>
                setProficiency(e.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
              <option>Expert</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}