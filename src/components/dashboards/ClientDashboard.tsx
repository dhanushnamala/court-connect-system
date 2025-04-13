import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Calendar, FileText, UserCheck, Plus } from "lucide-react";
import { getCasesByClient, getPersonById } from "@/services/mockData";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

// Interface to match the database structure
interface Case {
  id: string;
  case_number?: string;
  caseNumber?: string;
  title: string;
  description: string;
  status: string;
  lawyer_id?: string;
  lawyerId?: string;
  client_id?: string;
  clientId?: string;
  judge_id?: string;
  judgeId?: string;
  filingDate?: string;
  created_at?: string;
}

interface LawyerProfile {
  id: string;
  name: string;
  email: string;
  specialization?: string;
  years_of_experience?: number;
}

const ClientDashboard = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [lawyers, setLawyers] = useState<{[key: string]: any}>({});
  const [availableLawyers, setAvailableLawyers] = useState<LawyerProfile[]>([]);
  const [isCreateCaseOpen, setIsCreateCaseOpen] = useState(false);
  const [isRequestLawyerOpen, setIsRequestLawyerOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [selectedLawyer, setSelectedLawyer] = useState<string | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [lawyerRequests, setLawyerRequests] = useState<any[]>([]);
  const { toast } = useToast();
  
  const [caseTitle, setCaseTitle] = useState('');
  const [caseDescription, setCaseDescription] = useState('');
  const [caseType, setCaseType] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "cases", label: "My Cases" },
    { id: "requests", label: "Lawyer Requests" },
    { id: "notifications", label: "Notifications" }
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch cases with client profile information
        const { data: casesData, error: casesError } = await supabase
          .from('cases')
          .select(`
            *,
            lawyer:lawyer_id(name, email, specialization),
            judge:judge_id(name, email)
          `)
          .eq('client_id', user.id);
          
        if (casesError) {
          console.error("Error fetching cases:", casesError);
          // Don't show toast for this error, just log it
          setCases([]); // Set empty array instead of showing error
        } else {
          setCases(casesData || []);
        }
        
        // Process lawyers from cases
        const lawyersMap: {[key: string]: any} = {};
        if (casesData && casesData.length > 0) {
          // Get unique lawyer IDs from cases
          const lawyerIds = casesData
            .filter(caseItem => caseItem.lawyer_id)
            .map(caseItem => caseItem.lawyer_id);
          
          if (lawyerIds.length > 0) {
            // Fetch lawyer profiles
            const { data: lawyerProfiles, error: lawyerProfilesError } = await supabase
              .from('profiles')
              .select('*')
              .in('id', lawyerIds);
              
            if (lawyerProfilesError) {
              console.error("Error fetching lawyer profiles:", lawyerProfilesError);
            } else if (lawyerProfiles) {
              // Create a map of lawyer profiles
              lawyerProfiles.forEach(lawyer => {
                lawyersMap[lawyer.id] = lawyer;
              });
            }
          }
        }
        setLawyers(lawyersMap);
        
        // Fetch lawyer requests and available lawyers in parallel
        const [lawyerRequestsResponse, availableLawyersResponse] = await Promise.all([
          supabase
            .from('lawyer_requests')
            .select(`
              *,
              lawyer:lawyer_id(name, email, specialization)
            `)
            .eq('client_id', user.id),
          supabase
            .from('profiles')
            .select('*')
            .eq('role', 'lawyer')
        ]);
        
        if (lawyerRequestsResponse.error) {
          console.error("Error fetching lawyer requests:", lawyerRequestsResponse.error);
          setLawyerRequests([]); // Set empty array instead of showing error
        } else {
          setLawyerRequests(lawyerRequestsResponse.data || []);
        }
        
        if (availableLawyersResponse.error) {
          console.error("Error fetching available lawyers:", availableLawyersResponse.error);
          setAvailableLawyers([]); // Set empty array instead of showing error
        } else {
          setAvailableLawyers(availableLawyersResponse.data || []);
        }
        
      } catch (error: any) {
        console.error("Error in fetchData:", error);
        // Only show toast for unexpected errors
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred. Please try again later."
        });
      }
    };
    
    fetchData();
  }, [user, toast]);

  const handleCreateCase = async () => {
    if (!user) return;
    
    if (!caseTitle.trim() || !caseDescription.trim() || !caseType) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const caseNumber = `CCS-${Date.now().toString().slice(-6)}`;
      
      const { data, error } = await supabase
        .from('cases')
        .insert([{
          title: caseTitle,
          case_number: caseNumber,
          description: caseDescription,
          status: 'pending',
          client_id: user.id,
          created_at: new Date().toISOString()
        }])
        .select('*, profiles!client_id(*)')
        .single();
        
      if (error) throw error;
      
      if (data) {
        setCases(prev => [...prev, data]);
        
        toast({
          title: "Case Created",
          description: "Your case has been successfully created"
        });
        
        setCaseTitle('');
        setCaseDescription('');
        setCaseType('');
        setIsCreateCaseOpen(false);
      }
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create case"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestLawyer = async () => {
    if (!user || !selectedLawyer) return;
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('lawyer_requests')
        .insert([{
          client_id: user.id,
          lawyer_id: selectedLawyer,
          case_id: selectedCase,
          status: 'pending',
          message: requestMessage,
          created_at: new Date().toISOString()
        }]);
        
      if (error) throw error;
      
      toast({
        title: "Request Sent",
        description: "Your request has been sent to the lawyer"
      });
      
      // Refresh lawyer requests
      const { data: requestsData } = await supabase
        .from('lawyer_requests')
        .select('*, profiles!lawyer_id(*)')
        .eq('client_id', user.id);
        
      if (requestsData) {
        setLawyerRequests(requestsData);
        
        // Check if any requests were approved and update lawyers state
        const approvedRequests = requestsData.filter((request: any) => request.status === 'approved');
        if (approvedRequests.length > 0) {
          // Fetch cases
          const { data: casesData } = await supabase
            .from('cases')
            .select('*')
            .eq('client_id', user.id);
            
          if (casesData) {
            // Get unique lawyer IDs from cases
            const lawyerIds = casesData
              .filter(caseItem => caseItem.lawyer_id)
              .map(caseItem => caseItem.lawyer_id);
            
            if (lawyerIds.length > 0) {
              // Fetch lawyer profiles
              const { data: lawyerProfiles, error: lawyerProfilesError } = await supabase
                .from('profiles')
                .select('*')
                .in('id', lawyerIds);
                
              if (lawyerProfilesError) {
                console.error("Error fetching lawyer profiles:", lawyerProfilesError);
              } else if (lawyerProfiles) {
                // Create a map of lawyer profiles
                const lawyersMap: {[key: string]: any} = {};
                lawyerProfiles.forEach(lawyer => {
                  lawyersMap[lawyer.id] = lawyer;
                });
                setLawyers(lawyersMap);
              }
            }
          }
        }
      }
      
      setSelectedLawyer(null);
      setRequestMessage('');
      setIsRequestLawyerOpen(false);
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send request"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Welcome back, {user?.name}</CardTitle>
              <CardDescription>
                Here's a summary of your ongoing cases and upcoming hearings
              </CardDescription>
            </div>
            <Button 
              className="bg-court-primary hover:bg-court-primary/90"
              onClick={() => setIsCreateCaseOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> New Case
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Cases</p>
                <p className="text-xl font-bold">{cases.filter(c => c.status === 'active' || c.status === 'pending').length}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-green-100 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Hearings</p>
                <p className="text-xl font-bold">
                  {cases.filter(c => c.status === 'active' || c.status === 'pending').length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-purple-100 p-2 rounded-full">
                <UserCheck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned Lawyers</p>
                <p className="text-xl font-bold">{Object.keys(lawyers).length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="cases" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted p-1">
          <TabsTrigger value="cases">Cases</TabsTrigger>
          <TabsTrigger value="lawyers">Lawyers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cases">
          <Card>
            <CardHeader>
              <CardTitle>Your Cases</CardTitle>
              <CardDescription>Current status of all your legal cases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cases.length > 0 ? (
                  cases.map((item) => (
                    <div key={item.id} className="flex flex-col md:flex-row justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">Case #{item.caseNumber || item.case_number || 'N/A'}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            item.status === 'active' ? 'bg-green-100 text-green-800' :
                            item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            item.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.status.toUpperCase()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Filed on {item.filingDate || 
                              (item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A')}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 md:mt-0 flex flex-col items-end">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Attorney: </span>
                          <span className="font-medium">
                            {lawyers[item.lawyerId || item.lawyer_id || '']?.name || 'Not assigned'}
                          </span>
                        </div>
                        <div className="mt-2 flex space-x-2">
                          <Link to={`/cases/${item.id}`} className="text-sm text-blue-600 hover:underline">
                            View Details
                          </Link>
                          {!(item.lawyerId || item.lawyer_id) && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setSelectedCase(item.id);
                                setIsRequestLawyerOpen(true);
                              }}
                            >
                              Request Lawyer
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">You don't have any cases yet</p>
                    <Button 
                      className="mt-4 bg-court-primary hover:bg-court-primary/90"
                      onClick={() => setIsCreateCaseOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Create Your First Case
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="lawyers">
          <Card>
            <CardHeader>
              <CardTitle>Your Legal Team</CardTitle>
              <CardDescription>Attorneys assigned to your cases</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.values(lawyers).length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.values(lawyers).map((lawyer: any) => (
                    <div key={lawyer.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        {lawyer.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium">{lawyer.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {lawyer.specialization || 'Attorney at Law'}
                        </p>
                        <div className="mt-1 flex gap-3">
                          <p className="text-xs">{lawyer.email}</p>
                          <p className="text-xs">{lawyer.phone}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No attorneys assigned yet</p>
                  <Button 
                    className="mt-4" 
                    variant="outline"
                    onClick={() => setIsRequestLawyerOpen(true)}
                  >
                    Request a Lawyer
                  </Button>
                </div>
              )}
              
              {lawyerRequests.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-4">Lawyer Requests</h3>
                  <div className="space-y-3">
                    {lawyerRequests.map(request => (
                      <div key={request.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{request.profiles?.name || 'Lawyer'}</p>
                            <p className="text-sm text-muted-foreground">
                              Case: {cases.find(c => c.id === request.case_id)?.title || 'General Consultation'}
                            </p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                        {request.message && (
                          <p className="mt-2 text-sm border-t pt-2">{request.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isCreateCaseOpen} onOpenChange={setIsCreateCaseOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Case</DialogTitle>
            <DialogDescription>
              Provide details about your legal case
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="case-title">Case Title</Label>
              <Input
                id="case-title"
                placeholder="Enter a title for your case"
                value={caseTitle}
                onChange={(e) => setCaseTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="case-type">Case Type</Label>
              <Select value={caseType} onValueChange={setCaseType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select case type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="criminal">Criminal</SelectItem>
                  <SelectItem value="civil">Civil</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="case-description">Description</Label>
              <Textarea
                id="case-description"
                placeholder="Describe your case in detail"
                rows={4}
                value={caseDescription}
                onChange={(e) => setCaseDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateCaseOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleCreateCase}
              disabled={isSubmitting}
              className="bg-court-primary hover:bg-court-primary/90"
            >
              {isSubmitting ? 'Creating...' : 'Create Case'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isRequestLawyerOpen} onOpenChange={setIsRequestLawyerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Lawyer</DialogTitle>
            <DialogDescription>
              Select a lawyer and send a request
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedCase && (
              <div className="space-y-2">
                <Label>Selected Case</Label>
                <p className="text-sm font-medium px-3 py-2 bg-muted rounded-md">
                  {cases.find(c => c.id === selectedCase)?.title || 'General Consultation'}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="lawyer">Select Lawyer</Label>
              <Select value={selectedLawyer || ''} onValueChange={setSelectedLawyer}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a lawyer" />
                </SelectTrigger>
                <SelectContent>
                  {availableLawyers.map(lawyer => (
                    <SelectItem key={lawyer.id} value={lawyer.id}>
                      {lawyer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Explain your case to the lawyer"
                rows={3}
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRequestLawyerOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleRequestLawyer}
              disabled={isSubmitting || !selectedLawyer}
              className="bg-court-primary hover:bg-court-primary/90"
            >
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientDashboard;
