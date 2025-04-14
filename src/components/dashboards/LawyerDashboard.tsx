import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { getCasesByLawyer, getUpcomingHearings, Hearing } from "@/services/mockData";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const LawyerDashboard = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [upcomingHearings, setUpcomingHearings] = useState<(Hearing & { caseTitle: string })[]>([]);
  const [lawyerRequests, setLawyerRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "cases", label: "My Cases" },
    { id: "requests", label: "Client Requests" },
    { id: "notifications", label: "Notifications" }
  ];

  // Test function to create a sample lawyer request
  const createTestRequest = async () => {
    if (!user) return;
    
    try {
      // First, get a client ID (assuming there's at least one client in the system)
      const { data: clients, error: clientsError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'client')
        .limit(1);
        
      if (clientsError) {
        console.error("Error fetching clients:", clientsError);
        return;
      }
      
      if (!clients || clients.length === 0) {
        console.error("No clients found in the system");
        return;
      }
      
      const clientId = clients[0].id;
      
      // Create a test case first
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .insert([{
          title: 'Test Case for Lawyer Request',
          case_number: `TEST-${Date.now()}`,
          description: 'This is a test case created for testing lawyer requests',
          status: 'pending',
          client_id: clientId,
          created_at: new Date().toISOString()
        }])
        .select();
        
      if (caseError) {
        console.error("Error creating test case:", caseError);
        return;
      }
      
      console.log("Test case created:", caseData);
      
      // Create a test request
      const { data, error } = await supabase
        .from('lawyer_requests')
        .insert([{
          client_id: clientId,
          lawyer_id: user.id,
          case_id: caseData[0].id,
          status: 'pending',
          message: 'This is a test request for a specific case',
          created_at: new Date().toISOString()
        }]);
        
      if (error) {
        console.error("Error creating test request:", error);
      } else {
        console.log("Test request created successfully:", data);
        toast({
          title: "Test Request Created",
          description: "A test lawyer request has been created"
        });
        
        // Refresh the requests
        fetchData();
      }
    } catch (error) {
      console.error("Error in createTestRequest:", error);
    }
  };

  const fetchData = async () => {
    if (!user) {
      console.log("No user found");
      return;
    }
    
    try {
      console.log("Logged-in user:", user);
      console.log("Logged-in lawyer ID:", user.id);
      
      // Debug: Check if the user has a lawyer profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching lawyer profile:", profileError);
      } else {
        console.log("Lawyer profile:", profileData);
      }
      
      // Fetch lawyer requests with detailed logging
      console.log("Fetching lawyer requests for lawyer ID:", user.id);
      
      // Debug: Check the lawyer_requests table structure
      const { data: tableInfo, error: tableError } = await supabase
        .from('lawyer_requests')
        .select('*')
        .limit(1);
        
      if (tableError) {
        console.error("Error accessing lawyer_requests table:", tableError);
      } else {
        console.log("Lawyer requests table structure:", tableInfo);
      }
      
      // Now fetch requests for this specific lawyer with detailed error logging
      const { data: requestsData, error: requestsError } = await supabase
        .from('lawyer_requests')
        .select(`
          id,
          client_id,
          lawyer_id,
          case_id,
          status,
          message,
          created_at,
          updated_at
        `)
        .eq('lawyer_id', user.id);
        
      if (requestsError) {
        console.error("Error fetching lawyer requests:", requestsError);
        console.error("Error details:", requestsError.message);
        throw requestsError;
      }
      
      console.log("Raw lawyer requests data:", requestsData);
      
      if (requestsData && requestsData.length > 0) {
        console.log("Found", requestsData.length, "lawyer requests");
        
        // Fetch client profiles for these requests
        const clientIds = requestsData.map(req => req.client_id);
        console.log("Fetching profiles for client IDs:", clientIds);
        
        const { data: clientProfiles, error: clientError } = await supabase
          .from('profiles')
          .select('id, name, email, role')
          .in('id', clientIds);
          
        if (clientError) {
          console.error("Error fetching client profiles:", clientError);
          console.error("Error details:", clientError.message);
        } else {
          console.log("Client profiles found:", clientProfiles?.length || 0);
          console.log("Client profiles:", clientProfiles);
        }
        
        // Fetch case details for these requests
        const caseIds = requestsData.filter(req => req.case_id).map(req => req.case_id);
        console.log("Fetching cases for case IDs:", caseIds);
        
        let caseDetails: any[] = [];
        
        if (caseIds.length > 0) {
          const { data: cases, error: caseError } = await supabase
            .from('cases')
            .select('id, title, case_number, status')
            .in('id', caseIds);
            
          if (caseError) {
            console.error("Error fetching case details:", caseError);
            console.error("Error details:", caseError.message);
          } else {
            console.log("Cases found:", cases?.length || 0);
            console.log("Case details:", cases);
            caseDetails = cases || [];
          }
        }
        
        // Combine the data with detailed logging
        const enrichedRequests = requestsData.map(request => {
          const client = clientProfiles?.find(c => c.id === request.client_id);
          const caseDetail = caseDetails.find(c => c.id === request.case_id);
          
          const enrichedRequest = {
            ...request,
            client: client || null,
            case: caseDetail || null
          };
          
          console.log("Enriched request:", enrichedRequest);
          return enrichedRequest;
        });
        
        console.log("Final enriched requests:", enrichedRequests);
        setLawyerRequests(enrichedRequests);
      } else {
        console.log("No lawyer requests found for lawyer ID:", user.id);
        setLawyerRequests([]);
      }
      
      // Fetch cases from Supabase
      const { data: casesData, error: casesError } = await supabase
        .from('cases')
        .select('*')
        .eq('lawyer_id', user.id);
        
      if (casesError) {
        console.error("Error fetching cases:", casesError);
        throw casesError;
      }
      
      if (casesData && casesData.length > 0) {
        console.log("Cases data from database:", casesData);
        setCases(casesData);
      } else {
        // Fallback to mock data
        console.log("No cases found in database, using mock data");
        const lawyerCases = getCasesByLawyer(user.id || '1');
        setCases(lawyerCases);
      }
      
      // Also fetch cases from approved lawyer requests
      console.log("Fetching approved lawyer requests for lawyer:", user.id);
      const { data: approvedRequests, error: approvedRequestsError } = await supabase
        .from('lawyer_requests')
        .select('case_id, id, status')
        .eq('lawyer_id', user.id)
        .eq('status', 'approved');
        
      if (approvedRequestsError) {
        console.error("Error fetching approved lawyer requests:", approvedRequestsError);
      } else if (approvedRequests && approvedRequests.length > 0) {
        console.log("Found approved requests:", approvedRequests);
        
        // Get the case IDs from approved requests and filter out null values
        const caseIds = approvedRequests
          .map(req => req.case_id)
          .filter(id => id !== null);
        
        console.log("Valid case IDs to fetch:", caseIds);
        
        // Only fetch cases if there are valid case IDs
        if (caseIds.length > 0) {
          // Fetch the cases for these approved requests
          const { data: requestCases, error: requestCasesError } = await supabase
            .from('cases')
            .select('*')
            .in('id', caseIds);
            
          if (requestCasesError) {
            console.error("Error fetching cases from approved requests:", requestCasesError);
          } else if (requestCases && requestCases.length > 0) {
            console.log("Found cases from approved requests:", requestCases);
            
            // Combine directly assigned cases with cases from approved requests
            const casesMap = new Map();
            
            // Add directly assigned cases to the map
            casesData?.forEach(caseItem => {
              casesMap.set(caseItem.id, caseItem);
            });
            
            // Add cases from approved requests to the map (will not overwrite existing entries)
            requestCases.forEach(caseItem => {
              if (!casesMap.has(caseItem.id)) {
                casesMap.set(caseItem.id, caseItem);
              }
            });
            
            // Convert map back to array
            const combinedCases = Array.from(casesMap.values());
            console.log("Combined cases for lawyer:", combinedCases);
            setCases(combinedCases);
          }
        }
      }
      
      // Get upcoming hearings
      const hearings = getUpcomingHearings()
        .filter(h => casesData?.some(c => c.id === h.caseId) || [])
        .map(h => {
          const relatedCase = casesData?.find(c => c.id === h.caseId) || 
                            cases.find(c => c.id === h.caseId);
          return {
            ...h,
            caseTitle: relatedCase?.title || 'Unknown Case'
          };
        });
          
      setUpcomingHearings(hearings);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      
      // Fallback to mock data
      const lawyerCases = getCasesByLawyer(user.id || '1');
      setCases(lawyerCases);
      
      // Get upcoming hearings for mock data
      const hearings = getUpcomingHearings()
        .filter(h => lawyerCases.some(c => c.id === h.caseId))
        .map(h => {
          const relatedCase = lawyerCases.find(c => c.id === h.caseId);
          return {
            ...h,
            caseTitle: relatedCase?.title || 'Unknown Case'
          };
        });
          
      setUpcomingHearings(hearings);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const activeCount = cases.filter(c => c.status === 'active').length;
  const pendingCount = cases.filter(c => c.status === 'pending').length;
  const closedCount = cases.filter(c => c.status === 'closed').length;

  const handleRequestResponse = async (request: any, status: 'approved' | 'rejected') => {
    if (!request || !user) return;
    
    setIsSubmitting(true);
    console.log("Starting request response process:", { requestId: request.id, status });
    
    try {
      // Update request status with proper timestamp
      console.log("Updating request status in database");
      const timestamp = new Date().toISOString();
      const { error: updateError } = await supabase
        .from('lawyer_requests')
        .update({ 
          status,
          updated_at: timestamp
        })
        .eq('id', request.id);
        
      if (updateError) {
        console.error("Error updating request status:", updateError);
        throw updateError;
      }
      console.log("Request status updated successfully");
      
      // If approved, update the case to assign this lawyer
      if (status === 'approved' && request.case_id) {
        console.log("Approving case:", request.case_id);
        
        // Get lawyer profile information
        const { data: lawyerProfile, error: profileError } = await supabase
          .from('profiles')
          .select('name, email, specialization')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching lawyer profile:", profileError);
        }
        
        // Update the case with lawyer information
        console.log("Updating case with lawyer information");
        const { data: updatedCase, error: caseError } = await supabase
          .from('cases')
          .update({ 
            lawyer_id: user.id,
            status: 'active',
            updated_at: timestamp
          })
          .eq('id', request.case_id)
          .select()
          .single();
          
        if (caseError) {
          console.error("Error updating case:", caseError);
          throw caseError;
        }
        console.log("Case updated successfully:", updatedCase);
        
        // Create a notification for the client
        console.log("Creating notification for client");
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([{
            user_id: request.client_id,
            title: 'Lawyer Request Approved',
            message: `Your request for legal representation has been approved by ${lawyerProfile?.name || 'the lawyer'}.`,
            type: 'request_approved',
            read: false,
            created_at: timestamp
          }]);
          
        if (notificationError) {
          console.error("Error creating notification:", notificationError);
        } else {
          console.log("Notification created successfully");
        }

        // Update the local cases state to include the newly approved case
        if (updatedCase) {
          setCases(prevCases => {
            const caseExists = prevCases.some(c => c.id === updatedCase.id);
            if (!caseExists) {
              return [...prevCases, updatedCase];
            }
            return prevCases.map(c => c.id === updatedCase.id ? updatedCase : c);
          });
        }
      }
      
      // Update local state for lawyer requests with proper status
      setLawyerRequests(prev => 
        prev.map(req => 
          req.id === request.id 
            ? { 
                ...req, 
                status,
                updated_at: timestamp,
                case: req.case && status === 'approved' 
                  ? { ...req.case, status: 'active', lawyer_id: user.id }
                  : req.case
              } 
            : req
        )
      );
      
      // Close dialog and reset state
      setIsResponseDialogOpen(false);
      setSelectedRequest(null);
      setResponseMessage("");
      
      toast({
        title: `Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `You have ${status === 'approved' ? 'accepted' : 'declined'} the client's request`
      });
      
      // Verify the updates
      const verifyUpdates = async () => {
        // Verify request status
        const { data: verifyRequest } = await supabase
          .from('lawyer_requests')
          .select('*')
          .eq('id', request.id)
          .single();
          
        console.log("Verified request status:", verifyRequest);

        // Verify case assignment if approved
        if (status === 'approved' && request.case_id) {
          const { data: verifyCase } = await supabase
            .from('cases')
            .select('*')
            .eq('id', request.case_id)
            .single();
            
          console.log("Verified case assignment:", verifyCase);
        }
      };

      await verifyUpdates();
      
      // Refresh the complete data to ensure everything is in sync
      await fetchData();
      
    } catch (error: any) {
      console.error("Error in handleRequestResponse:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to ${status} request`
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cases.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all practice areas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
              {activeCount}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">
              {pendingCount} pending, {closedCount} closed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(cases.map(c => c.clientId || c.client_id)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently representing
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Hearings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingHearings.length}</div>
            <p className="text-xs text-muted-foreground">
              In the next 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Requests</CardTitle>
          <CardDescription>Clients seeking your legal representation</CardDescription>
        </CardHeader>
        <CardContent>
          {lawyerRequests.length > 0 ? (
            <div className="space-y-4">
              {lawyerRequests.map((request) => (
                <div key={request.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {request.client?.name || "Client"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Case: {request.case?.title || "General Consultation"}
                      </p>
                      {request.message && (
                        <p className="mt-2 text-sm border-t pt-2">{request.message}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span
                        className={`mb-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          request.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : request.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {request.status.toUpperCase()}
                      </span>
                      {request.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRequestResponse(request, "approved")}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRequestResponse(request, "rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {request.case_id && (
                        <Link 
                          to={`/cases/${request.case_id}`} 
                          className="mt-2 text-sm text-blue-600 hover:underline"
                        >
                          View Case Details
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No client requests at this time</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Hearings</CardTitle>
          <CardDescription>Your scheduled court appearances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingHearings.length > 0 ? (
              upcomingHearings.map((hearing) => (
                <div key={hearing.id} className="flex items-start">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{hearing.caseTitle}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-xs text-muted-foreground">
                      <span>{hearing.date} at {hearing.time}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Courtroom: {hearing.courtroom}</span>
                    </div>
                    <p className="text-xs">{hearing.description}</p>
                  </div>
                  <div>
                    <Link to={`/cases/${hearing.caseId}`} className="text-sm text-blue-600 hover:underline">
                      View Case
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No upcoming hearings</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Case Load</CardTitle>
          <CardDescription>All cases you're currently handling</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cases.length > 0 ? (
              cases.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg hover:border-primary transition-colors">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">Case #{item.caseNumber || item.case_number}</p>
                    </div>
                    <Badge className={
                      item.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                      item.status === 'closed' ? 'bg-gray-100 text-gray-800 hover:bg-gray-100' :
                      'bg-red-100 text-red-800 hover:bg-red-100'
                    }>
                      {item.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm">{item.description}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Filed: {item.filingDate || new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <Link to={`/cases/${item.id}`} className="text-sm text-blue-600 hover:underline">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No assigned cases yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this client's request?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Provide a reason for rejecting (optional)"
              rows={3}
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsResponseDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => handleRequestResponse(selectedRequest, 'rejected')}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Rejecting...' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LawyerDashboard;