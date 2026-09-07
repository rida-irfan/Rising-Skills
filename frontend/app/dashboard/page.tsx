"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  api,
  type EvidencePublic,
  type MatchPublic,
  type OpportunityPublic,
  type SkillResponse,
} from "@/lib/api";
import Link from "next/link";

export default function DashboardPage() {
  const { token, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [completionNextStep, setCompletionNextStep] = useState<string>("");
  const [skillsCount, setSkillsCount] = useState({ total: 0, verified: 0 });
  const [assessmentsCount, setAssessmentsCount] = useState({ total: 0, completed: 0 });
  const [opportunitiesCount, setOpportunitiesCount] = useState(0);
  const [skills, setSkills] = useState<EvidencePublic[]>([]);
  const [matches, setMatches] = useState<MatchPublic[]>([]);
  const [opportunitiesMap, setOpportunitiesMap] = useState<Map<string, OpportunityPublic>>(new Map());
  const [skillDetails, setSkillDetails] = useState<Map<string, SkillResponse>>(new Map());

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [
          evidenceRes,
          opportunitiesRes,
          educationRes,
          experiencesRes,
          assessmentsRes,
        ] = await Promise.all([
          api.evidence.list({ page_size: 100 }, token).catch(() => ({ items: [], total: 0, page: 1, page_size: 100, pages: 0 })),
          api.opportunities.list({ page: 1, page_size: 10 }, token).catch(() => ({ items: [], total: 0, page: 1, page_size: 10, pages: 0 })),
          api.education.mine({ page: 1, page_size: 10 }, token).catch(() => ({ items: [], total: 0, page: 1, page_size: 10, pages: 0 })),
          api.experiences.mine({ page: 1, page_size: 10 }, token).catch(() => ({ items: [], total: 0, page: 1, page_size: 10, pages: 0 })),
          api.assessments.list({ page_size: 100 }, token).catch(() => ({ items: [], total: 0, page: 1, page_size: 100, pages: 0 })),
        ]);

        const evidence = evidenceRes.items || [];
        const opps = opportunitiesRes.items || [];

        // Build a lookup map of opportunities by ID so we can display title and org name
        const oppMap = new Map<string, OpportunityPublic>();
        for (const opp of opps) {
          oppMap.set(opp.id, opp);
        }
        setOpportunitiesMap(oppMap);

        // Calculate matches
        const matchItems = (
          await Promise.all(
            opps.map((opportunity) =>
              api.matches.calculate(opportunity.id, token).catch(() => null),
            ),
          )
        )
          .filter((match): match is MatchPublic => match !== null)
          .sort((a, b) => b.overall_score - a.overall_score);

        setSkills(evidence);
        setMatches(matchItems);
        setOpportunitiesCount(matchItems.length);

        const totalSkills = new Set(evidence.map((e) => e.skill_id)).size;
        const verifiedSkills = new Set(
          evidence.filter((e) => e.status === "verified").map((e) => e.skill_id),
        ).size;
        setSkillsCount({ total: totalSkills, verified: verifiedSkills });

        // Update assessments count
        const completedAssessments = evidence.filter(
          (e) => (e as any).evidence_type === "assessment" || (e as any).source_type === "assessment" || e.status === "verified",
        ).length;
        setAssessmentsCount({
          total: assessmentsRes.total || assessmentsRes.items?.length || 0,
          completed: completedAssessments,
        });

        // Fetch skill names
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
          }),
        );
        setSkillDetails(skillDetailsMap);

        // Dynamic Profile Completion Calculation based on actual completeness
        let completionScore = 0;
        const nextSteps: string[] = [];

        // 1. Full Name (15%)
        if (profile?.full_name && profile.full_name.trim().length > 0) {
          completionScore += 15;
        } else {
          nextSteps.push("Add full name (+15%)");
        }

        // 2. Bio / Headline (15%)
        if (profile?.bio && profile.bio.trim().length > 0) {
          completionScore += 15;
        } else {
          nextSteps.push("Add bio / summary (+15%)");
        }

        // 3. Avatar / Photo (10%)
        if (profile?.avatar_url && profile.avatar_url.trim().length > 0) {
          completionScore += 10;
        } else {
          nextSteps.push("Upload profile photo (+10%)");
        }

        // 4. Skills (15% for first skill, +15% for multiple or verified skills)
        if (totalSkills > 0) {
          completionScore += 15;
          if (totalSkills >= 2 || verifiedSkills >= 1) {
            completionScore += 15;
          } else {
            nextSteps.push("Add more skills or verify (+15%)");
          }
        } else {
          nextSteps.push("Add your first skill (+15%)");
        }

        // 5. Education (15%)
        const eduItems = educationRes.items || [];
        if (eduItems.length > 0) {
          completionScore += 15;
        } else {
          nextSteps.push("Add education history (+15%)");
        }

        // 6. Experience (15%)
        const expItems = experiencesRes.items || [];
        if (expItems.length > 0) {
          completionScore += 15;
        } else {
          nextSteps.push("Add work experience (+15%)");
        }

        const finalScore = Math.min(100, completionScore);
        setProfileCompletion(finalScore);
        setCompletionNextStep(nextSteps[0] || "Profile complete! 🎉");
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
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Profile Completion</p>
            <Link
              href="/dashboard/profile"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Edit Profile
            </Link>
          </div>
          <h2 className="mt-2 text-3xl font-bold text-indigo-600">
            {loading ? "0%" : `${profileCompletion}%`}
          </h2>
          <div className="mt-4 h-2 rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-indigo-600 transition-all duration-500"
              style={{ width: loading ? "0%" : `${profileCompletion}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500 truncate" title={completionNextStep}>
            {loading
              ? "Calculating..."
              : profileCompletion === 100
                ? "All set! Your profile is 100% complete. 🎉"
                : `Next: ${completionNextStep}`}
          </p>
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
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
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
            <div className="col-span-3 flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center text-gray-500">
              <p className="text-sm font-medium text-gray-700">No recommended opportunities yet</p>
              <p className="mt-1 text-xs text-gray-500">Add more skills and evidence to get matched with career opportunities.</p>
              <Link
                href="/dashboard/opportunities"
                className="mt-3 text-xs font-semibold text-indigo-600 hover:underline"
              >
                Browse All Opportunities →
              </Link>
            </div>
          ) : (
            matches.slice(0, 3).map((match) => {
              const opp = opportunitiesMap.get(match.opportunity_id);
              const title = opp?.title || (match as any).opportunity_title || "Career Opportunity";
              const orgName = opp?.organization_name || "Company";
              const location = opp?.location ? ` • ${opp.location}` : opp?.is_remote ? " • Remote" : "";
              const oppType = opp?.opportunity_type ? opp.opportunity_type.replace("_", " ") : null;

              return (
                <div
                  key={match.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-1 text-base" title={title}>
                        {title}
                      </h3>
                      {oppType && (
                        <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 capitalize">
                          {oppType}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                      {orgName}{location}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {Math.round(match.overall_score)}% Match
                    </span>
                    <Link
                      href={`/dashboard/opportunities/${match.opportunity_id}`}
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
