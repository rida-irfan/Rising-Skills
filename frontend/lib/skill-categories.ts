export const SKILL_CATEGORIES = [
  "Frontend Development",
  "Backend Development",
  "Database",
  "DevOps & Cloud",
  "Mobile Development",
  "Testing & QA",
  "UI/UX Design",
  "Data Science & Analytics",
  "Machine Learning & AI",
  "Cybersecurity",
  "Networking",
  "Project Management",
  "Soft Skills",
  "Programming Languages",
  "Tools & IDEs",
  "Version Control",
  "API Design",
  "Documentation",
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];
