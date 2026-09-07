"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { api, type ExperiencePublic } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type ExperienceForm = {
  position: string;
  company: string;
  duration: string;
  description: string;
};

export default function ExperienceSection() {
  const { token, profile } = useAuth();
  const [experiences, setExperiences] = useState<ExperiencePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState<ExperienceForm>({
    position: "",
    company: "",
    duration: "",
    description: "",
  });

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    api.experiences
      .mine({ page: 1, page_size: 100 }, token)
      .then((res) => setExperiences(res.items))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load experiences"),
      )
      .finally(() => setLoading(false));
  }, [token]);

  const addExperience = async () => {
    if (!form.position.trim() || !form.company.trim()) return;
    if (!token || !profile) {
      setError("Sign in to save experience.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const created = await api.experiences.create(
        {
          profile_id: profile.id,
          title: `${form.position.trim()} at ${form.company.trim()}`,
          description: [form.duration, form.description]
            .filter(Boolean)
            .join("\n\n"),
          experience_type: "employer_project",
          started_at: new Date().toISOString(),
        },
        token,
      );
      setExperiences([...experiences, created]);
      setForm({ position: "", company: "", duration: "", description: "" });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save experience");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Experience</h2>
          <p className="text-sm text-slate-500">Your professional experience</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white"
        >
          <Plus size={16} />
          Add Experience
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {showForm && (
        <div className="mb-6 space-y-4 rounded-xl bg-slate-50 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              placeholder="Job Title"
              value={form.position}
              onChange={(e) =>
                setForm({
                  ...form,
                  position: e.target.value,
                })
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5"
            />

            <input
              placeholder="Company"
              value={form.company}
              onChange={(e) =>
                setForm({
                  ...form,
                  company: e.target.value,
                })
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5"
            />

            <input
              placeholder="Duration"
              value={form.duration}
              onChange={(e) =>
                setForm({
                  ...form,
                  duration: e.target.value,
                })
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5"
            />
          </div>

          <textarea
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5"
          />

          <button
            onClick={addExperience}
            disabled={saving || !form.position.trim() || !form.company.trim()}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Experience"}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-500">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading experience…</span>
        </div>
      ) : experiences.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <p className="text-sm text-slate-500">No experience added yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((item) => (
            <div
              key={item.id}
              className="flex justify-between rounded-xl border border-slate-200 p-5"
            >
              <div>
                <h3 className="font-semibold text-slate-900">{item.title}</h3>

                {item.description && (
                  <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
                    {item.description}
                  </p>
                )}

                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2 py-1 capitalize">
                    {item.experience_type.replace("_", " ")}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 capitalize">
                    {item.verification_status}
                  </span>
                </div>
              </div>

              <button
                disabled
                className="h-fit rounded-lg p-2 text-slate-300"
                title="Delete is not supported by the backend yet"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
