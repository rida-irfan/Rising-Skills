import {
    Trophy,
    PlayCircle,
    Users,
    CheckCircle2,
  } from "lucide-react";
  
  interface Props {
    total: number;
    active: number;
    participants: number;
    completed: number;
  }
  
  export default function ChallengeStats({
    total,
    active,
    participants,
    completed,
  }: Props) {
    const stats = [
      {
        title: "Total Challenges",
        value: total,
        description: "All challenges",
        icon: Trophy,
      },
      {
        title: "Active Challenges",
        value: active,
        description: "Currently available",
        icon: PlayCircle,
      },
      {
        title: "Participants",
        value: participants,
        description: "Total participants",
        icon: Users,
      },
      {
        title: "Completed",
        value: completed,
        description: "Successfully completed",
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