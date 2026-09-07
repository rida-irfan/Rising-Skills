"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Education = {
  id: number;
  degree: string;
  institution: string;
  year: string;
};

export default function EducationSection() {
  const [education, setEducation] = useState<Education[]>([]);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    degree: "",
    institution: "",
    year: "",
  });

  const addEducation = () => {
    if (!form.degree || !form.institution) return;

    setEducation([
      ...education,
      {
        id: Date.now(),
        ...form,
      },
    ]);

    setForm({
      degree: "",
      institution: "",
      year: "",
    });

    setShowForm(false);
  };

  const deleteEducation = (id: number) => {
    setEducation(education.filter((item) => item.id !== id));
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Education
          </h2>

          <p className="text-sm text-slate-500">
            Your academic background
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white"
        >
          <Plus size={16} />
          Add Education
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-5">

          <div className="grid gap-4 md:grid-cols-3">

            <input
              placeholder="Degree"
              value={form.degree}
              onChange={(e) =>
                setForm({ ...form, degree: e.target.value })
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5"
            />

            <input
              placeholder="Institution"
              value={form.institution}
              onChange={(e) =>
                setForm({ ...form, institution: e.target.value })
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5"
            />

            <input
              placeholder="Year"
              value={form.year}
              onChange={(e) =>
                setForm({ ...form, year: e.target.value })
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5"
            />

          </div>

          <button
            onClick={addEducation}
            className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white"
          >
            Save Education
          </button>
        </div>
      )}

      <div className="space-y-4">
        {education.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
            <p className="text-sm text-slate-500">No education added yet.</p>
          </div>
        ) : (
          education.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
            >

              <div>
                <h3 className="font-semibold text-slate-900">
                  {item.degree}
                </h3>

                <p className="text-sm text-slate-600">
                  {item.institution}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {item.year}
                </p>
              </div>

              <div className="flex gap-2">
                <button className="rounded-lg p-2 hover:bg-slate-100">
                  <Pencil size={16} />
                </button>

                <button
                  onClick={() => deleteEducation(item.id)}
                  className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>

            </div>
          ))
        )}

      </div>
    </section>
  );
}