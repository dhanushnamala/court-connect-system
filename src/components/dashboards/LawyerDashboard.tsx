import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { getCasesByLawyer, getUpcomingHearings, Hearing } from "@/services/mockData";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
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

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        console.log("Fetching data for lawyer:", user.id);
        
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
        
        // Fetch lawyer requests - fixed query to avoid the join error
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
            updated_at,
            profiles:client_id (id, name, email, role),
            cases (*)
          `)
          .eq('lawyer_id', user.id);
          
        if (requestsError) {
          console.error("Error fetching lawyer requests:", requestsError);
          throw requestsError;
        }
        
        console.log("Lawyer requests data:", requestsData);
        
        if (requestsData) {
          setLawyerRequests(requestsData);
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
    
    fetchData();
  }, [user]);

  const activeCount = cases.filter(c => c.status === 'active').length;
  const pendingCount = cases.filter(c => c.status === 'pending').length;
  const closedCount = cases.filter(c => c.status === 'closed').length;

  const handleRequestResponse = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest || !user) return;
    
    setIsSubmitting(true);
    
    try {
      // Update request status
      const { error: updateError } = await supabase
        .from('lawyer_requests')
        .update({ 
          status,
          updated_at: new Date()
        })
        .eq('id', selectedRequest.id);
        
      if (updateError) throw updateError;
      
      // If approved, update the case to assign this lawyer
      if (status === 'approved' && selectedRequest.case_id) {
        const { error: caseError } = await supabase
          .from('cases')
          .update({ 
            lawyer_id: user.id,
            status: 'active',
            updated_at: new Date()
          })
          .eq('id', selectedRequest.case_id);
          
        if (caseError) throw caseError;
      }
      
      // Update local state
      setLawyerRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, status } 
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
      
      // Refetch cases if approved
      if (status === 'approved') {
        const { data: casesData } = await supabase
          .from('cases')
          .select('*')
          .eq('lawyer_id', user.id);
          
        if (casesData) {
          setCases(casesData);
        }
      }
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to ${status} request`
      });
    } finally {
      setIsSubmitting(false);
    }
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
                        {request.profiles?.name || 'Client'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Case: {request.cases?.title || 'General Consultation'}
                      </p>
                      {request.message && (
                        <p className="mt-2 text-sm border-t pt-2">{request.message}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`mb-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status.toUpperCase()}
                      </span>
                      
                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsResponseDialogOpen(true);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Decline
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            onClick={() => {
                              setSelectedRequest(request);
                              handleRequestResponse('approved');
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Accept
                          </Button>
                        </div>
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
              onClick={() => handleRequestResponse('rejected')}
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
