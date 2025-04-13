import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { CaseTimeline } from './CaseTimeline';
import { CaseMessages } from './CaseMessages';

// ... existing code ...

// In the Tabs component, remove the documents tab
<Tabs defaultValue="details" className="w-full">
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="timeline">Timeline</TabsTrigger>
  </TabsList>
  
  {/* ... existing tabs content ... */}
</Tabs>

// ... rest of the existing code ... 