
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface DocumentRequirement {
  id: string;
  case_type: string;
  document_name: string;
  is_mandatory: boolean;
}

const DocumentRequirements = ({ caseType }: { caseType: string }) => {
  const [documents, setDocuments] = useState<DocumentRequirement[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentRequirement | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDocumentRequirements = async () => {
      const { data, error } = await supabase
        .from('case_document_requirements')
        .select('*')
        .eq('case_type', caseType);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching document requirements",
          description: error.message
        });
        return;
      }

      if (data) setDocuments(data);
    };

    if (caseType) fetchDocumentRequirements();
  }, [caseType, toast]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, document: DocumentRequirement) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `documents/${fileName}`;
    
    setUploadingId(document.id);
    
    try {
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // After successful upload, you can save the reference in your database
      toast({
        title: "Document uploaded",
        description: `Successfully uploaded ${document.document_name}`
      });
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message
      });
    } finally {
      setUploadingId(null);
      setSelectedDocument(null);
    }
  };

  const handleUploadClick = (doc: DocumentRequirement) => {
    setSelectedDocument(doc);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Required Documents for {caseType} Case</CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length > 0 ? (
          documents.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-2 border-b">
              <div>
                <h4>{doc.document_name}</h4>
                <p className="text-sm text-muted-foreground">
                  {doc.is_mandatory ? 'Mandatory' : 'Optional'}
                </p>
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    onClick={() => handleUploadClick(doc)}
                    disabled={uploadingId === doc.id}
                  >
                    <FileUp className="mr-2 h-4 w-4" /> 
                    {uploadingId === doc.id ? 'Uploading...' : 'Upload'}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Upload {doc.document_name}</SheetTitle>
                    <SheetDescription>
                      {doc.is_mandatory 
                        ? 'This document is required for your case.' 
                        : 'This document is optional but may help your case.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <div className="grid w-full items-center gap-4">
                      <div className="flex flex-col space-y-2">
                        <input
                          type="file"
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold
                          file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                          onChange={(e) => handleFileChange(e, doc)}
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                          Supported formats: PDF, JPG, PNG
                        </p>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <p>No document requirements found for {caseType} case.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentRequirements;
