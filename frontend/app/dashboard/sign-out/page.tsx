"use client";

import Link from "next/link";
import {
  LogOut,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export default function SignOutPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <LogOut size={30} />
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Sign out?
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
            Are you sure you want to sign out of your Rising Skills account?
            You can sign in again anytime.
          </p>

          {/* Security message */}
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-left">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-emerald-600"
            />

            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Your account is secure
              </p>

              <p className="mt-1 text-xs leading-5 text-emerald-700">
                Your profile, skills, evidence, challenges, and applications
                will remain saved.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-7 space-y-3">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <LogOut size={18} />
              Sign Out
            </button>

            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft size={18} />
              Cancel
            </Link>
          </div>
        </div>

        {/* Information */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
          <CheckCircle2 size={14} />
          Your data will not be deleted
        </div>
      </div>
    </div>
  );
}