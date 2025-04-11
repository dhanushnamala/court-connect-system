
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, File, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DocumentItem {
  id: string;
  title: string;
  description: string;
  file_path: string;
  file_type: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface DocumentsListProps {
  caseId?: string;
}

const DocumentsList = ({ caseId }: DocumentsListProps) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        let query = supabase
          .from('documents')
          .select('*');
        
        if (caseId) {
          query = query.eq('case_id', caseId);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setDocuments(data || []);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, [user, caseId]);

  const handleDownload = async (document: DocumentItem) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);
      
      if (error) throw error;
      
      // Create download link using the window.document object
      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.title;
      window.document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <File className="h-8 w-8 text-red-500" />;
    } else if (fileType.includes('doc')) {
      return <File className="h-8 w-8 text-blue-500" />;
    } else if (fileType.includes('image')) {
      return <File className="h-8 w-8 text-green-500" />;
    } else {
      return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-muted/30">
          <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No documents found</p>
        </div>
      ) : (
        documents.map((doc) => (
          <Card key={doc.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center p-4">
                <div className="mr-4">
                  {getFileIcon(doc.file_type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{doc.title}</h3>
                  {doc.description && (
                    <p className="text-sm text-muted-foreground">{doc.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(doc.status)}
                    <span className="text-xs text-muted-foreground">
                      Uploaded on {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default DocumentsList;
