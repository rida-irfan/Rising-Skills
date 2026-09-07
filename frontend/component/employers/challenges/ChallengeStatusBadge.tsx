interface Props {
    status: string;
  }
  
  export default function ChallengeStatusBadge({ status }: Props) {
    const styles: Record<string, string> = {
      Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Draft: "bg-amber-50 text-amber-700 border-amber-200",
      Completed: "bg-blue-50 text-blue-700 border-blue-200",
      Closed: "bg-slate-100 text-slate-600 border-slate-200",
    };
  
    return (
      <span
        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
          styles[status] || "bg-slate-100 text-slate-600"
        }`}
      >
        {status}
      </span>
    );
  }