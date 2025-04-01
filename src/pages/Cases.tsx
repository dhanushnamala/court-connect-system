
import { useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getCases, Case, CaseStatus, CaseType, getPersonById } from "@/services/mockData";
import { Search, Plus, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const Cases = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CaseStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<CaseType | "all">("all");
  
  // Get cases and apply filters
  const allCases = getCases();
  const filteredCases = allCases.filter(c => {
    const matchesSearch = c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesType = typeFilter === "all" || c.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Status badge styling
  const getStatusStyle = (status: CaseStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "pending":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "closed":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      case "appealed":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      default:
        return "";
    }
  };

  // Type badge styling
  const getTypeStyle = (type: CaseType) => {
    switch (type) {
      case "criminal":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "civil":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "family":
        return "bg-teal-100 text-teal-800 hover:bg-teal-100";
      case "corporate":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
      default:
        return "";
    }
  };

  return (
    <PageLayout>
      <div className="container py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cases</h1>
            <p className="text-muted-foreground">
              Manage and track all your legal cases
            </p>
          </div>
          <Button className="mt-4 md:mt-0 bg-court-primary hover:bg-court-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Add New Case
          </Button>
        </div>

        <div className="bg-white rounded-lg border shadow-sm">
          {/* Filters */}
          <div className="p-4 border-b">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cases..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CaseStatus | "all")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="appealed">Appealed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as CaseType | "all")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="criminal">Criminal</SelectItem>
                    <SelectItem value="civil">Civil</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Cases Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case Number</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Filing Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Lawyer</TableHead>
                  <TableHead>Judge</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.length > 0 ? (
                  filteredCases.map((caseItem) => {
                    const client = getPersonById(caseItem.clientId, 'client');
                    const lawyer = getPersonById(caseItem.lawyerId, 'lawyer');
                    const judge = getPersonById(caseItem.judgeId, 'judge');
                    
                    return (
                      <TableRow key={caseItem.id}>
                        <TableCell>
                          <Link to={`/cases/${caseItem.id}`} className="font-medium text-court-primary hover:underline">
                            {caseItem.caseNumber}
                          </Link>
                        </TableCell>
                        <TableCell>{caseItem.title}</TableCell>
                        <TableCell>
                          <Badge className={cn("capitalize", getStatusStyle(caseItem.status))}>
                            {caseItem.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("capitalize", getTypeStyle(caseItem.type))}>
                            {caseItem.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{caseItem.filingDate}</TableCell>
                        <TableCell>{client?.name}</TableCell>
                        <TableCell>{lawyer?.name}</TableCell>
                        <TableCell>{judge?.name}</TableCell>
                        <TableCell>
                          <Link to={`/cases/${caseItem.id}`} className="text-court-primary hover:text-court-primary/90">
                            <FileText className="h-5 w-5" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6">
                      No cases found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Cases;
