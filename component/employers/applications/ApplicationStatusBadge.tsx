interface Props {
    status: string;
  }
  
  export default function ApplicationStatusBadge({ status }: Props) {
    const styles: Record<string, string> = {
      New: "bg-blue-50 text-blue-700 border-blue-200",
      Shortlisted: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Interview: "bg-violet-50 text-violet-700 border-violet-200",
      Rejected: "bg-red-50 text-red-700 border-red-200",
    };
  
    return (
      <span
        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
          styles[status] || "bg-slate-100 text-slate-600 border-slate-200"
        }`}
      >
        {status}
      </span>
    );
  }