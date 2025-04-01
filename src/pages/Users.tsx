
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";

const Users = () => {
  return (
    <PageLayout>
      <div className="container py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">
              Manage lawyers, judges and clients in the system
            </p>
          </div>
          <Button className="mt-4 md:mt-0 bg-court-primary hover:bg-court-primary/90">
            <UserPlus className="mr-2 h-4 w-4" /> Add New User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Add, modify, or deactivate system users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 rounded-md p-8 text-center">
              <h3 className="text-lg font-medium mb-2">User Management Section</h3>
              <p className="text-muted-foreground mb-4">
                This area will contain the user management interface with role assignment, 
                account controls, and user profiles.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Users;
