"use client";

import { useMemo, useState } from "react";
import AssessmentCard from "@/components/assessments/AssessmentCard";
import AssessmentFilters from "@/components/assessments/AssessmentFilters";
import CreateAssessment from "@/components/assessments/CreateAssessment";
import QuestionBank from "@/components/assessments/QuestionBank";
import AssessmentResults from "@/components/assessments/AssessmentResults";
import AssessmentVersions from "@/components/assessments/AssessmentVersions";
import { api, type AssessmentPublic } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";

type Tab = "assessments" | "questions" | "results" | "versions";

export default function AssessmentsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("assessments");
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");

  const fetcher = useMemo(
    () => () =>
      api.assessments.list({
        search: search || undefined,
        page_size: 100,
      }),
    [search],
  );
  const { data, loading, error, refetch } = useFetch(fetcher, [search]);

  const assessments: AssessmentPublic[] = data?.items || [];
  const published = assessments.filter((a) => a.status === "published").length;
  const drafts = assessments.filter((a) => a.status === "draft").length;

  return (
    <div className="min-h-screen bg-[#F8F9FC] px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-[26px] font-semibold text-[#171717]">
            Assessments
          </h1>
          <p className="text-sm text-[#777] mt-1">
            Browse and take skill assessments
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-[#6C4DF6] hover:bg-[#5D3FE4] text-white
          px-5 py-2.5 rounded-lg text-sm font-medium transition"
        >
          + Create Assessment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-7">
        <StatCard
          title="Total Assessments"
          value={String(assessments.length)}
          subtitle="Available"
        />
        <StatCard
          title="Published"
          value={String(published)}
          subtitle="Ready to take"
        />
        <StatCard
          title="Draft"
          value={String(drafts)}
          subtitle="In preparation"
        />
        <StatCard
          title="Difficulty Levels"
          value={String(
            new Set(assessments.map((a) => a.difficulty)).size,
          )}
          subtitle="Beginner → Advanced"
        />
      </div>

      {/* Main Card */}
      <div className="bg-white border border-[#E8E8ED] rounded-xl">
        {/* Tabs */}
        <div className="border-b border-[#EAEAEA] px-5">
          <div className="flex gap-7">
            <TabButton
              active={activeTab === "assessments"}
              onClick={() => setActiveTab("assessments")}
            >
              Assessments
            </TabButton>
            <TabButton
              active={activeTab === "questions"}
              onClick={() => setActiveTab("questions")}
            >
              Question Bank
            </TabButton>
            <TabButton
              active={activeTab === "results"}
              onClick={() => setActiveTab("results")}
            >
              Results
            </TabButton>
            <TabButton
              active={activeTab === "versions"}
              onClick={() => setActiveTab("versions")}
            >
              Versions
            </TabButton>
          </div>
        </div>

        {activeTab === "assessments" && (
          <div className="p-5">
            <AssessmentFilters
              search={search}
              onSearchChange={setSearch}
            />
            {loading ? (
              <LoadingState label="Loading assessments…" />
            ) : error ? (
              <ErrorState message={error} onRetry={refetch} />
            ) : assessments.length === 0 ? (
              <EmptyState
                title="No assessments found"
                description="Try a different search."
              />
            ) : (
              <div className="space-y-4 mt-5">
                {assessments.map((assessment) => (
                  <AssessmentCard
                    key={assessment.id}
                    assessment={assessment}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "questions" && <QuestionBank />}
        {activeTab === "results" && <AssessmentResults />}
        {activeTab === "versions" && <AssessmentVersions />}
      </div>

      {showCreate && <CreateAssessment onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="bg-white border border-[#E8E8ED] rounded-xl p-5">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-[#777]">{title}</p>
          <h2 className="text-2xl font-semibold text-[#181818] mt-2">
            {value}
          </h2>
          <p className="text-xs text-[#999] mt-1">{subtitle}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-[#F1EDFF]
          flex items-center justify-center text-[#6C4DF6]">
          ✦
        </div>
      </div>
    </div>
  );
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`py-4 text-sm font-medium border-b-2 transition ${
        active
          ? "text-[#6C4DF6] border-[#6C4DF6]"
          : "text-[#777] border-transparent hover:text-[#333]"
      }`}
    >
      {children}
    </button>
  );
}
