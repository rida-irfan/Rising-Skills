"use client";

import {
  Award,
  Plus,
  ShieldCheck,
  Target,
} from "lucide-react";

import { useMemo, useState } from "react";

import SkillCard, {
  Skill,
} from "./SkillCard";

import SkillFilters from "./SkillFilters";

import AddSkillModal from "./AddSkillModal";

import EditSkillModal from "./EditSkillModal";

import SkillDetailsModal from "./SkillDetailsModal";
import { api, type SkillResponse } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";
import { useAuth } from "@/lib/auth-context";
import { LoadingState, ErrorState } from "@/components/ui/states";

function mapSkill(s: SkillResponse): Skill {
  return {
    id: s.id,
    name: s.name,
    category: s.category,
    proficiency: "—",
    state: "Self-Reported",
    evidenceCount: 0,
    lastUpdated: new Date(s.created_at).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    description: s.parent_skill_id
      ? "Sub-skill in the taxonomy."
      : "Top-level skill in the taxonomy.",
  };
}

export default function SkillsPage() {
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [state, setState] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);

  const fetcher = useMemo(
    () => () =>
      api.skills.list({
        search: search || undefined,
        page_size: 100,
      }),
    [search],
  );
  const { data, loading, error, refetch } = useFetch(fetcher, [search]);

  const skills = useMemo(
    () => (data?.items || []).map(mapSkill),
    [data],
  );

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const matchesSearch = skill.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory =
        category === "All" || skill.category === category;
      const matchesState = state === "All" || skill.state === state;
      return matchesSearch && matchesCategory && matchesState;
    });
  }, [skills, search, category, state]);

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
      await api.evidence.selfReport(
        {
          skill_id: data.skill_id,
          proficiency: data.proficiency,
          notes: data.description || null,
        },
        token,
      );
      setShowAdd(false);
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 4000);
      refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add skill";
      setAddError(msg);
      console.error("Failed to add skill:", err);
    }
  };

  const handleUpdateSkill = (data: {
    proficiency: string;
    description: string;
  }) => {
    void data;
    setEditingSkill(null);
  };

  const handleDelete = (id: string | number) => {
    void id;
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
              Skills Taxonomy
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Browse the standardized skill taxonomy. Skills are linked to
              assessments, challenges, roles and opportunities.
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
              <p className="text-sm text-slate-500">Total Skills</p>
              <Target size={20} className="text-indigo-500" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {skills.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Categories</p>
              <ShieldCheck size={20} className="text-green-600" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {categories.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Top-level</p>
              <Award size={20} className="text-purple-600" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {skills.filter((s) => s.description === "Top-level skill in the taxonomy.").length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Sub-skills</p>
              <Target size={20} className="text-blue-600" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {skills.filter((s) => s.description === "Sub-skill in the taxonomy.").length}
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
            state={state}
            setState={setState}
          />
        </div>

        {/* Skills */}
        <div className="mt-6">
          {loading ? (
            <LoadingState label="Loading skills…" />
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : filteredSkills.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Target size={40} className="mx-auto text-slate-300" />
              <h3 className="mt-4 text-lg font-bold text-slate-800">
                No skills found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or filters.
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
          skills={data?.items || []}
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