"use client";

import {
  Award,
  Plus,
  ShieldCheck,
  Target,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import SkillCard, {
  Skill,
  SkillState,
} from "./SkillCard";

import SkillFilters from "./SkillFilters";

import AddSkillModal from "./AddSkillModal";

import EditSkillModal from "./EditSkillModal";

import SkillDetailsModal from "./SkillDetailsModal";
import { api, type EvidencePublic, type SkillResponse } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { LoadingState, ErrorState } from "@/components/ui/states";

export default function SkillsPage() {
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);
  const [evidence, setEvidence] = useState<EvidencePublic[]>([]);
  const [skillDetailsMap, setSkillDetailsMap] = useState<Map<string, SkillResponse>>(new Map());
  const [allSkills, setAllSkills] = useState<SkillResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMySkills = async (authToken: string | null) => {
    if (!authToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [evidenceRes, skillsRes] = await Promise.all([
        api.evidence.list({ page_size: 100 }, authToken),
        api.skills.list({ page_size: 100 }),
      ]);

      setEvidence(evidenceRes.items);
      setAllSkills(skillsRes.items);

      // Fetch skill details for each evidence's skill_id
      const uniqueSkillIds = Array.from(
        new Set(evidenceRes.items.map((e) => e.skill_id)),
      );
      const detailsMap = new Map<string, SkillResponse>();
      await Promise.all(
        uniqueSkillIds.map(async (skillId) => {
          try {
            const skill = await api.skills.get(skillId);
            detailsMap.set(skillId, skill);
          } catch {
            /* ignore */
          }
        }),
      );
      setSkillDetailsMap(detailsMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load skills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMySkills(token);
  }, [token]);

  const skills = useMemo<Skill[]>(() => {
    return evidence.map((e) => {
      const skill = skillDetailsMap.get(e.skill_id);
      const proficiency =
        (e.evidence_data?.proficiency as string | undefined) || "—";
      const skillState: SkillState =
        e.status === "verified"
          ? "Verified"
          : e.status === "pending"
            ? "Self-Reported"
            : "Self-Reported";
      return {
        id: e.id,
        name: skill?.name || e.skill_id,
        category: skill?.category || "Uncategorized",
        proficiency,
        state: skillState,
        evidenceCount: 1,
        lastUpdated: new Date(e.created_at).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        description:
          (e.evidence_data?.notes as string | undefined) || undefined,
      };
    });
  }, [evidence, skillDetailsMap]);

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const matchesSearch = skill.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory =
        category === "All" || skill.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [skills, search, category]);

  const categories = useMemo(
    () => Array.from(new Set(skills.map((s) => s.category))).sort(),
    [skills],
  );

  const verifiedCount = skills.filter((s) => s.state === "Verified").length;
  const demonstratedCount = skills.filter((s) => s.state === "Demonstrated").length;
  const assessedCount = skills.filter((s) => s.state === "Assessed").length;

  const handleAddSkill = async (data: {
    skill_id: string;
    proficiency: string;
    description: string;
  }) => {
    setAddError(null);
    if (!token) {
      setAddError("Please sign in to add a skill to your profile.");
      return;
    }
    try {
      const createdEvidence = await api.evidence.selfReport(
        {
          skill_id: data.skill_id,
          proficiency: data.proficiency,
          notes: data.description || null,
        },
        token,
      );
      setEvidence((current) => [
        createdEvidence,
        ...current.filter((item) => item.id !== createdEvidence.id),
      ]);
      const selectedSkill = allSkills.find(
        (skill) => skill.id === createdEvidence.skill_id,
      );
      if (selectedSkill) {
        setSkillDetailsMap((current) =>
          new Map(current).set(selectedSkill.id, selectedSkill),
        );
      }
      setShowAdd(false);
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 4000);
      await fetchMySkills(token);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add skill";
      setAddError(msg);
      console.error("Failed to add skill:", err);
    }
  };

  const handleUpdateSkill = async (data: {
    proficiency: string;
    description: string;
  }) => {
    if (!token || !editingSkill) return;
    try {
      await api.evidence.updateSelfReport(
        editingSkill.id.toString(),
        {
          proficiency: data.proficiency,
          notes: data.description || null,
        },
        token,
      );
      setEditingSkill(null);
      await fetchMySkills(token);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to update skill");
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!token || !window.confirm("Delete this self-reported skill?")) return;
    try {
      await api.evidence.delete(id.toString(), token);
      await fetchMySkills(token);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to delete skill");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              Student Portal
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              My Skills
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Your self-reported and verified skills. Add new skills to build
              your profile.
            </p>
          </div>
          <button
            onClick={() => {
              setAddError(null);
              setShowAdd(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus size={18} />
            Add Skill
          </button>
        </div>

        {addSuccess && (
          <div className="mt-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            Skill added to your profile! View it on your <a href="/dashboard/profile" className="font-semibold underline">profile page</a>.
          </div>
        )}
        {addError && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {addError}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">My Skills</p>
              <Target size={20} className="text-indigo-500" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {skills.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Verified</p>
              <ShieldCheck size={20} className="text-green-600" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {verifiedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Self-Reported</p>
              <Award size={20} className="text-yellow-600" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {skills.filter((s) => s.state === "Self-Reported").length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Self-Reported</p>
              <Target size={20} className="text-blue-600" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {skills.filter((s) => s.state === "Self-Reported").length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-8">
          <SkillFilters
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
          />
        </div>

        {/* Skills */}
        <div className="mt-6">
          {loading ? (
            <LoadingState label="Loading your skills…" />
          ) : error ? (
            <ErrorState message={error} onRetry={() => fetchMySkills(token)} />
          ) : filteredSkills.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Target size={40} className="mx-auto text-slate-300" />
              <h3 className="mt-4 text-lg font-bold text-slate-800">
                No skills found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {skills.length === 0
                  ? "You haven't added any skills yet. Click \"Add Skill\" to get started."
                  : "Try changing your search or filters."}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredSkills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onView={setSelectedSkill}
                  onEdit={setEditingSkill}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <AddSkillModal
          onClose={() => setShowAdd(false)}
          onAdd={handleAddSkill}
          skills={allSkills}
          token={token}
        />
      )}

      {editingSkill && (
        <EditSkillModal
          skill={editingSkill}
          onClose={() => setEditingSkill(null)}
          onSave={handleUpdateSkill}
        />
      )}

      {selectedSkill && (
        <SkillDetailsModal
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
        />
      )}
    </div>
  );
}
