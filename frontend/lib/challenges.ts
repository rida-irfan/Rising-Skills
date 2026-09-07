export type Challenge = {
  id: string;
  title: string;
  description: string;
  skills: string[];
  difficulty: string;
  deadline: string;
  submissionType: string;
  points: number;
  status: string;
  estimatedTime: string;
  fullDescription: string[];
  requirements: string[];
  evaluationCriteria: { criteria: string; weight: string }[];
};

export const challenges: Challenge[] = [
  {
    id: "react-dashboard",
    title: "React Frontend Dashboard",
    description:
      "Build a responsive dashboard application using React with reusable components and clean UI architecture.",
    skills: ["React", "JavaScript", "CSS"],
    difficulty: "Intermediate",
    deadline: "Sep 5, 2026",
    submissionType: "Repository Link",
    points: 100,
    status: "Open",
    estimatedTime: "4–6 Hours",
    fullDescription: [
      "Build a complete responsive dashboard interface using React.js. The dashboard should contain a sidebar, navigation, statistics cards, and responsive content sections.",
      "Your implementation should demonstrate clean component structure, reusable components, responsive design, and proper React practices.",
    ],
    requirements: [
      "React.js application",
      "Responsive design for desktop and mobile",
      "Reusable React components",
      "Tailwind CSS styling",
      "Working navigation",
      "Clean and organized code",
    ],
    evaluationCriteria: [
      { criteria: "Functionality", weight: "30%" },
      { criteria: "Code Quality", weight: "25%" },
      { criteria: "UI / UX", weight: "25%" },
      { criteria: "Responsive Design", weight: "20%" },
    ],
  },
  {
    id: "javascript-api",
    title: "JavaScript API Integration",
    description:
      "Create a frontend application that consumes a REST API and displays dynamic data with proper loading and error states.",
    skills: ["JavaScript", "REST API", "HTML"],
    difficulty: "Intermediate",
    deadline: "Sep 8, 2026",
    submissionType: "Repository Link",
    points: 100,
    status: "Open",
    estimatedTime: "3–5 Hours",
    fullDescription: [
      "Create a frontend application that fetches data from a public REST API and renders it in a clean, user-friendly interface.",
      "Include loading indicators, error handling, and responsive layout for different screen sizes.",
    ],
    requirements: [
      "Fetch and display API data",
      "Loading and error states",
      "Responsive layout",
      "Clean JavaScript structure",
      "Readable UI presentation",
    ],
    evaluationCriteria: [
      { criteria: "API Integration", weight: "35%" },
      { criteria: "Error Handling", weight: "25%" },
      { criteria: "UI / UX", weight: "20%" },
      { criteria: "Code Quality", weight: "20%" },
    ],
  },
  {
    id: "portfolio-design",
    title: "Developer Portfolio",
    description:
      "Design and develop a professional developer portfolio with responsive sections and modern user experience.",
    skills: ["HTML", "CSS", "UI Design"],
    difficulty: "Beginner",
    deadline: "Sep 12, 2026",
    submissionType: "File / Repository",
    points: 80,
    status: "Open",
    estimatedTime: "2–4 Hours",
    fullDescription: [
      "Design and build a personal developer portfolio that showcases your skills, projects, and contact information.",
      "Focus on clear visual hierarchy, responsive sections, and a polished first impression for recruiters.",
    ],
    requirements: [
      "Hero and about sections",
      "Projects showcase",
      "Skills section",
      "Contact section",
      "Mobile-friendly design",
    ],
    evaluationCriteria: [
      { criteria: "Visual Design", weight: "30%" },
      { criteria: "Content Structure", weight: "25%" },
      { criteria: "Responsive Design", weight: "25%" },
      { criteria: "Code Quality", weight: "20%" },
    ],
  },
];

export function getChallengeById(id: string) {
  return challenges.find((challenge) => challenge.id === id);
}
