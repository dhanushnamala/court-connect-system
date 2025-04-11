
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp } from "lucide-react";
import DocumentsList from "@/components/documents/DocumentsList";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import DocumentUploadForm from "@/components/documents/DocumentUploadForm";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

const Documents = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const { user } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  useEffect(() => {
    const fetchCases = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('cases')
          .select('id, title, case_number')
          .eq('client_id', user.id);
          
        if (error) throw error;
        
        if (data) {
          setCases(data);
          if (data.length > 0 && !selectedCase) {
            setSelectedCase(data[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching cases:", error);
      }
    };
    
    fetchCases();
  }, [user, selectedCase]);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => !prev);
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
                <SheetDescription>
                  Upload a document for one of your cases
                </SheetDescription>
              </SheetHeader>
              {user && (
                <div className="mt-6">
                  <DocumentUploadForm 
                    caseId={selectedCase || user.id} 
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
            <DocumentsList key={refreshTrigger ? 'refresh' : 'initial'} />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Documents;
