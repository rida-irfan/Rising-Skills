"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { api, type EducationPublic } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type EducationForm = {
  degree: string;
  institution: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  grade: string;
  description: string;
};

const EMPTY_FORM: EducationForm = {
  degree: "",
  institution: "",
  field_of_study: "",
  start_date: "",
  end_date: "",
  grade: "",
  description: "",
};

export default function EducationSection() {
  const { token } = useAuth();
  const [education, setEducation] = useState<EducationPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EducationForm>(EMPTY_FORM);

  const fetchEducation = () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    api.education
      .mine({ page: 1, page_size: 100 }, token)
      .then((res) => setEducation(res.items))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load education"),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEducation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const startEdit = (item: EducationPublic) => {
    setEditingId(item.id);
    setForm({
      degree: item.degree,
      institution: item.institution,
      field_of_study: item.field_of_study ?? "",
      start_date: item.start_date ?? "",
      end_date: item.end_date ?? "",
      grade: item.grade ?? "",
      description: item.description ?? "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const addEducation = async () => {
    if (!form.degree.trim() || !form.institution.trim()) return;
    if (!token) {
      setError("Sign in to save education.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        degree: form.degree.trim(),
        institution: form.institution.trim(),
        field_of_study: form.field_of_study.trim() || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        grade: form.grade.trim() || null,
        description: form.description.trim() || null,
      };

      if (editingId) {
        const updated = await api.education.update(editingId, payload, token);
        setEducation((prev) =>
          prev.map((item) => (item.id === editingId ? updated : item)),
        );
      } else {
        const created = await api.education.create(payload, token);
        setEducation([...education, created]);
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save education");
    } finally {
      setSaving(false);
    }
  };

  const deleteEducation = async (id: string) => {
    if (!token) return;
    try {
      await api.education.delete(id, token);
      setEducation(education.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete education");
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Education</h2>
          <p className="text-sm text-slate-500">Your academic background</p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white"
        >
          <Plus size={16} />
          {editingId ? "Edit Education" : "Add Education"}
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {showForm && (
        <div className="mb-6 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              placeholder="Degree *"
              value={form.degree}
              onChange={(e) => setForm({ ...form, degree: e.target.value })}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5"
            />
            <input
              placeholder="Institution *"
              value={form.institution}
              onChange={(e) => setForm({ ...form, institution: e.target.value })}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5"
            />
            <input
              placeholder="Field of Study"
              value={form.field_of_study}
              onChange={(e) => setForm({ ...form, field_of_study: e.target.value })}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5"
            />
            <input
              placeholder="Grade / GPA"
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5"
            />
            <input
              type="date"
              placeholder="Start Date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5"
            />
            <input
              type="date"
              placeholder="End Date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5"
            />
          </div>

          <textarea
            placeholder="Description (optional)"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5"
          />

          <div className="flex gap-3">
            <button
              onClick={addEducation}
              disabled={saving || !form.degree.trim() || !form.institution.trim()}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : editingId ? "Update Education" : "Save Education"}
            </button>
            <button
              onClick={resetForm}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-500">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading education…</span>
        </div>
      ) : education.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <p className="text-sm text-slate-500">No education added yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {education.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
            >
              <div>
                <h3 className="font-semibold text-slate-900">{item.degree}</h3>
                <p className="text-sm text-slate-600">{item.institution}</p>
                {item.field_of_study && (
                  <p className="text-sm text-slate-500">{item.field_of_study}</p>
                )}
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-400">
                  {item.start_date && (
                    <span>
                      {item.start_date}
                      {item.end_date ? ` — ${item.end_date}` : " — Present"}
                    </span>
                  )}
                  {item.grade && (
                    <span className="rounded-full bg-slate-100 px-2 py-1">
                      {item.grade}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(item)}
                  className="rounded-lg p-2 hover:bg-slate-100"
                >
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
          ))}
        </div>
      )}
    </section>
  );
}
