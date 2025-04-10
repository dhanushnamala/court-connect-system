
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { FileText } from "lucide-react";

interface DocumentUploadFormProps {
  caseId: string;
  onSuccess?: () => void;
}

const DocumentUploadForm = ({ caseId, onSuccess }: DocumentUploadFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to upload documents"
      });
      return;
    }
    
    if (!title.trim() || !file) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields and select a file"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // 1. Upload file to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${caseId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // 2. Create document record in database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          case_id: caseId,
          title,
          description,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: user.id,
          status: 'pending'
        });
      
      if (dbError) throw dbError;
      
      toast({
        title: "Document Uploaded",
        description: "Your document has been successfully uploaded and is pending review"
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setFile(null);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to upload document"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Document Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter document title"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter document description"
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="file">Document File</Label>
        <Input
          id="file"
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          required
        />
        <p className="text-xs text-muted-foreground">
          Accepted formats: PDF, Word, JPG, PNG
        </p>
      </div>
      
      <Button 
        type="submit" 
        disabled={isUploading}
        className="w-full"
      >
        {isUploading ? 'Uploading...' : 'Upload Document'}
      </Button>
    </form>
  );
};

export default DocumentUploadForm;
