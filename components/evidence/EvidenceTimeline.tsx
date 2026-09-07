"use client";

import {
  Award,
  BookOpenCheck,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

const history = [
  {
    state: "Self-Reported",
    date: "August 10, 2026",
    description: "Student added JavaScript as a self-reported skill.",
    icon: CheckCircle2,
  },
  {
    state: "Assessed",
    date: "August 18, 2026",
    description:
      "Student passed the JavaScript Fundamentals assessment with a score of 82%.",
    icon: BookOpenCheck,
  },
  {
    state: "Demonstrated",
    date: "August 25, 2026",
    description:
      "Student successfully completed a practical JavaScript challenge.",
    icon: Award,
  },
  {
    state: "Verified",
    date: "August 30, 2026",
    description:
      "Skill was verified by an authorized evaluator.",
    icon: ShieldCheck,
  },
];

export default function EvidenceTimeline() {
  return (
    <div className="space-y-0">
      {history.map((item, index) => {
        const Icon = item.icon;

        return (
          <div key={item.state} className="relative flex gap-4">
            {index !== history.length - 1 && (
              <div className="absolute left-5 top-11 h-full w-px bg-slate-200" />
            )}

            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <Icon size={19} />
            </div>

            <div className="pb-8">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-semibold text-slate-900">
                  {item.state}
                </h3>

                <span className="text-xs text-slate-400">
                  {item.date}
                </span>
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}