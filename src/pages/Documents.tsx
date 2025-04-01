
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp } from "lucide-react";

const Documents = () => {
  return (
    <PageLayout>
      <div className="container py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
            <p className="text-muted-foreground">
              Manage all case-related legal documents
            </p>
          </div>
          <Button className="mt-4 md:mt-0 bg-court-primary hover:bg-court-primary/90">
            <FileUp className="mr-2 h-4 w-4" /> Upload Document
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Document Repository</CardTitle>
            <CardDescription>
              Access and manage all your legal documents in one place
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 rounded-md p-8 text-center">
              <h3 className="text-lg font-medium mb-2">Documents Section</h3>
              <p className="text-muted-foreground mb-4">
                This area will contain the document management interface with filtering, 
                sorting, and file preview capabilities.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Documents;
