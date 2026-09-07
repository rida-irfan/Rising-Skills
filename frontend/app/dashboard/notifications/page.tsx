"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  Clock,
  Settings,
  ShieldAlert,
} from "lucide-react";

import NotificationCard, {
  type Notification,
} from "@/components/notifications/NotificationCard";
import NotificationFilters, {
  type NotificationFilter,
} from "@/components/notifications/NotificationFilters";
import NotificationPreferences from "@/components/notifications/NotificationPreferences";
import { api, type NotificationType } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useFetch } from "@/lib/useFetch";
import { LoadingState, ErrorState } from "@/components/ui/states";

const CHALLENGE_TYPES = new Set<NotificationType>([
  "experience_created",
  "experience_completed",
]);
const OPPORTUNITY_TYPES = new Set<NotificationType>(["application_status"]);
const SYSTEM_TYPES = new Set<NotificationType>([
  "evidence_verified",
  "feedback_submitted",
]);

function filterNotifications(
  items: Notification[],
  filter: NotificationFilter,
) {
  switch (filter) {
    case "Unread":
      return items.filter((n) => !n.is_read);
    case "Challenges":
      return items.filter((n) => CHALLENGE_TYPES.has(n.notification_type));
    case "Opportunities":
      return items.filter((n) => OPPORTUNITY_TYPES.has(n.notification_type));
    case "System":
      return items.filter((n) => SYSTEM_TYPES.has(n.notification_type));
    default:
      return items;
  }
}

export default function NotificationsPage() {
  const { token } = useAuth();
  const [showPreferences, setShowPreferences] = useState(false);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("All");

  const fetcher = useMemo(
    () => () =>
      token
        ? api.notifications.list({ page_size: 100 }, token)
        : Promise.resolve({ items: [], total: 0, page: 1, page_size: 100, pages: 0 }),
    [token],
  );
  const { data, loading, error, refetch } = useFetch(fetcher, [token]);

  const notifications: Notification[] = useMemo(
    () =>
      (data?.items || []).map((n) => ({
        id: n.id,
        notification_type: n.notification_type,
        title: n.title,
        message: n.message,
        created_at: n.created_at,
        is_read: n.is_read,
      })),
    [data],
  );

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const filteredNotifications = filterNotifications(notifications, activeFilter);

  async function handleMarkAllRead() {
    if (!token) return;
    try {
      await api.notifications.markAllRead(token);
      refetch();
    } catch {
      /* ignore */
    }
  }

  function handleRead(_id: string) {
    refetch();
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Stay updated with your assessments, challenges, opportunities,
              applications, and skill verification.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPreferences(!showPreferences)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Settings size={17} />
            Preferences
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Notifications</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {notifications.length}
                </p>
              </div>
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Bell size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Unread</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {unreadCount}
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <Clock size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Account</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {token ? "Active" : "Signed out"}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <ShieldAlert size={21} />
              </div>
            </div>
          </div>
        </div>

        {showPreferences && (
          <div className="mb-8">
            <NotificationPreferences />
          </div>
        )}

        {/* Notification List */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <NotificationFilters
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={!token || unreadCount === 0}
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
            >
              <CheckCheck size={17} />
              Mark all as read
            </button>
          </div>

          {loading ? (
            <LoadingState label="Loading notifications…" />
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : filteredNotifications.length > 0 ? (
            <div>
              {filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  token={token}
                  onRead={handleRead}
                />
              ))}
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Bell size={24} />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">
                {activeFilter === "All"
                  ? "No notifications"
                  : `No ${activeFilter.toLowerCase()} notifications`}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {activeFilter === "All"
                  ? "You are all caught up."
                  : "Try selecting a different filter."}
              </p>
            </div>
          )}
        </div>

        {!token && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-xs leading-5 text-amber-700">
              Sign in to load your notifications from the backend.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
