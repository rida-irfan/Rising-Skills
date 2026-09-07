"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api, type EvidencePublic, type SkillResponse } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function SkillsSection() {
  const { token } = useAuth();
  const [skills, setSkills] = useState<EvidencePublic[]>([]);
  const [skillDetails, setSkillDetails] = useState<Map<string, SkillResponse>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    api.evidence
      .list({ page_size: 100 }, token)
      .then(async (res) => {
        const evidence = res.items;
        setSkills(evidence);

        const uniqueSkillIds = Array.from(new Set(evidence.map((e) => e.skill_id)));
        const skillDetailsMap = new Map<string, SkillResponse>();
        await Promise.all(
          uniqueSkillIds.map(async (skillId) => {
            try {
              const skill = await api.skills.get(skillId);
              skillDetailsMap.set(skillId, skill);
            } catch {
              /* ignore */
            }
          })
        );
        setSkillDetails(skillDetailsMap);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load skills");
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900">
          My Skills
        </h2>

        <p className="text-sm text-slate-500">
          Skills and their current verification state
        </p>
      </div>

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
      ) : skills.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <p className="text-sm text-slate-500 mb-4">No skills added yet.</p>
          <p className="text-xs text-slate-400">Add skills from the Skills page, or by completing assessments and challenges.</p>
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
    </section>
  );
}