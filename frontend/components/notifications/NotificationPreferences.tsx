"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";

const preferences = [
  {
    id: "assessment",
    title: "Assessment Updates",
    description: "Get notified when assessments are assigned or completed.",
  },
  {
    id: "challenge",
    title: "Challenge Updates",
    description: "Receive updates about practical challenges and assignments.",
  },
  {
    id: "submission",
    title: "Submission Evaluations",
    description: "Know when your challenge submission has been evaluated.",
  },
  {
    id: "evidence",
    title: "Evidence Verification",
    description: "Get notified when your skill evidence is verified.",
  },
  {
    id: "opportunity",
    title: "Opportunity Recommendations",
    description: "Receive relevant opportunity recommendations.",
  },
  {
    id: "application",
    title: "Application Updates",
    description: "Get updates when your application status changes.",
  },
  {
    id: "feedback",
    title: "Employer Feedback",
    description: "Receive feedback and interactions from employers.",
  },
  {
    id: "deadline",
    title: "Deadline Reminders",
    description: "Receive important reminders about approaching deadlines.",
  },
];

export default function NotificationPreferences() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    assessment: true,
    challenge: true,
    submission: true,
    evidence: true,
    opportunity: false,
    application: true,
    feedback: true,
    deadline: true,
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Bell size={20} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Notification Preferences
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose which notifications you want to receive.
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {preferences.map((preference) => {
          const isEnabled = enabled[preference.id];

          return (
            <div
              key={preference.id}
              className="flex items-center justify-between gap-5 p-5"
            >
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {preference.title}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {preference.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEnabled((prev) => ({
                    ...prev,
                    [preference.id]: !prev[preference.id],
                  }))
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  isEnabled ? "bg-indigo-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                    isEnabled ? "left-6" : "left-1"
                  }`}
                >
                  {isEnabled && (
                    <Check
                      size={11}
                      className="mx-auto mt-[2px] text-indigo-600"
                    />
                  )}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
        <p className="text-xs text-slate-500">
          Critical account and security notifications cannot be disabled.
        </p>
      </div>
    </div>
  );
}