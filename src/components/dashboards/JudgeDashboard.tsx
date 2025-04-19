import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gavel, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface HearingWithRelatedData {
  id: string;
  case_id: string;
  date: string;
  time: string | null;
  type: string | null;
  status: string | null;
  case_number: string;
  case_title: string;
  judge_id: string;
}

interface FormattedHearing {
  id: string;
  caseId: string;
  date: string;
  time: string;
  type: string;
  status: string;
  caseNumber: string;
  caseTitle: string;
}

const JudgeDashboard = () => {
  const { user } = useAuth();
  const [upcomingHearings, setUpcomingHearings] = useState<FormattedHearing[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        console.log("No user ID found");
        return;
      }
      
      setIsLoading(true);
      
      try {
        console.log("Starting data fetch for judge ID:", user.id);
        
        // Fetch hearings from the view with related data
        const { data: hearingsData, error: hearingsError } = await supabase
          .from('hearings_with_related_data')
          .select('*')
          .eq('judge_id', user.id)
          .gte('date', new Date().toISOString().split('T')[0])
          .order('date', { ascending: true }) as {
            data: HearingWithRelatedData[] | null;
            error: any;
          };
            
        if (hearingsError) {
          console.error("Error fetching hearings:", hearingsError);
          throw new Error(`Failed to fetch hearings: ${hearingsError.message}`);
        }
        
        console.log("Raw hearings data:", hearingsData);
        
        if (!hearingsData) {
          console.log("No hearings data returned");
          setUpcomingHearings([]);
          return;
        }

        const formattedHearings: FormattedHearing[] = hearingsData.map(hearing => ({
          id: hearing.id,
          caseId: hearing.case_id,
          date: hearing.date,
          time: hearing.time || '09:00',
          type: hearing.type || 'Regular Hearing',
          status: hearing.status || 'Scheduled',
          caseNumber: hearing.case_number || 'N/A',
          caseTitle: hearing.case_title || 'Unknown Case'
        }));
        
        console.log("Final formatted hearings:", formattedHearings);
        setUpcomingHearings(formattedHearings);
        
      } catch (error: any) {
        console.error("Detailed error in data fetching:", {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        toast({
          variant: "destructive",
          title: "Error Fetching Data",
          description: error.message || "Failed to fetch dashboard data. Please try again."
        });
        
        setUpcomingHearings([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user?.id, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-700">
        <CardContent className="px-6 py-8 text-white">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {(user?.name?.[0] || user?.email?.[0] || 'J').toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">Welcome, Judge {user?.name || user?.email || 'User'}</h2>
              <p className="opacity-90">Here's your docket for today</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
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
              Scheduled for today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Hearings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingHearings.filter(h => {
                const hearingDate = new Date(h.date);
                const today = new Date();
                return hearingDate > today && hearingDate <= new Date(today.setDate(today.getDate() + 30));
              }).length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Next 30 days (excluding today)
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Hearings */}
      <Card>
        <CardHeader>
          <CardTitle>Hearings</CardTitle>
          <CardDescription>All upcoming hearings for your cases</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading hearings...</p>
            </div>
          ) : upcomingHearings.length > 0 ? (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3">Date</th>
                    <th scope="col" className="px-6 py-3">Time</th>
                    <th scope="col" className="px-6 py-3">Case Number</th>
                    <th scope="col" className="px-6 py-3">Case Title</th>
                    <th scope="col" className="px-6 py-3">Type</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingHearings
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(hearing => (
                      <tr key={hearing.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">
                          {new Date(hearing.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {hearing.time || 'TBD'}
                        </td>
                        <td className="px-6 py-4">
                          {hearing.caseNumber}
                        </td>
                        <td className="px-6 py-4">
                          {hearing.caseTitle}
                        </td>
                        <td className="px-6 py-4">
                          {hearing.type}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={cn(
                            "capitalize",
                            hearing.status === 'scheduled' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                            hearing.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                            hearing.status === 'cancelled' ? 'bg-red-100 text-red-800 hover:bg-red-100' :
                            'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                          )}>
                            {hearing.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Link 
                            to={`/cases/${hearing.caseId}/hearings/${hearing.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            View Details
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
              <p className="mt-2 text-muted-foreground">No hearings scheduled</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JudgeDashboard;
