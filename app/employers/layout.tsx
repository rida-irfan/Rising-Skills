import EmployerSidebar from "../../component/employers/EmployerSidebar";
import EmployerNavbar from "../../component/employers/EmployerNavbar";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <EmployerSidebar />

      <EmployerNavbar />

      <main className="ml-64 min-h-screen pt-20">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}