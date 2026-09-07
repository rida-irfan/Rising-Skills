"use client";

import {
  CheckCircle2,
  CircleAlert,
  ShieldCheck,
} from "lucide-react";

type Skill = {
  name: string;
  requiredLevel: string;
  studentLevel: string;
  state: "Verified" | "Demonstrated" | "Assessed" | "Self-Reported" | "Missing";
};

type SkillMatchProps = {
  skills: Skill[];
};

export default function SkillMatch({ skills }: SkillMatchProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Skill Match
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Your skills compared with the opportunity requirements.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {skills.map((skill) => {
          const isMissing = skill.state === "Missing";

          return (
            <div
              key={skill.name}
              className="rounded-xl border border-slate-100 bg-slate-50 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  {isMissing ? (
                    <CircleAlert
                      size={20}
                      className="mt-0.5 text-amber-500"
                    />
                  ) : (
                    <CheckCircle2
                      size={20}
                      className="mt-0.5 text-emerald-500"
                    />
                  )}

                  <div>
                    <p className="font-semibold text-slate-900">
                      {skill.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Required: {skill.requiredLevel}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs text-slate-400">
                    Your level
                  </p>

                  <p className="text-sm font-semibold text-slate-700">
                    {skill.studentLevel}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                {!isMissing && <ShieldCheck size={15} className="text-indigo-500" />}

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    skill.state === "Verified"
                      ? "bg-emerald-50 text-emerald-700"
                      : skill.state === "Demonstrated"
                      ? "bg-violet-50 text-violet-700"
                      : skill.state === "Assessed"
                      ? "bg-blue-50 text-blue-700"
                      : skill.state === "Self-Reported"
                      ? "bg-slate-100 text-slate-600"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {skill.state}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}