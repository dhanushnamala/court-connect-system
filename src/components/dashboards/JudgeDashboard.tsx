
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gavel, Calendar, Scale, Clock, CheckCircle, XCircle } from "lucide-react";
import { getCasesByJudge, getUpcomingHearings, Hearing } from "@/services/mockData";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const JudgeDashboard = () => {
  const { user } = useAuth();
  const [assignedCases, setAssignedCases] = useState<any[]>([]);
  const [pendingCases, setPendingCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upcomingHearings, setUpcomingHearings] = useState<(Hearing & { caseTitle: string })[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        console.log("Fetching data for judge:", user.id);
        
        // Fetch cases already assigned to this judge
        const { data: assignedCasesData, error: assignedCasesError } = await supabase
          .from('cases')
          .select('*')
          .eq('judge_id', user.id);
          
        if (assignedCasesError) {
          console.error("Error fetching assigned cases:", assignedCasesError);
          throw assignedCasesError;
        }
        
        console.log("Assigned cases:", assignedCasesData);
        setAssignedCases(assignedCasesData || []);
        
        // Fetch cases that need a judge (have a lawyer but no judge)
        const { data: pendingCasesData, error: pendingCasesError } = await supabase
          .from('cases')
          .select('*, profiles:client_id(*), lawyer_profiles:lawyer_id(*)')
          .is('judge_id', null)
          .not('lawyer_id', 'is', null);
          
        if (pendingCasesError) {
          console.error("Error fetching pending cases:", pendingCasesError);
          throw pendingCasesError;
        }
        
        console.log("Pending cases needing a judge:", pendingCasesData);
        setPendingCases(pendingCasesData || []);
        
        // Get upcoming hearings
        const allCases = [...(assignedCasesData || [])];
        const hearings = getUpcomingHearings()
          .filter(h => allCases.some(c => c.id === h.caseId))
          .map(h => {
            const relatedCase = allCases.find(c => c.id === h.caseId);
            return {
              ...h,
              caseTitle: relatedCase?.title || 'Unknown Case'
            };
          });
            
        setUpcomingHearings(hearings);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        
        // Fallback to mock data
        const judgeCases = getCasesByJudge(user.id || '1');
        setAssignedCases(judgeCases);
        
        // Get upcoming hearings for mock data
        const hearings = getUpcomingHearings()
          .filter(h => judgeCases.some(c => c.id === h.caseId))
          .map(h => {
            const relatedCase = judgeCases.find(c => c.id === h.caseId);
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

  const handleAssignCase = async () => {
    if (!selectedCase || !user) return;
    
    setIsSubmitting(true);
    
    try {
      // Update case to assign this judge
      const { error: updateError } = await supabase
        .from('cases')
        .update({ 
          judge_id: user.id,
          status: 'active',
          updated_at: new Date()
        })
        .eq('id', selectedCase.id);
        
      if (updateError) throw updateError;
      
      // Update local state
      setAssignedCases(prev => [...prev, {...selectedCase, judge_id: user.id, status: 'active'}]);
      setPendingCases(prev => prev.filter(c => c.id !== selectedCase.id));
      
      // Close dialog and reset state
      setIsAssignDialogOpen(false);
      setSelectedCase(null);
      
      toast({
        title: "Case Assigned",
        description: "You have been successfully assigned to this case"
      });
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Assignment Failed",
        description: error.message || "Failed to assign case"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Count cases by status
  const activeCount = assignedCases.filter(c => c.status === 'active').length;
  const pendingCount = assignedCases.filter(c => c.status === 'pending').length;
  const closedCount = assignedCases.filter(c => c.status === 'closed').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-700">
        <CardContent className="px-6 py-8 text-white">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <Gavel className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Welcome, Judge {user?.name || 'Smith'}</h2>
              <p className="opacity-90">Here's your docket for today</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Cases</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedCases.length}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                {activeCount} Active
              </Badge>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
                {pendingCount} Pending
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Hearings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingHearings.filter(h => new Date(h.date).toDateString() === new Date().toDateString()).length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {upcomingHearings.length} upcoming in next 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cases Awaiting Judge</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCases.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Click below to review and assign
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Cases Awaiting Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>Cases Awaiting Assignment</CardTitle>
          <CardDescription>Cases that need a judge to be assigned</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingCases.length > 0 ? (
            <div className="space-y-4">
              {pendingCases.map((caseItem) => (
                <div key={caseItem.id} className="p-4 border rounded-lg hover:border-primary transition-colors">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{caseItem.title}</h3>
                      <p className="text-sm text-muted-foreground">Case #{caseItem.case_number}</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      AWAITING JUDGE
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm">{caseItem.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="text-xs text-muted-foreground">
                        Client: {caseItem.profiles?.name || 'Unknown Client'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Lawyer: {caseItem.lawyer_profiles?.name || 'Unknown Lawyer'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Filed: {new Date(caseItem.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setSelectedCase(caseItem);
                          setIsAssignDialogOpen(true);
                        }}
                      >
                        <Gavel className="h-4 w-4 mr-1" /> Assign to Me
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No cases awaiting assignment</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Docket</CardTitle>
          <CardDescription>Hearings scheduled for today</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingHearings.filter(h => new Date(h.date).toDateString() === new Date().toDateString()).length > 0 ? (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3">Time</th>
                    <th scope="col" className="px-6 py-3">Case</th>
                    <th scope="col" className="px-6 py-3">Type</th>
                    <th scope="col" className="px-6 py-3">Courtroom</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingHearings
                    .filter(h => new Date(h.date).toDateString() === new Date().toDateString())
                    .map(hearing => (
                      <tr key={hearing.id} className="bg-white border-b">
                        <td className="px-6 py-4 font-medium">{hearing.time}</td>
                        <td className="px-6 py-4">{hearing.caseTitle}</td>
                        <td className="px-6 py-4">{hearing.description}</td>
                        <td className="px-6 py-4">{hearing.courtroom}</td>
                        <td className="px-6 py-4">
                          <Link to={`/cases/${hearing.caseId}`} className="text-blue-600 hover:underline">
                            View Case
                          </Link>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No hearings scheduled for today</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Assigned Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Cases</CardTitle>
          <CardDescription>All cases under your jurisdiction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignedCases.length > 0 ? (
              assignedCases.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg hover:border-primary transition-colors">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">Case #{item.caseNumber || item.case_number}</p>
                    </div>
                    <Badge className={cn(
                      "capitalize",
                      item.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                      item.status === 'closed' ? 'bg-gray-100 text-gray-800 hover:bg-gray-100' :
                      'bg-red-100 text-red-800 hover:bg-red-100'
                    )}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm">{item.description}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <div className="flex gap-2">
                        <span className="text-xs text-muted-foreground">Filed: {new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      <Link to={`/cases/${item.id}`} className="text-sm text-blue-600 hover:underline">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No cases assigned yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Assignment Confirmation Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Case</DialogTitle>
            <DialogDescription>
              Are you sure you want to assign this case to yourself?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedCase && (
              <div className="space-y-2">
                <p><strong>Case:</strong> {selectedCase.title}</p>
                <p><strong>Case Number:</strong> {selectedCase.case_number}</p>
                <p><strong>Description:</strong> {selectedCase.description}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAssignDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssignCase}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Assigning...' : 'Confirm Assignment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JudgeDashboard;
