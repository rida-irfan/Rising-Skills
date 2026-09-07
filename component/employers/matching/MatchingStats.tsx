import {
    Users,
    Target,
    UserCheck,
    Star,
  } from "lucide-react";
  
  interface MatchingStatsProps {
    total: number;
    highMatch: number;
    shortlisted: number;
    averageScore: number;
  }
  
  export default function MatchingStats({
    total,
    highMatch,
    shortlisted,
    averageScore,
  }: MatchingStatsProps) {
    const stats = [
      {
        title: "Matched Candidates",
        value: total,
        icon: Users,
      },
      {
        title: "High Match",
        value: highMatch,
        icon: Target,
      },
      {
        title: "Shortlisted",
        value: shortlisted,
        icon: UserCheck,
      },
      {
        title: "Average Match",
        value: `${averageScore}%`,
        icon: Star,
      },
    ];
  
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
  
          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>
  
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    {stat.value}
                  </h3>
                </div>
  
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }