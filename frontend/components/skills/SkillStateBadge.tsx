"use client";

type SkillState =
  | "Self-Reported"
  | "Assessed"
  | "Demonstrated"
  | "Verified";

interface SkillStateBadgeProps {
  state: SkillState;
}

export default function SkillStateBadge({
  state,
}: SkillStateBadgeProps) {
  const styles = {
    "Self-Reported":
      "bg-slate-100 text-slate-700 border-slate-200",

    Assessed:
      "bg-blue-50 text-blue-700 border-blue-200",

    Demonstrated:
      "bg-purple-50 text-purple-700 border-purple-200",

    Verified:
      "bg-green-50 text-green-700 border-green-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${styles[state]}`}
    >
      {state === "Verified" && "✓ "}
      {state}
    </span>
  );
}