"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { api, type EvidencePublic, type SkillResponse } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import AddSkillModal from "@/components/skills/AddSkillModal";

export default function SkillsSection() {
  const { token } = useAuth();
  const [skills, setSkills] = useState<EvidencePublic[]>([]);
  const [skillDetails, setSkillDetails] = useState<Map<string, SkillResponse>>(
    new Map(),
  );
  const [skillOptions, setSkillOptions] = useState<SkillResponse[]>([]);
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);

  const fetchSkills = async (authToken: string | null) => {
    if (!authToken) return;
    setLoading(true);
    setError(null);
    try {
      const [evidenceRes, skillsRes] = await Promise.all([
        api.evidence.list({ page_size: 100 }, authToken),
        api.skills.list({ page_size: 100 }),
      ]);

      const evidence = evidenceRes.items;
      setSkills(evidence);
      setSkillOptions(skillsRes.items);

      const uniqueSkillIds = Array.from(
        new Set(evidence.map((e) => e.skill_id)),
      );
      const skillDetailsMap = new Map<string, SkillResponse>();
      await Promise.all(
        uniqueSkillIds.map(async (skillId) => {
          try {
            const skill = await api.skills.get(skillId);
            skillDetailsMap.set(skillId, skill);
          } catch {
            /* ignore */
          }
        }),
      );
      setSkillDetails(skillDetailsMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load skills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      void fetchSkills(token);
    }
  }, [token]);

  const handleAdd = async (data: {
    skill_id: string;
    proficiency: string;
    description: string;
  }) => {
    setAddError(null);
    if (!token) return;
    try {
      const createdEvidence = await api.evidence.selfReport(
        {
          skill_id: data.skill_id,
          proficiency: data.proficiency,
          notes: data.description || null,
        },
        token,
      );
      setSkills((current) => [
        createdEvidence,
        ...current.filter((item) => item.id !== createdEvidence.id),
      ]);
      const selectedSkill = skillOptions.find(
        (skill) => skill.id === createdEvidence.skill_id,
      );
      if (selectedSkill) {
        setSkillDetails((current) =>
          new Map(current).set(selectedSkill.id, selectedSkill),
        );
      }
      setShowAdd(false);
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 4000);
      await fetchSkills(token);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to add skill to profile";
      setAddError(msg);
      console.error("Failed to add skill:", err);
    }
  };

  const empty = !loading && skills.length === 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">My Skills</h2>

          <p className="text-sm text-slate-500">
            Skills and their current verification state
          </p>
        </div>

        {token && (
          <button
            onClick={() => {
              setAddError(null);
              setShowAdd(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus size={16} />
            Add Skill
          </button>
        )}
      </div>

      {addSuccess && (
        <p className="mb-4 rounded-xl bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
          Skill added to your profile.
        </p>
      )}

      {addError && (
        <p className="mb-4 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {addError}
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-500">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading skills...</span>
        </div>
      ) : empty ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <p className="text-sm text-slate-500 mb-4">No skills added yet.</p>
          <p className="text-xs text-slate-400">
            Add skills from the Skills page, or by completing assessments and
            challenges.
          </p>
          <Link
            href="/dashboard/skills"
            className="inline-block mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Browse & Add Skills
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {skills.map((evidence) => {
            const skill = skillDetails.get(evidence.skill_id);
            return (
              <div
                key={evidence.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
              >
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {skill?.name || evidence.skill_id}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {skill?.category && `${skill.category} • `}
                    Score: {evidence.score}
                  </p>

                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      evidence.status === "verified"
                        ? "bg-green-100 text-green-700"
                        : evidence.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {evidence.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <AddSkillModal
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
          skills={skillOptions}
          token={token}
        />
      )}
    </section>
  );
}
