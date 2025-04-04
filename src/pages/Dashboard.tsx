
import { useAuth } from "@/hooks/useAuth";
import PageLayout from "@/components/layout/PageLayout";
import ClientDashboard from "@/components/dashboards/ClientDashboard";
import LawyerDashboard from "@/components/dashboards/LawyerDashboard";
import JudgeDashboard from "@/components/dashboards/JudgeDashboard";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

const Dashboard = () => {
  const { role, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      toast({
        title: `Welcome, ${user.name}`,
        description: `You are logged in as a ${role}`,
      });
    }
  }, [user, role, toast]);

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
        // If no recognized role, show a message instead of defaulting to admin dashboard
        return (
          <div className="flex h-[50vh] items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Access Restricted</h2>
              <p className="text-muted-foreground">You don't have permission to view this dashboard.</p>
            </div>
          </div>
        );
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
