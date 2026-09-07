"use client";

import {
  Bell,
  CheckCircle2,
  Clock,
  FileCheck,
  GraduationCap,
  Briefcase,
  MessageSquare,
  ShieldCheck,
  X,
} from "lucide-react";
import { api, type NotificationPublic, type NotificationType } from "@/lib/api";

type Notification = {
  id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
};

const icons: Record<string, any> = {
  assessment: GraduationCap,
  challenge: FileCheck,
  submission: CheckCircle2,
  evidence: ShieldCheck,
  evidence_verified: ShieldCheck,
  opportunity: Briefcase,
  application: Briefcase,
  application_status: Briefcase,
  experience_created: FileCheck,
  experience_completed: CheckCircle2,
  feedback: MessageSquare,
  feedback_submitted: MessageSquare,
  deadline: Clock,
};

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

export default function NotificationCard({
  notification,
  token,
  onRead,
}: {
  notification: Notification;
  token?: string | null;
  onRead?: (id: string) => void;
}) {
  const Icon = icons[notification.notification_type] || Bell;

  async function handleMarkRead() {
    if (!token) return;
    try {
      await api.notifications.markRead(notification.id, token);
      onRead?.(notification.id);
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className={`group flex gap-4 border-b border-slate-100 p-5 transition hover:bg-slate-50 ${
        !notification.is_read ? "bg-indigo-50/40" : "bg-white"
      }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                {notification.title}
              </h3>
              {!notification.is_read && (
                <span className="h-2 w-2 rounded-full bg-indigo-600" />
              )}
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {notification.message}
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg p-1 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100"
          >
            <X size={17} />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs text-slate-400">
            {timeAgo(notification.created_at)}
          </span>
          {!notification.is_read && (
            <button
              type="button"
              onClick={handleMarkRead}
              disabled={!token}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
            >
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export type { Notification };
export type { NotificationPublic };
