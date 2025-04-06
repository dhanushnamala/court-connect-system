
import React from "react";
import { format } from "date-fns";
import { Mail } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Mock query data - in a real app this would come from an API or database
const MOCK_QUERIES = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '555-123-4567',
    message: 'I need help with my case filing. The system is not accepting my document uploads.',
    date: new Date(2025, 3, 1),
    status: 'new',
  },
  {
    id: '2',
    name: 'Maria Rodriguez',
    email: 'maria@example.com',
    phone: '555-987-6543',
    message: 'When is my next hearing? I can\'t see it on my calendar.',
    date: new Date(2025, 3, 2),
    status: 'pending',
  },
  {
    id: '3',
    name: 'David Wong',
    email: 'david.wong@example.com',
    phone: '555-456-7890',
    message: 'I need to reschedule my meeting with the judge. Please advise on the procedure.',
    date: new Date(2025, 3, 4),
    status: 'resolved',
  },
];

const Queries = () => {
  const { toast } = useToast();
  
  const handleReply = (email: string) => {
    // In a real app, this would open an email composition interface
    toast({
      title: "Opening email client",
      description: `Preparing to reply to ${email}`
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-red-500 hover:bg-red-600';
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'resolved':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <PageLayout>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">User Queries</h1>
        
        <div className="grid gap-6">
          {MOCK_QUERIES.map((query) => (
            <Card key={query.id} className="shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {query.name}
                    <Badge className={getStatusColor(query.status)} variant="secondary">
                      {query.status.charAt(0).toUpperCase() + query.status.slice(1)}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{query.email}</span>
                    <span>•</span>
                    <span>{query.phone}</span>
                    <span>•</span>
                    <span>{format(query.date, "PPP")}</span>
                  </div>
                </div>
                
                <Button 
                  className="flex items-center gap-2" 
                  onClick={() => handleReply(query.email)}
                >
                  <Mail className="h-4 w-4" />
                  Reply
                </Button>
              </CardHeader>
              
              <CardContent>
                <p className="mt-2">{query.message}</p>
              </CardContent>
            </Card>
          ))}
          
          {MOCK_QUERIES.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">No user queries yet</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Queries;
