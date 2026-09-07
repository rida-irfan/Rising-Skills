"use client";

import { useState } from "react";
import {
  User,
  Bell,
  ShieldCheck,
  Lock,
  Eye,
  Briefcase,
  Save,
  Camera,
  Mail,
  Smartphone,
  Trash2,
  LogOut,
  ChevronRight,
  Check,
} from "lucide-react";

type Section = "account" | "notifications" | "privacy" | "security";

export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<Section>("account");

  const [saved, setSaved] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [opportunityAlerts, setOpportunityAlerts] = useState(true);
  const [challengeAlerts, setChallengeAlerts] = useState(true);
  const [applicationAlerts, setApplicationAlerts] = useState(true);

  const [profileVisibility, setProfileVisibility] = useState("employers");
  const [showSkills, setShowSkills] = useState(true);
  const [showEvidence, setShowEvidence] = useState(true);

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const menuItems = [
    {
      id: "account" as Section,
      label: "Account",
      description: "Profile and personal information",
      icon: User,
    },
    {
      id: "notifications" as Section,
      label: "Notifications",
      description: "Manage your alerts",
      icon: Bell,
    },
    {
      id: "privacy" as Section,
      label: "Privacy",
      description: "Control profile visibility",
      icon: Eye,
    },
    {
      id: "security" as Section,
      label: "Security",
      description: "Password and account security",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-indigo-600">
            ACCOUNT
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage your Rising Skills account, notifications, privacy,
            and security preferences.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">

          {/* Sidebar */}
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-3 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Settings
              </p>
            </div>

            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        active
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {item.label}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {item.description}
                      </p>
                    </div>

                    <ChevronRight size={16} />
                  </button>
                );
              })}
            </div>

            {/* Account actions */}
            <div className="mt-4 border-t border-slate-100 pt-4">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-slate-600 transition hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <LogOut size={18} />
                </div>

                <span className="text-sm font-semibold">
                  Sign Out
                </span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="space-y-6">

            {/* ACCOUNT */}
            {activeSection === "account" && (
              <>
                {/* Profile */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 p-6">
                    <h2 className="text-lg font-bold text-slate-900">
                      Account Information
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Manage your basic account and profile information.
                    </p>
                  </div>

                  <div className="p-6">

                    {/* Avatar */}
                    <div className="mb-8 flex items-center gap-5">
                      <div className="relative">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-100 text-2xl font-bold text-indigo-700">
                          NK
                        </div>

                        <button
                          type="button"
                          className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                        >
                          <Camera size={16} />
                        </button>
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-900">
                          Nida Karamat
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Student / Candidate
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Profile photo helps employers recognize you.
                        </p>
                      </div>
                    </div>

                    {/* Fields */}
                    <div className="grid gap-5 md:grid-cols-2">

                      <div>
                        <label className="text-sm font-semibold text-slate-700">
                          Full Name
                        </label>

                        <input
                          type="text"
                          defaultValue="Nida Karamat"
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700">
                          Email Address
                        </label>

                        <div className="relative">
                          <Mail
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            type="email"
                            defaultValue="nida@example.com"
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700">
                          Phone Number
                        </label>

                        <div className="relative">
                          <Smartphone
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            type="text"
                            placeholder="+92 XXX XXXXXXX"
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700">
                          Account Type
                        </label>

                        <select
                          defaultValue="Student"
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500"
                        >
                          <option>Student</option>
                          <option>Professional</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Career preferences */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <Briefcase size={20} />
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          Career Preferences
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Used for opportunity discovery and recommendations.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 p-6 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">
                        Preferred Opportunity
                      </label>

                      <select
                        defaultValue="Internship"
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                      >
                        <option>Internship</option>
                        <option>Apprenticeship</option>
                        <option>Project</option>
                        <option>Freelance / Contract</option>
                        <option>Job</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-700">
                        Work Mode
                      </label>

                      <select
                        defaultValue="Remote"
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                      >
                        <option>Remote</option>
                        <option>Hybrid</option>
                        <option>On-site</option>
                      </select>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* NOTIFICATIONS */}
            {activeSection === "notifications" && (
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Bell size={20} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Notification Preferences
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Choose which notifications you want to receive.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">

                  <SettingToggle
                    title="Email Notifications"
                    description="Receive important updates through email."
                    enabled={emailNotifications}
                    onChange={() =>
                      setEmailNotifications(!emailNotifications)
                    }
                  />

                  <SettingToggle
                    title="Opportunity Recommendations"
                    description="Get notified when relevant opportunities are found."
                    enabled={opportunityAlerts}
                    onChange={() =>
                      setOpportunityAlerts(!opportunityAlerts)
                    }
                  />

                  <SettingToggle
                    title="Challenge Updates"
                    description="Receive challenge assignments and evaluation updates."
                    enabled={challengeAlerts}
                    onChange={() =>
                      setChallengeAlerts(!challengeAlerts)
                    }
                  />

                  <SettingToggle
                    title="Application Updates"
                    description="Get notified when your application status changes."
                    enabled={applicationAlerts}
                    onChange={() =>
                      setApplicationAlerts(!applicationAlerts)
                    }
                  />

                  <div className="flex items-start gap-3 bg-slate-50 p-5">
                    <ShieldCheck
                      size={19}
                      className="mt-0.5 text-emerald-600"
                    />

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Critical notifications cannot be disabled
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Security alerts, password resets, and other
                        critical account notifications will always be sent.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* PRIVACY */}
            {activeSection === "privacy" && (
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Eye size={20} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Privacy & Visibility
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Control what employers and other users can see.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 p-6">

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Profile Visibility
                    </label>

                    <select
                      value={profileVisibility}
                      onChange={(e) =>
                        setProfileVisibility(e.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                    >
                      <option value="everyone">
                        Everyone
                      </option>

                      <option value="employers">
                        Employers only
                      </option>

                      <option value="private">
                        Private
                      </option>
                    </select>

                    <p className="mt-2 text-xs text-slate-400">
                      Employers need profile visibility to discover and
                      match you with opportunities.
                    </p>
                  </div>

                  <SettingToggle
                    title="Show Skills"
                    description="Allow employers to view your current skill states."
                    enabled={showSkills}
                    onChange={() => setShowSkills(!showSkills)}
                  />

                  <SettingToggle
                    title="Show Evidence"
                    description="Allow authorized employers to view your skill evidence."
                    enabled={showEvidence}
                    onChange={() => setShowEvidence(!showEvidence)}
                  />

                  <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                    <div className="flex gap-3">
                      <Lock
                        size={19}
                        className="mt-0.5 text-amber-600"
                      />

                      <div>
                        <p className="text-sm font-semibold text-amber-800">
                          Evidence privacy
                        </p>

                        <p className="mt-1 text-xs leading-5 text-amber-700">
                          Evidence contains information about assessments,
                          challenges, evaluations, and verification.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECURITY */}
            {activeSection === "security" && (
              <>
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <ShieldCheck size={20} />
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          Account Security
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Keep your Rising Skills account secure.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100">

                    <div className="flex items-center justify-between gap-5 p-5">
                      <div className="flex items-start gap-3">
                        <Lock
                          size={19}
                          className="mt-1 text-slate-500"
                        />

                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">
                            Password
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            Last changed recently
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Change Password
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-5 p-5">
                      <div className="flex items-start gap-3">
                        <ShieldCheck
                          size={19}
                          className="mt-1 text-emerald-600"
                        />

                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">
                            Two-Factor Authentication
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            Add an extra layer of protection.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                      >
                        Enable
                      </button>
                    </div>
                  </div>
                </section>

                {/* Danger Zone */}
                <section className="rounded-2xl border border-red-100 bg-white shadow-sm">
                  <div className="border-b border-red-100 p-6">
                    <h2 className="font-bold text-red-700">
                      Danger Zone
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      These actions can affect your account permanently.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Delete Account
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Permanently remove your account and associated data.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={17} />
                      Delete Account
                    </button>
                  </div>
                </section>
              </>
            )}

            {/* Save */}
            {activeSection !== "security" && (
              <div className="flex items-center justify-end gap-3">
                {saved && (
                  <span className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                    <Check size={17} />
                    Changes saved
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Save size={17} />
                  Save Changes
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function SettingToggle({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 p-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled ? "bg-indigo-600" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}