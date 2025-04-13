import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Mail, MessageSquare, Phone, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

// Define the form schema with validation
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }).optional(),
  subject: z.string().min(2, {
    message: "Subject must be at least 2 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface Query {
  id: string;
  subject: string;
  message: string;
  status: 'new' | 'pending' | 'resolved';
  admin_reply?: string;
  replied_at?: string;
  created_at: string;
  updated_at: string;
}

const ContactUs = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const [userQueries, setUserQueries] = useState<Query[]>([]);
  
  // Initialize the form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  useEffect(() => {
    if (user) {
      fetchUserQueries();
    }
  }, [user]);

  const fetchUserQueries = async () => {
    try {
      const { data, error } = await supabase
        .from('queries')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching queries:', error);
        
        // If the table doesn't exist yet, just set empty queries
        if (error.code === '42P01') {
          console.log('Queries table does not exist yet. Setting empty queries array.');
          setUserQueries([]);
          return;
        }
        
        throw error;
      }
      
      setUserQueries(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching queries",
        description: error.message || "Could not load your previous queries.",
        variant: "destructive",
      });
    }
  };

  // Define the form submission handler
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      console.log("Form data:", data);
      console.log("Current user:", user);
      
      // Create query data without user_id if user is not logged in
      const queryData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        status: 'new' as const,
        ...(user?.id ? { user_id: user.id } : {})
      };
      
      console.log("Query data to be inserted:", queryData);
      
      // Try to insert the query
      const { data: insertData, error } = await supabase
        .from('queries')
        .insert([queryData])
        .select();
        
      if (error) {
        console.error("Database error:", error);
        console.error("Error details:", error.message);
        console.error("Error code:", error.code);
        console.error("Error hint:", error.hint);
        
        // If the error is that the table doesn't exist, show a more helpful message
        if (error.message && error.message.includes("relation") && error.message.includes("does not exist")) {
          toast({
            title: "Database setup required",
            description: "The contact form database is not set up yet. Please contact the administrator.",
            variant: "destructive",
          });
        } else if (error.code === '23505') {
          // Duplicate entry error
          toast({
            title: "Duplicate entry",
            description: "You've already submitted a similar query. Please wait for our response.",
            variant: "destructive",
          });
        } else if (error.code === '23503') {
          // Foreign key violation
          toast({
            title: "Invalid user reference",
            description: "There was an issue with your account. Please try logging out and back in.",
            variant: "destructive",
          });
        } else if (error.code === '28P01' || error.code === '28000') {
          // Authentication error
          toast({
            title: "Authentication error",
            description: "There was an issue connecting to the database. Please try again later.",
            variant: "destructive",
          });
        } else {
          // Generic error message
          toast({
            title: "Database error",
            description: "There was an issue saving your message. Please try again later.",
            variant: "destructive",
          });
        }
      } else {
        console.log("Insert successful:", insertData);
        
        // Show success message
        toast({
          title: "Message sent!",
          description: "Thank you for contacting us. We will get back to you soon.",
        });
        
        // Reset the form
        form.reset();
        
        // Refresh queries if user is logged in
        if (user) {
          fetchUserQueries();
        }
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      
      // Check if it's a network error
      if (error.message && error.message.includes("network")) {
        toast({
          title: "Network error",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Something went wrong",
          description: "Your message could not be sent. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: Query['status']) => {
    switch (status) {
      case 'new':
        return <AlertCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Query['status']) => {
    switch (status) {
      case 'new':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <PageLayout>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Contact Us</h1>
        
        <Card className="border shadow-md mb-8">
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="bg-muted flex items-center px-3 rounded-l-md border border-r-0 border-input">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Input 
                            placeholder="Your name" 
                            className="rounded-l-none" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="bg-muted flex items-center px-3 rounded-l-md border border-r-0 border-input">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Input 
                            type="email" 
                            placeholder="your.email@example.com" 
                            className="rounded-l-none" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (optional)</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="bg-muted flex items-center px-3 rounded-l-md border border-r-0 border-input">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Input 
                            type="tel" 
                            placeholder="Your phone number" 
                            className="rounded-l-none" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="What is your message about?" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="bg-muted flex items-center px-3 h-24 rounded-l-md border border-r-0 border-input">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Textarea 
                            placeholder="How can we help you?" 
                            className="rounded-l-none min-h-[6rem]" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {user && userQueries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Previous Queries</CardTitle>
              <CardDescription>
                View your previous messages and our responses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {userQueries.map((query) => (
                  <div key={query.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{query.subject}</h3>
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${getStatusColor(query.status)}`}>
                        {getStatusIcon(query.status)}
                        <span>{query.status.charAt(0).toUpperCase() + query.status.slice(1)}</span>
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Sent on {format(new Date(query.created_at), "PPP")}
                    </p>
                    <p className="text-sm mb-4">{query.message}</p>
                    
                    {query.admin_reply && (
                      <div className="border-t pt-4 bg-muted/30 rounded-lg mt-4 p-4">
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Admin Response
                        </h4>
                        <p className="text-sm">{query.admin_reply}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Replied on {format(new Date(query.replied_at || query.updated_at), "PPP")}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default ContactUs;
