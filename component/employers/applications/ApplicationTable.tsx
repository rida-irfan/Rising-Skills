    "use client";

import {
  MapPin,
  CalendarDays,
  Clock3,
  Eye,
} from "lucide-react";

import ApplicationStatusBadge from "./ApplicationStatusBadge";
import ApplicationActionMenu from "./ApplicationActionMenu";

export interface Application {
  id: string | number;
  name: string;
  email: string;
  job: string;
  location: string;
  applied: string;
  experience: string;
  skills: string[];
  status: string;
}

interface Props {
  applications: Application[];
  onView: (application: Application) => void;
  onEdit: (application: Application) => void;
  onDelete: (id: string | number) => void;
}

export default function ApplicationTable({
  applications,
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
              Candidate
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Applied For
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Experience
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Applied
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
          {applications.map((application) => (
            <tr
              key={application.id}
              className="transition hover:bg-slate-50"
            >
              <td className="px-5 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                    {application.name
                      .split(" ")
                      .map((word) => word[0])
                      .join("")}
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">
                      {application.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {application.email}
                    </p>

                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="h-3.5 w-3.5" />
                      {application.location}
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-5 py-5">
                <p className="max-w-[220px] text-sm font-medium text-slate-800">
                  {application.job}
                </p>

                <div className="mt-2 flex flex-wrap gap-1">
                  {application.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </td>

              <td className="px-5 py-5">
                <span className="text-sm text-slate-600">
                  {application.experience}
                </span>
              </td>

              <td className="px-5 py-5">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <CalendarDays className="h-4 w-4" />
                  {application.applied}
                </div>
              </td>

              <td className="px-5 py-5">
                <ApplicationStatusBadge
                  status={application.status}
                />
              </td>

              <td className="px-5 py-5">
                <div className="flex justify-end">
                  <ApplicationActionMenu
                    onView={() => onView(application)}
                    onEdit={() => onEdit(application)}
                    onDelete={() => onDelete(application.id)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {applications.length === 0 && (
        <div className="py-16 text-center">
          <p className="font-semibold text-slate-900">
            No applications found
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Try changing your search or filter.
          </p>
        </div>
      )}
    </div>
  );
}