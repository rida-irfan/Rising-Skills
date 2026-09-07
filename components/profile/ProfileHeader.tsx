"use client";

import { useState } from "react";
import { Camera, Pencil } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

function initials(name: string | null): string {
  if (!name) return "RS";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfileHeader() {
  const { profile, token } = useAuth();
  const [editing, setEditing] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-600" />

      <div className="relative px-6 pb-6">
        <div className="-mt-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-4">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-indigo-100 text-3xl font-bold text-indigo-600 shadow">
              {initials(profile?.full_name ?? null)}

              <button className="absolute bottom-0 right-0 rounded-full bg-white p-2 shadow-md hover:bg-slate-50">
                <Camera size={15} />
              </button>
            </div>

            <div className="pb-1">
              <h1 className="text-2xl font-bold text-slate-900">
                {profile?.full_name || "Your Name"}
              </h1>

              <p className="text-sm text-slate-500">
                {profile?.bio || "Add a short bio from your profile info."}
              </p>

              <p className="mt-1 text-xs capitalize text-slate-400">
                {profile?.role || "—"}
                {!token && " • Sign in to load your profile"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Pencil size={16} />
            {editing ? "Cancel Edit" : "Edit Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
