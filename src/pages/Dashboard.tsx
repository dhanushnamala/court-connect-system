
import { useAuth } from "@/hooks/useAuth";
import PageLayout from "@/components/layout/PageLayout";
import ClientDashboard from "@/components/dashboards/ClientDashboard";
import LawyerDashboard from "@/components/dashboards/LawyerDashboard";
import JudgeDashboard from "@/components/dashboards/JudgeDashboard";
import AdminDashboard from "@/components/dashboards/AdminDashboard";

const Dashboard = () => {
  const { role } = useAuth();

  // Render different dashboard based on user role
  const renderDashboardByRole = () => {
    switch (role) {
      case 'client':
        return <ClientDashboard />;
      case 'lawyer':
        return <LawyerDashboard />;
      case 'judge':
        return <JudgeDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <AdminDashboard />; // Default to admin dashboard if role is undefined
    }
  };

  return (
    <PageLayout>
      <div className="container py-6">
        {renderDashboardByRole()}
      </div>
    </PageLayout>
  );
};

export default Dashboard;
