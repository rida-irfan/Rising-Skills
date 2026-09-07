"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import {
  api,
  type OpportunityType,
  type OrganizationResponse,
  type SkillResponse,
} from "@/lib/api";

const opportunityTypes: { value: OpportunityType; label: string }[] = [
  { value: "job", label: "Full-time job" },
  { value: "internship", label: "Internship" },
  { value: "apprenticeship", label: "Apprenticeship" },
  { value: "project", label: "Project" },
];

interface CreateOpportunityModalProps {
  token: string;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateOpportunityModal({
  token,
  onClose,
  onCreated,
}: CreateOpportunityModalProps) {
  const [organization, setOrganization] = useState<OrganizationResponse | null>(null);
  const [loadingOrganization, setLoadingOrganization] = useState(true);
  const [availableSkills, setAvailableSkills] = useState<SkillResponse[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    opportunityType: "job" as OpportunityType,
    location: "",
    isRemote: false,
    deadline: "",
  });

  useEffect(() => {
    let cancelled = false;
    setLoadingOrganization(true);
    Promise.all([
      api.organizations.list(token),
      api.skills.list({ page_size: 100 }),
    ])
      .then(([organizations, skillsResponse]) => {
        if (cancelled) return;
        const currentOrganization = organizations[0] ?? null;
        setOrganization(currentOrganization);
        setAvailableSkills(skillsResponse.items);
        if (currentOrganization?.location) {
          setForm((current) => ({
            ...current,
            location: current.location || currentOrganization.location || "",
          }));
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Could not load your organization.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingOrganization(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  function updateForm(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleSkill(skillId: string) {
    setSelectedSkillIds((current) =>
      current.includes(skillId)
        ? current.filter((id) => id !== skillId)
        : [...current, skillId],
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organization) {
      setError("Create an employer organization before posting a job.");
      return;
    }
    if (!form.title.trim()) {
      setError("Job title is required.");
      return;
    }
    if (selectedSkillIds.length === 0) {
      setError("Select at least one required skill.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await api.opportunities.create(
        {
          organization_id: organization.id,
          title: form.title.trim(),
          description: form.description.trim() || null,
          opportunity_type: form.opportunityType,
          location: form.isRemote ? null : form.location.trim() || null,
          is_remote: form.isRemote,
          deadline: form.deadline ? new Date(`${form.deadline}T23:59:59`).toISOString() : null,
          skills: selectedSkillIds.map((skill_id) => ({
            skill_id,
            importance_weight: 1,
          })),
        },
        token,
      );
      onCreated();
      onClose();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not create the job.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-opportunity-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 id="create-opportunity-title" className="text-xl font-bold text-slate-900">
              Post New Job
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add an opportunity for learners to discover.
            </p>
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
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Job title *</span>
            <input
              required
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
              placeholder="e.g. Frontend Developer"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Opportunity type</span>
              <select
                value={form.opportunityType}
                onChange={(event) => updateForm("opportunityType", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {opportunityTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Application deadline</span>
              <input
                type="date"
                value={form.deadline}
                onChange={(event) => updateForm("deadline", event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Description</span>
            <textarea
              rows={4}
              value={form.description}
              onChange={(event) => updateForm("description", event.target.value)}
              placeholder="Describe the role, responsibilities and requirements..."
              className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Location</span>
              <input
                value={form.location}
                disabled={form.isRemote}
                onChange={(event) => updateForm("location", event.target.value)}
                placeholder="e.g. Lahore, Pakistan"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none disabled:bg-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <label className="flex items-center gap-2 pb-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.isRemote}
                onChange={(event) => updateForm("isRemote", event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Remote role
            </label>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Required skills *
            </span>
            <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 p-3">
              <div className="flex flex-wrap gap-2">
                {availableSkills.map((skill) => {
                  const selected = selectedSkillIds.includes(skill.id);
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                        selected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-blue-400"
                      }`}
                    >
                      {skill.name}
                    </button>
                  );
                })}
              </div>
              {availableSkills.length === 0 && (
                <p className="text-sm text-slate-500">No taxonomy skills available.</p>
              )}
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Selected: {selectedSkillIds.length}
            </p>
          </div>

          {!organization && !loadingOrganization && (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
              No organization is linked to this employer account yet.
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || loadingOrganization || !organization}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Creating..." : "Create Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
