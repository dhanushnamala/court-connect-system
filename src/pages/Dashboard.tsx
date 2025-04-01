
import { useEffect, useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { 
  Briefcase, 
  Calendar, 
  FileText, 
  Gavel, 
  LayoutDashboard, 
  Clock 
} from "lucide-react";
import { 
  getCaseStats, 
  getUpcomingHearings, 
  Hearing,
  getCaseById,
  getPersonById
} from "@/services/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

const Dashboard = () => {
  const { user, role } = useAuth();
  const [stats, setStats] = useState(getCaseStats());
  const [upcomingHearings, setUpcomingHearings] = useState<(Hearing & { caseTitle: string; judgeName: string })[]>([]);

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
    <PageLayout>
      <div className="container py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name || 'User'}! Here's what's happening with your cases.
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cases">Cases</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
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
                  <CardTitle className="text-sm font-medium">Upcoming Hearings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.upcomingHearings}</div>
                  <p className="text-xs text-muted-foreground">
                    In the next 30 days
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
                  <CardTitle className="text-sm font-medium">Closed Cases</CardTitle>
                  <Gavel className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.closedCases}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.appealedCases} under appeal
                  </p>
                </CardContent>
              </Card>
            </div>
            
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
          
          <TabsContent value="cases" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Case Activity</CardTitle>
                <CardDescription>Updates from your active cases</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This section will show recent activity from your cases. 
                  Navigate to the Cases page for full case management.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Calendar Overview</CardTitle>
                <CardDescription>Your schedule for the coming weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This section will show a compact calendar view. 
                  Visit the Calendar page for detailed scheduling.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
