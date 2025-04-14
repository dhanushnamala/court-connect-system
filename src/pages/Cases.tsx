import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  FileText, 
  Filter, 
  Search, 
  User, 
  AlertCircle, 
  CheckCircle, 
  Clock4, 
  Plus 
} from "lucide-react";
import { format } from "date-fns";

const Cases = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchCases = async () => {
    let query = supabase.from("cases").select("*");
    let approvedRequestCases = [];

    // Filter cases based on user role
    if (user.role === "client") {
      query = query.eq("client_id", user.id);
    } else if (user.role === "lawyer") {
      // For lawyers, fetch cases directly assigned to them
      query = query.eq("lawyer_id", user.id);
      
      // Also fetch cases from approved lawyer requests
      console.log("Fetching approved lawyer requests for lawyer:", user.id);
      const { data: approvedRequests, error: requestsError } = await supabase
        .from("lawyer_requests")
        .select("case_id")
        .eq("lawyer_id", user.id)
        .eq("status", "approved");
        
      if (requestsError) {
        console.error("Error fetching approved lawyer requests:", requestsError);
      } else if (approvedRequests && approvedRequests.length > 0) {
        console.log("Found approved requests:", approvedRequests);
        
        // Get the case IDs from approved requests and filter out null values
        const caseIds = approvedRequests
          .map(req => req.case_id)
          .filter(id => id !== null);
        
        // Only fetch cases if there are valid case IDs
        if (caseIds.length > 0) {
          // Fetch the cases for these approved requests
          const { data: requestCases, error: casesError } = await supabase
            .from("cases")
            .select("*")
            .in("id", caseIds);
            
          if (casesError) {
            console.error("Error fetching cases from approved requests:", casesError);
          } else if (requestCases) {
            console.log("Found cases from approved requests:", requestCases);
            approvedRequestCases = requestCases;
          }
        } else {
          console.log("No valid case IDs found in approved requests");
        }
      }
    } else if (user.role === "judge") {
      query = query.eq("judge_id", user.id);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching cases:", error);
    } else {
      // For lawyers, combine directly assigned cases with cases from approved requests
      if (user.role === "lawyer" && approvedRequestCases.length > 0) {
        // Create a map of existing cases to avoid duplicates
        const casesMap = new Map();
        
        // Add directly assigned cases to the map
        data.forEach(caseItem => {
          casesMap.set(caseItem.id, caseItem);
        });
        
        // Add cases from approved requests to the map (will not overwrite existing entries)
        approvedRequestCases.forEach(caseItem => {
          if (!casesMap.has(caseItem.id)) {
            casesMap.set(caseItem.id, caseItem);
          }
        });
        
        // Convert map back to array
        const combinedCases = Array.from(casesMap.values());
        console.log("Combined cases for lawyer:", combinedCases);
        setCases(combinedCases);
      } else {
        setCases(data);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCases();
  }, []);

  // Filter cases based on search term and status
  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = 
      caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.case_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || caseItem.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock4 className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "closed":
        return <Badge className="bg-gray-500 hover:bg-gray-600"><AlertCircle className="h-3 w-3 mr-1" /> Closed</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
  };

  return (
    <PageLayout>
      <div className="container py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cases</h1>
            <p className="text-muted-foreground">Manage and view all your legal cases</p>
          </div>
          
          {user.role === "client" && (
            <Button className="bg-court-primary hover:bg-court-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              New Case
            </Button>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search cases..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-court-primary"></div>
          </div>
        ) : filteredCases.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No cases found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria" 
                : "You don't have any cases yet"}
            </p>
            {user.role === "client" && (
              <Button className="bg-court-primary hover:bg-court-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create your first case
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((caseItem) => (
              <Card key={caseItem.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="line-clamp-1">{caseItem.title}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <FileText className="h-3 w-3 mr-1" />
                        {caseItem.case_number || "No case number"}
                      </CardDescription>
                    </div>
                    {getStatusBadge(caseItem.status)}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {caseItem.description || "No description available"}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {caseItem.filing_date ? format(new Date(caseItem.filing_date), "MMM d, yyyy") : "No date"}
                    </div>
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {caseItem.client_name || "Unknown client"}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link to={`/cases/${caseItem.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Cases;
