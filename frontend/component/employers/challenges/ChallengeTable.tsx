"use client";

import {
  CalendarDays,
  Users,
  Clock3,
  Trophy,
} from "lucide-react";

import ChallengeStatusBadge from "./ChallengeStatusBadge";
import ChallengeActionMenu from "./ChallengeActionMenu";

export interface Challenge {
  id: string | number;
  title: string;
  category: string;
  difficulty: string;
  participants: number;
  deadline: string;
  duration: string;
  status: string;
}

interface Props {
  challenges: Challenge[];
  onView: (challenge: Challenge) => void;
  onEdit: (challenge: Challenge) => void;
  onDelete: (id: string | number) => void;
}

export default function ChallengeTable({
  challenges,
  onView,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Challenge
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Category
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Difficulty
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Participants
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Deadline
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Status
            </th>

            <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {challenges.map((challenge) => (
            <tr
              key={challenge.id}
              className="transition hover:bg-slate-50"
            >
              {/* Challenge */}
              <td className="px-5 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Trophy className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">
                      {challenge.title}
                    </p>

                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <Clock3 className="h-3.5 w-3.5" />
                      {challenge.duration}
                    </div>
                  </div>
                </div>
              </td>

              {/* Category */}
              <td className="px-5 py-5">
                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                  {challenge.category}
                </span>
              </td>

              {/* Difficulty */}
              <td className="px-5 py-5">
                <span
                  className={`text-sm font-medium ${
                    challenge.difficulty === "Easy"
                      ? "text-emerald-600"
                      : challenge.difficulty === "Medium"
                      ? "text-amber-600"
                      : "text-red-600"
                  }`}
                >
                  {challenge.difficulty}
                </span>
              </td>

              {/* Participants */}
              <td className="px-5 py-5">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="h-4 w-4 text-slate-400" />
                  {challenge.participants}
                </div>
              </td>

              {/* Deadline */}
              <td className="px-5 py-5">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <CalendarDays className="h-4 w-4" />
                  {challenge.deadline}
                </div>
              </td>

              {/* Status */}
              <td className="px-5 py-5">
                <ChallengeStatusBadge
                  status={challenge.status}
                />
              </td>

              {/* Actions */}
              <td className="px-5 py-5">
                <div className="flex justify-end">
                  <ChallengeActionMenu
                    onView={() => onView(challenge)}
                    onEdit={() => onEdit(challenge)}
                    onDelete={() => onDelete(challenge.id)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {challenges.length === 0 && (
        <div className="py-16 text-center">
          <Trophy className="mx-auto h-10 w-10 text-slate-300" />

          <p className="mt-3 font-semibold text-slate-900">
            No challenges found
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Try changing your search or filter.
          </p>
        </div>
      )}
    </div>
  );
}