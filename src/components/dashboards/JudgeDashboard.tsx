
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gavel, Calendar, Scale, Clock } from "lucide-react";
import { getCasesByJudge, getUpcomingHearings, Hearing } from "@/services/mockData";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const JudgeDashboard = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [upcomingHearings, setUpcomingHearings] = useState<(Hearing & { caseTitle: string })[]>([]);

  useEffect(() => {
    // Use actual judge ID from auth if available, otherwise use default for demo
    const judgeId = user?.id || '1';
    const judgeCases = getCasesByJudge(judgeId);
    setCases(judgeCases);
    
    // Get upcoming hearings for this judge's cases
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
  }, [user]);

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
            <div className="text-2xl font-bold">{cases.length}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                {cases.filter(c => c.status === 'active').length} Active
              </Badge>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
                {cases.filter(c => c.status === 'pending').length} Pending
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
              {upcomingHearings.filter(h => h.date === new Date().toISOString().split('T')[0]).length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {upcomingHearings.length} upcoming in next 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courtroom Schedule</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Courtroom 3A</div>
            <p className="text-xs text-muted-foreground mt-2">
              Next hearing at 10:30 AM
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Docket</CardTitle>
          <CardDescription>Hearings scheduled for today</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingHearings.filter(h => h.date === new Date().toISOString().split('T')[0]).length > 0 ? (
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
                    .filter(h => h.date === new Date().toISOString().split('T')[0])
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
      
      {/* Case List */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Cases</CardTitle>
          <CardDescription>All cases under your jurisdiction</CardDescription>
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
                      <span className="text-xs text-muted-foreground">Type: {item.type}</span>
                      <span className="text-xs text-muted-foreground">Filed: {item.filingDate}</span>
                    </div>
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

export default JudgeDashboard;
