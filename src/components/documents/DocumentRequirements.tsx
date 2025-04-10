
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp } from 'lucide-react';

interface DocumentRequirement {
  id: string;
  case_type: string;
  document_name: string;
  is_mandatory: boolean;
}

const DocumentRequirements = ({ caseType }: { caseType: string }) => {
  const [documents, setDocuments] = useState<DocumentRequirement[]>([]);

  useEffect(() => {
    const fetchDocumentRequirements = async () => {
      const { data, error } = await supabase
        .from('case_document_requirements')
        .select('*')
        .eq('case_type', caseType);

      if (data) setDocuments(data);
    };

    if (caseType) fetchDocumentRequirements();
  }, [caseType]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Required Documents for {caseType} Case</CardTitle>
      </CardHeader>
      <CardContent>
        {documents.map(doc => (
          <div key={doc.id} className="flex items-center justify-between p-2 border-b">
            <div>
              <h4>{doc.document_name}</h4>
              <p className="text-sm text-muted-foreground">
                {doc.is_mandatory ? 'Mandatory' : 'Optional'}
              </p>
            </div>
            <Button variant="outline">
              <FileUp className="mr-2 h-4 w-4" /> Upload
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default DocumentRequirements;
