import {
    Users,
    Clock3,
    UserCheck,
    CheckCircle2,
  } from "lucide-react";
  
  interface Props {
    total: number;
    newCount: number;
    shortlisted: number;
    interviews: number;
  }
  
  export default function ApplicationStats({
    total,
    newCount,
    shortlisted,
    interviews,
  }: Props) {
    const stats = [
      {
        title: "Total Applications",
        value: total,
        description: "All applications",
        icon: Users,
      },
      {
        title: "New Applications",
        value: newCount,
        description: "Need review",
        icon: Clock3,
      },
      {
        title: "Shortlisted",
        value: shortlisted,
        description: "Selected candidates",
        icon: UserCheck,
      },
      {
        title: "Interviews",
        value: interviews,
        description: "Interview stage",
        icon: CheckCircle2,
      },
    ];
  
    return (
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
  
          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>
  
                  <h2 className="mt-2 text-3xl font-bold text-slate-900">
                    {stat.value}
                  </h2>
                </div>
  
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
  
              <p className="mt-3 text-xs text-slate-400">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>
    );
  }