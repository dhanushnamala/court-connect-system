
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, UserCheck } from "lucide-react";
import { getCasesByClient, getPersonById, Case } from "@/services/mockData";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const ClientDashboard = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [lawyers, setLawyers] = useState<{[key: string]: any}>({});

  useEffect(() => {
    // In a real app, we would use the actual client ID
    // For demo purposes, we'll use client ID 2
    const clientCases = getCasesByClient('2');
    setCases(clientCases);
    
    // Get lawyer details for each case
    const lawyerDetails: {[key: string]: any} = {};
    clientCases.forEach(c => {
      const lawyer = getPersonById(c.lawyerId, 'lawyer');
      if (lawyer) {
        lawyerDetails[c.lawyerId] = lawyer;
      }
    });
    
    setLawyers(lawyerDetails);
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back, {user?.name}</CardTitle>
          <CardDescription>
            Here's a summary of your ongoing cases and upcoming hearings
          </CardDescription>
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
      
      {/* Cases List */}
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
                    <p className="text-sm text-muted-foreground">Case #{item.caseNumber}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        item.status === 'active' ? 'bg-green-100 text-green-800' :
                        item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        item.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-muted-foreground">Filed on {item.filingDate}</span>
                    </div>
                  </div>
                  <div className="mt-3 md:mt-0">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Attorney: </span>
                      <span className="font-medium">{lawyers[item.lawyerId]?.name || 'Not assigned'}</span>
                    </div>
                    <div className="mt-2">
                      <Link to={`/cases/${item.id}`} className="text-sm text-blue-600 hover:underline">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No cases found</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Lawyers */}
      <Card>
        <CardHeader>
          <CardTitle>Your Legal Team</CardTitle>
          <CardDescription>Attorneys assigned to your cases</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboard;
