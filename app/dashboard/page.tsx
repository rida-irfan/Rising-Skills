"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, type EvidencePublic, type MatchPublic, type SkillResponse } from "@/lib/api";
import Link from "next/link";

export default function DashboardPage() {
  const { token, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [skillsCount, setSkillsCount] = useState({ total: 0, verified: 0 });
  const [assessmentsCount, setAssessmentsCount] = useState({ total: 0, completed: 0 });
  const [opportunitiesCount, setOpportunitiesCount] = useState(0);
  const [skills, setSkills] = useState<EvidencePublic[]>([]);
  const [matches, setMatches] = useState<MatchPublic[]>([]);
  const [skillDetails, setSkillDetails] = useState<Map<string, SkillResponse>>(new Map());

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [evidenceRes, matchesRes] = await Promise.all([
          api.evidence.list({ page_size: 100 }, token),
          api.matches.forLearner({ page_size: 10 }, token),
        ]);

        const evidence = evidenceRes.items;
        const matchItems = matchesRes.items;

        setSkills(evidence);
        setMatches(matchItems);
        setOpportunitiesCount(matchItems.length);

        const totalSkills = new Set(evidence.map((e) => e.skill_id)).size;
        const verifiedSkills = new Set(evidence.filter((e) => e.status === "verified").map((e) => e.skill_id)).size;
        setSkillsCount({ total: totalSkills, verified: verifiedSkills });

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

        if (profile) {
          const fields = [profile.full_name, profile.bio, profile.avatar_url];
          const filled = fields.filter(Boolean).length;
          setProfileCompletion(Math.round((filled / fields.length) * 100));
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, profile]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-sm text-gray-500">Welcome back 👋</p>

        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          Your Career Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Track your skills, assessments, evidence and career opportunities.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Profile Completion</p>
          <h2 className="mt-2 text-3xl font-bold text-indigo-600">
            {loading ? "0%" : `${profileCompletion}%`}
          </h2>
          <div className="mt-4 h-2 rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-indigo-600 transition-all"
              style={{ width: loading ? "0%" : `${profileCompletion}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">My Skills</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {loading ? "0" : skillsCount.total}
          </h2>
          <p className="mt-2 text-sm text-green-600">
            {loading ? "Loading..." : `${skillsCount.verified} verified`}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Assessments</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {loading ? "0" : assessmentsCount.total}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {loading ? "Loading..." : `${assessmentsCount.completed} completed`}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Opportunities</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {loading ? "0" : opportunitiesCount}
          </h2>
          <p className="mt-2 text-sm text-indigo-600">
            {loading ? "Loading..." : `${opportunitiesCount} new matches`}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Your Skills</h2>
            <p className="text-sm text-gray-500">
              Current skill verification status
            </p>
          </div>
          <Link
            href="/dashboard/evidence"
            className="text-sm font-medium text-indigo-600"
          >
            View All
          </Link>
        </div>

        <div className="mt-6 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <p>Loading skills...</p>
            </div>
          ) : skills.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <p>No skills yet</p>
            </div>
          ) : (
            skills.map((evidence) => {
              const skill = skillDetails.get(evidence.skill_id);
              return (
                <div key={evidence.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{skill?.name || evidence.skill_id}</h3>
                    <p className="text-sm text-gray-500">Score: {evidence.score}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      evidence.status === "verified"
                        ? "bg-green-100 text-green-700"
                        : evidence.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {evidence.status}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Recommended Opportunities
            </h2>
            <p className="text-sm text-gray-500">
              Based on your skills and evidence
            </p>
          </div>
          <Link
            href="/dashboard/opportunities"
            className="text-sm font-medium text-indigo-600"
          >
            View All
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {loading ? (
            <div className="col-span-3 flex items-center justify-center py-8 text-gray-500">
              <p>Loading opportunities...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="col-span-3 flex items-center justify-center py-8 text-gray-500">
              <p>No opportunities available</p>
            </div>
          ) : (
            matches.slice(0, 3).map((match) => (
              <div key={match.id} className="rounded-lg border p-5 transition hover:border-indigo-300 hover:shadow-sm">
                <h3 className="font-semibold text-gray-900">Opportunity #{match.opportunity_id}</h3>
                <p className="mt-1 text-sm text-gray-500">Match Score: {match.overall_score}%</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-green-600">{match.overall_score}% Match</span>
                  <Link
                    href={`/dashboard/opportunities/${match.opportunity_id}`}
                    className="text-sm font-medium text-indigo-600"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
