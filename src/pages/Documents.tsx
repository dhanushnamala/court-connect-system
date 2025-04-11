
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp } from "lucide-react";
import DocumentsList from "@/components/documents/DocumentsList";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import DocumentUploadForm from "@/components/documents/DocumentUploadForm";
import { useAuth } from "@/hooks/useAuth";

const Documents = () => {
  const [refreshList, setRefreshList] = useState(false);
  const { user } = useAuth();

  const handleUploadSuccess = () => {
    setRefreshList(prev => !prev);
  };

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
          <Sheet>
            <SheetTrigger asChild>
              <Button className="mt-4 md:mt-0 bg-court-primary hover:bg-court-primary/90">
                <FileUp className="mr-2 h-4 w-4" /> Upload Document
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Upload Document</SheetTitle>
              </SheetHeader>
              {user && (
                <div className="mt-6">
                  <DocumentUploadForm 
                    caseId={user.id} 
                    onSuccess={handleUploadSuccess} 
                  />
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Document Repository</CardTitle>
            <CardDescription>
              Access and manage all your legal documents in one place
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentsList />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Documents;
