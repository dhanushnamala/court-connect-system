import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Mail, Send } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

interface Query {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'pending' | 'resolved';
  admin_reply?: string;
  replied_at?: string;
  created_at: string;
  updated_at: string;
}

const Queries = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [queries, setQueries] = useState<Query[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    fetchQueries();
  }, []);
  
  const fetchQueries = async () => {
    try {
      const { data, error } = await supabase
        .from('queries')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setQueries(data || []);
    } catch (error) {
      console.error('Error fetching queries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch queries. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleReply = (query: Query) => {
    setSelectedQuery(query);
    setReplyMessage(query.admin_reply || "");
    setIsReplyDialogOpen(true);
  };
  
  const handleSubmitReply = async () => {
    if (!selectedQuery) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('queries')
        .update({
          admin_reply: replyMessage,
          status: 'resolved',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedQuery.id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Reply sent successfully.",
      });
      
      setIsReplyDialogOpen(false);
      fetchQueries();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
        
        <div className="space-y-4">
          {queries.map((query) => (
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
                    <span>{format(new Date(query.created_at), "PPP")}</span>
                  </div>
                </div>
                
                <Button 
                  className="flex items-center gap-2" 
                  onClick={() => handleReply(query)}
                >
                  <Mail className="h-4 w-4" />
                  {query.admin_reply ? "Edit Reply" : "Reply"}
                </Button>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">Subject</h3>
                    <p className="text-sm text-muted-foreground">{query.subject}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1">Message</h3>
                    <p className="text-sm">{query.message}</p>
                  </div>
                  
                  {query.admin_reply && (
                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-1">Admin Reply</h3>
                      <p className="text-sm">{query.admin_reply}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Replied on {format(new Date(query.replied_at || query.updated_at), "PPP")}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {queries.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">No user queries yet</p>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reply to Query</DialogTitle>
            <DialogDescription>
              Write your reply to {selectedQuery?.name}'s query.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Type your reply here..."
              rows={5}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsReplyDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitReply}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Sending..." : "Send Reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default Queries;
