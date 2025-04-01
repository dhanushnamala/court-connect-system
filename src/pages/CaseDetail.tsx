
import { useParams, Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCaseById, getPersonById, getHearingsByCaseId, getDocumentsByCaseId } from "@/services/mockData";
import { ArrowLeft, Calendar, Edit, FileClock, FileText, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const caseData = getCaseById(id || "");
  
  if (!caseData) {
    return (
      <PageLayout>
        <div className="container py-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">Case Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested case could not be found.</p>
            <Link to="/cases">
              <Button>Back to Cases</Button>
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  const client = getPersonById(caseData.clientId, 'client');
  const lawyer = getPersonById(caseData.lawyerId, 'lawyer');
  const judge = getPersonById(caseData.judgeId, 'judge');
  const hearings = getHearingsByCaseId(caseData.id);
  const documents = getDocumentsByCaseId(caseData.id);

  // Status badge styling
  const getStatusStyle = (status: string) => {
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
  const getTypeStyle = (type: string) => {
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
        {/* Header with back button and actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link to="/cases">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{caseData.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-muted-foreground">{caseData.caseNumber}</span>
                <Badge className={cn("capitalize", getStatusStyle(caseData.status))}>
                  {caseData.status}
                </Badge>
                <Badge className={cn("capitalize", getTypeStyle(caseData.type))}>
                  {caseData.type}
                </Badge>
              </div>
            </div>
          </div>
          <Button className="bg-court-primary hover:bg-court-primary/90">
            <Edit className="mr-2 h-4 w-4" /> Edit Case
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {/* Case details */}
          <div className="md:col-span-2 lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Case Information</CardTitle>
                <CardDescription>
                  Details and description of the case
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">Description</h3>
                    <p className="text-muted-foreground">{caseData.description}</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="font-medium mb-1">Filing Date</h3>
                      <p className="text-muted-foreground">{caseData.filingDate}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Courtroom</h3>
                      <p className="text-muted-foreground">{caseData.courtroom}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="hearings" className="space-y-6">
              <TabsList>
                <TabsTrigger value="hearings">Hearings</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="hearings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Scheduled Hearings</CardTitle>
                      <Button size="sm">
                        <Calendar className="mr-2 h-4 w-4" /> Schedule Hearing
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {hearings.length > 0 ? (
                      <div className="space-y-4">
                        {hearings.map((hearing) => (
                          <div key={hearing.id} className="flex items-start border-b pb-4 last:border-0 last:pb-0">
                            <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                              <FileClock className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">{hearing.description}</p>
                                <Badge className={cn(
                                  "capitalize", 
                                  hearing.status === "scheduled" ? "bg-blue-100 text-blue-800" : 
                                  hearing.status === "completed" ? "bg-green-100 text-green-800" :
                                  hearing.status === "cancelled" ? "bg-red-100 text-red-800" :
                                  "bg-amber-100 text-amber-800"
                                )}>
                                  {hearing.status}
                                </Badge>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-xs text-muted-foreground">
                                <span>{hearing.date} at {hearing.time}</span>
                                <span className="hidden sm:inline">•</span>
                                <span>Courtroom: {hearing.courtroom}</span>
                                <span className="hidden sm:inline">•</span>
                                <span>Duration: {hearing.duration} minutes</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No hearings scheduled for this case</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Case Documents</CardTitle>
                      <Button size="sm">
                        <FileText className="mr-2 h-4 w-4" /> Upload Document
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {documents.length > 0 ? (
                      <div className="space-y-4">
                        {documents.map((doc) => (
                          <div key={doc.id} className="flex items-start border-b pb-4 last:border-0 last:pb-0">
                            <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium">{doc.title}</p>
                              <p className="text-xs text-muted-foreground">{doc.description}</p>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <span>Uploaded: {doc.uploadDate}</span>
                                <span className="mx-2">•</span>
                                <span>By: {doc.uploadedBy}</span>
                                <span className="mx-2">•</span>
                                <span>{doc.fileType.toUpperCase()} • {doc.fileSize}</span>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No documents available for this case</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Case Notes</CardTitle>
                      <Button size="sm">Add Note</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No notes have been added to this case</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar with involved parties */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" /> Involved Parties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Client */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Client</h3>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={client?.imageUrl} alt={client?.name} />
                      <AvatarFallback>{client?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{client?.name}</p>
                      <p className="text-xs text-muted-foreground">{client?.email}</p>
                    </div>
                  </div>
                </div>
                
                {/* Lawyer */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Attorney</h3>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={lawyer?.imageUrl} alt={lawyer?.name} />
                      <AvatarFallback>{lawyer?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{lawyer?.name}</p>
                      <p className="text-xs text-muted-foreground">{lawyer?.specialization}</p>
                    </div>
                  </div>
                </div>
                
                {/* Judge */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Judge</h3>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={judge?.imageUrl} alt={judge?.name} />
                      <AvatarFallback>{judge?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{judge?.name}</p>
                      <p className="text-xs text-muted-foreground">{judge?.email}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Case Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-2">
                  <p className="text-xs text-muted-foreground">Recent activity will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CaseDetail;
