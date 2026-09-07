"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { api, type OpportunityPublic, type OpportunityType } from "@/lib/api";

interface EditOpportunityModalProps {
  opportunity: OpportunityPublic;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}

const opportunityTypes: { value: OpportunityType; label: string }[] = [
  { value: "job", label: "Full-time job" },
  { value: "internship", label: "Internship" },
  { value: "apprenticeship", label: "Apprenticeship" },
  { value: "project", label: "Project" },
];

function dateValue(value: string | null): string {
  return value ? value.slice(0, 10) : "";
}

export default function EditOpportunityModal({
  opportunity,
  token,
  onClose,
  onSaved,
}: EditOpportunityModalProps) {
  const [form, setForm] = useState({
    title: opportunity.title,
    description: opportunity.description || "",
    opportunityType: opportunity.opportunity_type,
    location: opportunity.location || "",
    isRemote: opportunity.is_remote,
    deadline: dateValue(opportunity.deadline),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Job title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.opportunities.update(
        opportunity.id,
        {
          title: form.title.trim(),
          description: form.description.trim() || null,
          opportunity_type: form.opportunityType,
          location: form.isRemote ? null : form.location.trim() || null,
          is_remote: form.isRemote,
          deadline: form.deadline
            ? new Date(`${form.deadline}T23:59:59`).toISOString()
            : null,
        },
        token,
      );
      onSaved();
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update the job.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Edit Job</h2>
            <p className="mt-1 text-sm text-slate-500">Update this opportunity before publishing.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close modal" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">Job title *</span><input required value={form.title} onChange={(event) => update("title", event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">Opportunity type</span><select value={form.opportunityType} onChange={(event) => update("opportunityType", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500">{opportunityTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label>
            <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">Application deadline</span><input type="date" value={form.deadline} onChange={(event) => update("deadline", event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" /></label>
          </div>
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">Description</span><textarea rows={4} value={form.description} onChange={(event) => update("description", event.target.value)} className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
          <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">Location</span><input disabled={form.isRemote} value={form.location} onChange={(event) => update("location", event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none disabled:bg-slate-100 focus:border-blue-500" /></label>
            <label className="flex items-center gap-2 pb-3 text-sm font-medium text-slate-700"><input type="checkbox" checked={form.isRemote} onChange={(event) => update("isRemote", event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600" />Remote role</label>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{saving ? "Saving..." : "Save Changes"}</button></div>
        </form>
      </div>
    </div>
  );
}
