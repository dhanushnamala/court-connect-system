
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Users, Clock } from "lucide-react";
import { getCasesByLawyer, getUpcomingHearings, Hearing } from "@/services/mockData";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const LawyerDashboard = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [upcomingHearings, setUpcomingHearings] = useState<(Hearing & { caseTitle: string })[]>([]);

  useEffect(() => {
    // Use actual lawyer ID from auth if available, otherwise use default for demo
    const lawyerId = user?.id || '1';
    const lawyerCases = getCasesByLawyer(lawyerId);
    setCases(lawyerCases);
    
    // Get upcoming hearings for this lawyer's cases
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
  }, [user]);

  // Count cases by status
  const activeCount = cases.filter(c => c.status === 'active').length;
  const pendingCount = cases.filter(c => c.status === 'pending').length;
  const closedCount = cases.filter(c => c.status === 'closed').length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
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
              {new Set(cases.map(c => c.clientId)).size}
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

      {/* Upcoming Hearings */}
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
      
      {/* Case List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Case Load</CardTitle>
          <CardDescription>All cases you're currently handling</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cases.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg hover:border-primary transition-colors">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">Case #{item.caseNumber}</p>
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
                    <span className="text-xs text-muted-foreground">Filed: {item.filingDate}</span>
                    <Link to={`/cases/${item.id}`} className="text-sm text-blue-600 hover:underline">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LawyerDashboard;
