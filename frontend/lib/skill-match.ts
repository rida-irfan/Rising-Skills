export type SkillMatchStatus = "strong" | "weak" | "missing";

export type SkillMatchItem = {
  skill_id: string;
  skill_name: string;
  status: SkillMatchStatus;
  coverage: number;
  has_verified_evidence: boolean;
  has_claimed_skill?: boolean;
};

export function parseSkillDetails(
  breakdown: Record<string, unknown> | null | undefined,
): SkillMatchItem[] {
  const details = breakdown?.skill_details;
  if (!Array.isArray(details)) return [];

  return details.map((raw) => {
    const skill = raw as Record<string, unknown>;
    const coverage = Number(skill.coverage ?? 0);
    const status =
      skill.status === "strong" || skill.status === "weak" || skill.status === "missing"
        ? skill.status
        : coverage >= 80
          ? "strong"
          : coverage > 0
            ? "weak"
            : "missing";

    return {
      skill_id: String(skill.skill_id ?? skill.skill_name ?? ""),
      skill_name: String(skill.skill_name ?? "Unknown skill"),
      status,
      coverage,
      has_verified_evidence: Boolean(skill.has_verified_evidence),
      has_claimed_skill: Boolean(skill.has_claimed_skill),
    };
  });
}

export function learningSearchUrl(skillName: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(`${skillName} free course`)}`;
}
