
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

const CaseCreationForm = () => {
  const [caseType, setCaseType] = useState('');
  const [caseTitle, setCaseTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleCreateCase = async () => {
    if (!user) {
      toast({ 
        variant: 'destructive', 
        title: 'Not Authenticated', 
        description: 'Please log in to create a case' 
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cases')
        .insert({
          title: caseTitle,
          description,
          status: 'pending',
          client_id: user.id,
          case_type: caseType
        })
        .select();

      if (error) throw error;

      toast({
        title: 'Case Created',
        description: 'Your case has been successfully submitted'
      });

      // Reset form
      setCaseType('');
      setCaseTitle('');
      setDescription('');
      setRequiredDocuments([]);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err instanceof Error ? err.message : 'An unknown error occurred'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Case</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={caseType} onValueChange={setCaseType}>
            <SelectTrigger>
              <SelectValue placeholder="Select Case Type" />
            </SelectTrigger>
            <SelectContent>
              {['criminal', 'civil', 'family'].map(type => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input 
            placeholder="Case Title" 
            value={caseTitle}
            onChange={(e) => setCaseTitle(e.target.value)}
          />

          <Input 
            placeholder="Case Description" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Button onClick={handleCreateCase}>Create Case</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaseCreationForm;
