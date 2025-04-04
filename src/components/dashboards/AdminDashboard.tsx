
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, 
  Calendar, 
  FileText, 
  Gavel, 
  Users,
  Clock 
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
import { Link } from 'react-router-dom';

// Bar chart data
const caseTypeData = [
  { name: 'Criminal', value: 2 },
  { name: 'Civil', value: 2 },
  { name: 'Family', value: 1 },
  { name: 'Corporate', value: 1 },
];

// Pie chart data
const caseStatusData = [
  { name: 'Active', value: 2 },
  { name: 'Pending', value: 2 },
  { name: 'Closed', value: 1 },
  { name: 'Appealed', value: 1 },
];

const COLORS = ['#3182CE', '#E53E3E', '#38A169', '#D69E2E'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(getCaseStats());
  const [upcomingHearings, setUpcomingHearings] = useState<(Hearing & { caseTitle: string; judgeName: string })[]>([]);
  const [personnel, setPersonnel] = useState({
    lawyers: getLawyers(),
    judges: getJudges(),
    clients: getClients()
  });

  useEffect(() => {
    // Get upcoming hearings with additional info
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
  }, []);

  return (
    <div className="space-y-6">
      {/* System Overview Heading */}
      <div>
        <h2 className="text-2xl font-bold">System Overview</h2>
        <p className="text-muted-foreground">
          Complete management view of the court system
        </p>
      </div>

      {/* Stats Cards */}
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
          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cases by Type</CardTitle>
                <CardDescription>Distribution of cases by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={caseTypeData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3182CE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Case Status</CardTitle>
                <CardDescription>Current status of all cases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={caseStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {caseStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Upcoming Hearings */}
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
          {/* User Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage system users</CardDescription>
              </div>
              <Button>
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
                        <p>{lawyer.phone}</p>
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
                        <p>{judge.phone}</p>
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
                        <p>{client.phone}</p>
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
                  <div className="w-1/4">Case Number</div>
                  <div className="w-1/4">Title</div>
                  <div className="w-1/4">Status</div>
                  <div className="w-1/4 text-right">Actions</div>
                </div>
                
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="w-1/4">CR-2023-100{index + 1}</div>
                    <div className="w-1/4">State v. Johnson</div>
                    <div className="w-1/4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                    <div className="w-1/4 text-right">
                      <Link to="/cases/1" className="text-blue-600 hover:underline">View</Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Link to="/cases" className="text-sm text-blue-600 hover:underline">
                  View All Cases
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
