"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function ProfileInfo() {
  const { profile, token, signIn } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    avatar_url: "",
    bio: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        avatar_url: profile.avatar_url || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleSave() {
    if (!token) {
      setSaveError("Sign in to save changes.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      await api.profiles.updateMe(
        {
          full_name: form.full_name || null,
          avatar_url: form.avatar_url || null,
          bio: form.bio || null,
        },
        token,
      );
      setSaved(true);
      setEditing(false);
      // Refresh profile in context.
      if (token) signIn(token);
    } catch (err) {
      setSaveError(
        err instanceof ApiError
          ? `Save failed (${err.status}).`
          : err instanceof Error
            ? err.message
            : "Save failed.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Personal Information
          </h2>
          <p className="text-sm text-slate-500">
            Your basic profile information
          </p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
        >
          <Pencil size={15} />
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>

      {!token && (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Sign in to load and edit your profile from the backend.
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Full Name
          </label>
          {editing ? (
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500"
            />
          ) : (
            <p className="text-sm text-slate-600">
              {profile?.full_name || "Not set"}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Role
          </label>
          <p className="text-sm capitalize text-slate-600">
            {profile?.role || "—"}
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Avatar URL
          </label>
          {editing ? (
            <input
              name="avatar_url"
              value={form.avatar_url}
              onChange={handleChange}
              placeholder="https://…"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500"
            />
          ) : (
            <p className="text-sm text-slate-600">
              {profile?.avatar_url || "Not set"}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            About Me
          </label>
          {editing ? (
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500"
            />
          ) : (
            <p className="text-sm leading-6 text-slate-600">
              {profile?.bio || "Not set"}
            </p>
          )}
        </div>
      </div>

      {editing && (
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setEditing(false)}
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !token}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      )}

      {saveError && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {saveError}
        </p>
      )}
      {saved && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          Profile updated.
        </p>
      )}
    </section>
  );
}
