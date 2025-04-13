import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, 
  Calendar, 
  FileText, 
  Gavel, 
  Users,
  Clock,
  UserPlus 
} from "lucide-react";
import { 
  getCaseStats, 
  getUpcomingHearings, 
  getLawyers,
  getJudges,
  getClients,
  Hearing, 
  getCaseById,
  getPersonById
} from "@/services/mockData";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import AdminCreation from '@/pages/AdminCreation';

const caseTypeData = [
  { name: 'Criminal', value: 2 },
  { name: 'Civil', value: 2 },
  { name: 'Family', value: 1 },
  { name: 'Corporate', value: 1 },
];

const caseStatusData = [
  { name: 'Active', value: 2 },
  { name: 'Pending', value: 2 },
  { name: 'Closed', value: 1 },
  { name: 'Appealed', value: 1 },
];

const COLORS = ['#3182CE', '#E53E3E', '#38A169', '#D69E2E'];

interface LawyerUser {
  id: string;
  name: string;
  email: string;
  specialization?: string;
  years_of_experience?: number;
}

interface JudgeUser {
  id: string;
  name: string;
  email: string;
  court_specialty?: string;
  years_of_experience?: number;
}

interface ClientUser {
  id: string;
  name: string;
  email: string;
  contact_number?: string;
  address?: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    pendingCases: 0,
    closedCases: 0,
    appealedCases: 0,
    casesByType: {
      civil: 0,
      criminal: 0,
      family: 0,
      corporate: 0
    },
    upcomingHearings: 0
  });
  
  const [upcomingHearings, setUpcomingHearings] = useState<(Hearing & { caseTitle: string; judgeName: string })[]>([]);
  const [personnel, setPersonnel] = useState<{
    lawyers: LawyerUser[];
    judges: JudgeUser[];
    clients: ClientUser[];
  }>({
    lawyers: [],
    judges: [],
    clients: []
  });
  const [cases, setCases] = useState<any[]>([]);
  const [lawyerRequests, setLawyerRequests] = useState<any[]>([]);
  const [isShowingUserCreation, setIsShowingUserCreation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: lawyers, error: lawyersError } = await supabase
          .from('lawyer_users')
          .select('*');
          
        const { data: judges, error: judgesError } = await supabase
          .from('judge_users')
          .select('*');
          
        const { data: clients, error: clientsError } = await supabase
          .from('client_users')
          .select('*');
        
        const { data: admins, error: adminsError } = await supabase
          .from('admin_users')
          .select('*');
        
        const [casesData, requestsData, documentsData] = await Promise.all([
          supabase.from('cases').select('*'),
          supabase.from('lawyer_requests').select('*, profiles:client_id(*), lawyer:lawyer_id(*), cases(*)'),
          supabase.from('documents').select('*')
        ]);
        
        setPersonnel({
          lawyers: lawyers && !lawyersError ? lawyers : getLawyers() as unknown as LawyerUser[],
          judges: judges && !judgesError ? judges : getJudges() as unknown as JudgeUser[],
          clients: clients && !clientsError ? clients : getClients() as unknown as ClientUser[]
        });
        
        if (casesData.data) {
          setCases(casesData.data);
          
          const activeCases = casesData.data.filter(c => c.status === 'active').length;
          const pendingCases = casesData.data.filter(c => c.status === 'pending').length;
          const closedCases = casesData.data.filter(c => c.status === 'closed').length;
          const appealedCases = casesData.data.filter(c => c.status === 'appealed').length;
          
          const casesByType = {
            civil: casesData.data.filter(c => c.type === 'civil').length || 0,
            criminal: casesData.data.filter(c => c.type === 'criminal').length || 0,
            family: casesData.data.filter(c => c.type === 'family').length || 0,
            corporate: casesData.data.filter(c => c.type === 'corporate').length || 0
          };
          
          setStats({
            totalCases: casesData.data.length,
            activeCases,
            pendingCases,
            closedCases,
            appealedCases,
            casesByType,
            upcomingHearings: 0
          });
        }
        
        if (requestsData.data) {
          setLawyerRequests(requestsData.data);
        }
        
        const hearings = getUpcomingHearings().map(hearing => {
          const relatedCase = getCaseById(hearing.caseId);
          const judge = relatedCase ? getPersonById(relatedCase.judgeId, 'judge') : undefined;
          
          return {
            ...hearing,
            caseTitle: relatedCase?.title || 'Unknown Case',
            judgeName: judge?.name || 'Unknown Judge'
          };
        });
        
        setUpcomingHearings(hearings.slice(0, 5));
        
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Overview</h2>
          <p className="text-muted-foreground">
            Complete management view of the court system
          </p>
        </div>
        <Button 
          className="bg-court-primary hover:bg-court-primary/90"
          onClick={() => setIsShowingUserCreation(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" /> Create Admin/Judge
        </Button>
      </div>

      {isShowingUserCreation && (
        <div>
          <Button 
            variant="outline" 
            className="mb-4"
            onClick={() => setIsShowingUserCreation(false)}
          >
            Back to Dashboard
          </Button>
          <AdminCreation />
        </div>
      )}

      {!isShowingUserCreation && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCases}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeCases} active, {stats.pendingCases} pending
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {personnel.lawyers.length + personnel.judges.length + personnel.clients.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {personnel.lawyers.length} lawyers, {personnel.judges.length} judges, {personnel.clients.length} clients
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">28</div>
                <p className="text-xs text-muted-foreground">
                  6 uploaded this week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hearings</CardTitle>
                <Gavel className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.upcomingHearings}</div>
                <p className="text-xs text-muted-foreground">
                  Scheduled in next 30 days
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="cases">Cases</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Hearings</CardTitle>
                  <CardDescription>Next scheduled court appearances</CardDescription>
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
                              <span className="hidden sm:inline">•</span>
                              <span>Judge: {hearing.judgeName}</span>
                            </div>
                            <p className="text-xs">{hearing.description}</p>
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
            </TabsContent>
            
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage system users</CardDescription>
                  </div>
                  <Button onClick={() => setIsShowingUserCreation(true)}>
                    <Users className="mr-2 h-4 w-4" /> 
                    Add User
                  </Button>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="lawyers">
                    <TabsList className="mb-4">
                      <TabsTrigger value="lawyers">Lawyers ({personnel.lawyers.length})</TabsTrigger>
                      <TabsTrigger value="judges">Judges ({personnel.judges.length})</TabsTrigger>
                      <TabsTrigger value="clients">Clients ({personnel.clients.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="lawyers" className="space-y-4">
                      {personnel.lawyers.map(lawyer => (
                        <div key={lawyer.id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium">{lawyer.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium">{lawyer.name}</p>
                              <p className="text-sm text-muted-foreground">{lawyer.specialization || 'Attorney'}</p>
                            </div>
                          </div>
                          <div className="text-sm">
                            <p>{lawyer.email}</p>
                            <p>{lawyer.years_of_experience !== undefined ? `${lawyer.years_of_experience} years experience` : ''}</p>
                          </div>
                          <Button variant="outline" size="sm">View Profile</Button>
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="judges" className="space-y-4">
                      {personnel.judges.map(judge => (
                        <div key={judge.id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-purple-600 font-medium">{judge.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium">{judge.name}</p>
                              <p className="text-sm text-muted-foreground">Judge</p>
                            </div>
                          </div>
                          <div className="text-sm">
                            <p>{judge.email}</p>
                            <p>{judge.court_specialty || ''}</p>
                          </div>
                          <Button variant="outline" size="sm">View Profile</Button>
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="clients" className="space-y-4">
                      {personnel.clients.map(client => (
                        <div key={client.id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-green-600 font-medium">{client.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium">{client.name}</p>
                              <p className="text-sm text-muted-foreground">Client</p>
                            </div>
                          </div>
                          <div className="text-sm">
                            <p>{client.email}</p>
                            <p>{client.contact_number || ''}</p>
                          </div>
                          <Button variant="outline" size="sm">View Profile</Button>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="cases" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Case Management</CardTitle>
                    <CardDescription>Administer all court cases</CardDescription>
                  </div>
                  <Button>
                    <FileText className="mr-2 h-4 w-4" /> 
                    New Case
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-2 bg-muted rounded-md text-sm font-medium">
                      <div className="w-1/5">Case Number</div>
                      <div className="w-1/5">Title</div>
                      <div className="w-1/5">Client</div>
                      <div className="w-1/5">Status</div>
                      <div className="w-1/5 text-right">Actions</div>
                    </div>
                    
                    {cases.length > 0 ? (
                      cases.map((caseItem) => (
                        <div key={caseItem.id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div className="w-1/5">{caseItem.case_number || caseItem.caseNumber}</div>
                          <div className="w-1/5">{caseItem.title}</div>
                          <div className="w-1/5">
                            {personnel.clients.find(c => c.id === caseItem.client_id)?.name || 'Unknown'}
                          </div>
                          <div className="w-1/5">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              caseItem.status === 'active' ? 'bg-green-100 text-green-800' :
                              caseItem.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              caseItem.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {caseItem.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="w-1/5 text-right">
                            <Link to={`/cases/${caseItem.id}`} className="text-blue-600 hover:underline">View</Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No cases found</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Link to="/cases" className="text-sm text-blue-600 hover:underline">
                      View All Cases
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="lawyer-requests" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lawyer Requests</CardTitle>
                  <CardDescription>Monitor lawyer-client assignments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lawyerRequests.length > 0 ? (
                      lawyerRequests.map(request => (
                        <div key={request.id} className="p-4 border rounded-lg">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm font-medium">Client</p>
                              <p>{request.profiles?.name || 'Unknown Client'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Lawyer</p>
                              <p>{request.lawyer?.name || 'Unknown Lawyer'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Case</p>
                              <p>{request.cases?.title || 'General Consultation'}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex justify-between items-center">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Requested on {new Date(request.created_at).toLocaleDateString()}
                              </p>
                              {request.message && (
                                <p className="mt-2 text-sm">{request.message}</p>
                              )}
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {request.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">No lawyer requests at this time</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          
          </Tabs>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;