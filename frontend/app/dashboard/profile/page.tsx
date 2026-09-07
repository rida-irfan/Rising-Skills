import ProfileHeader from "../../../components/profile/ProfileHeader";
import ProfileInfo from "../../../components/profile/ProfileInfo";
import EducationSection from "../../../components/profile/EducationSection";
import ExperienceSection from "../../../components/profile/ExperienceSection";
import SkillsSection from "../../../components/profile/SkillsSection";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Profile Header */}
        <ProfileHeader />

        {/* Basic Information */}
        <ProfileInfo />

        {/* Education */}
        <EducationSection />

        {/* Experience */}
        <ExperienceSection />

        {/* Skills */}
        <SkillsSection />

      </div>
    </div>
  );
}