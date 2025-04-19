import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllHearings, getCaseById, getCasesByClient, getCasesByLawyer, getCasesByJudge, Hearing, getJudges, getCases } from "@/services/mockData";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

// Add predefined courtrooms
const COURTROOMS = [
  'Courtroom 1A - Civil Division',
  'Courtroom 1B - Civil Division',
  'Courtroom 2A - Criminal Division',
  'Courtroom 2B - Criminal Division',
  'Courtroom 3A - Family Division',
  'Courtroom 3B - Family Division',
  'Courtroom 4A - Corporate Division',
  'Courtroom 4B - Corporate Division',
  'Courtroom 5A - Appellate Division',
  'Courtroom 5B - Appellate Division'
];

// Enhanced Calendar view with better UI
const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filteredHearings, setFilteredHearings] = useState<Hearing[]>([]);
  const { user, role } = useAuth();
  const [selectedHearing, setSelectedHearing] = useState<Hearing | null>(null);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [availableCases, setAvailableCases] = useState<any[]>([]);
  const [availableJudges, setAvailableJudges] = useState<any[]>([]);
  const [selectedJudge, setSelectedJudge] = useState<string>("");
  const [selectedCaseForHearing, setSelectedCaseForHearing] = useState<string>("");
  const [hearingDate, setHearingDate] = useState<string>("");
  const [hearingTime, setHearingTime] = useState<string>("");
  const [hearingDuration, setHearingDuration] = useState<string>("60");
  const [hearingDescription, setHearingDescription] = useState<string>("");
  const [courtroom, setCourtroom] = useState<string>("");
  const { toast } = useToast();
  
  // Fetch hearings from database
  const fetchHearings = async () => {
    try {
      let query = supabase.from('hearings').select('*');

      // Filter hearings based on user role
      if (role === 'client' && user) {
        const { data: clientCases } = await supabase
          .from('cases')
          .select('id')
          .eq('client_id', user.id);
        
        if (clientCases) {
          query = query.in('case_id', clientCases.map(c => c.id));
        }
      } else if (role === 'lawyer' && user) {
        const { data: lawyerCases } = await supabase
          .from('cases')
          .select('id')
          .eq('lawyer_id', user.id);
        
        if (lawyerCases) {
          query = query.in('case_id', lawyerCases.map(c => c.id));
        }
      } else if (role === 'judge' && user) {
        const { data: judgeCases } = await supabase
          .from('cases')
          .select('id')
          .eq('judge_id', user.id);
        
        if (judgeCases) {
          query = query.in('case_id', judgeCases.map(c => c.id));
        }
      }

      const { data: hearingsData, error } = await query;

      if (error) throw error;

      // Format hearings to match our Hearing type
      const formattedHearings = hearingsData.map(hearing => ({
        id: hearing.id,
        caseId: hearing.case_id,
        date: hearing.date,
        time: hearing.time,
        courtroom: hearing.courtroom,
        duration: hearing.duration,
        description: hearing.description,
        status: hearing.status
      }));

      setFilteredHearings(formattedHearings);
    } catch (error) {
      console.error("Error fetching hearings:", error);
      // Fallback to mock data
      if (role === 'admin') {
        setFilteredHearings(getAllHearings());
      } else if (user) {
        let userCases = [];
        if (role === 'client') {
          userCases = getCasesByClient(user.id);
        } else if (role === 'lawyer') {
          userCases = getCasesByLawyer(user.id);
        } else if (role === 'judge') {
          userCases = getCasesByJudge(user.id);
        }
        const userCaseIds = userCases.map(c => c.id);
        const userHearings = getAllHearings().filter(hearing => 
          userCaseIds.includes(hearing.caseId)
        );
        setFilteredHearings(userHearings);
      }
    }
  };

  // Fetch hearings when component mounts and when user/role changes
  useEffect(() => {
    fetchHearings();
  }, [user, role]);
  
  // Get days for the current month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get hearings for each day
  const getHearingsForDay = (date: Date) => {
    return filteredHearings.filter(hearing => {
      const hearingDate = new Date(hearing.date);
      return isSameDay(hearingDate, date);
    });
  };
  
  // Navigate between months
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  
  // Handle hearing click to show case details
  const handleHearingClick = async (hearing: Hearing) => {
    try {
      // Fetch basic case data first
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select('*')
        .eq('id', hearing.caseId)
        .single();

      if (caseError) throw caseError;

      // Fetch related user data from their respective tables
      const [clientResponse, lawyerResponse, judgeResponse] = await Promise.all([
        caseData.client_id ? supabase.from('client_users').select('*').eq('id', caseData.client_id).single() : null,
        caseData.lawyer_id ? supabase.from('lawyer_users').select('*').eq('id', caseData.lawyer_id).single() : null,
        caseData.judge_id ? supabase.from('judge_users').select('*').eq('id', caseData.judge_id).single() : null
      ]);

      // Format case data to match our expected structure
      const formattedCase = {
        ...caseData,
        caseNumber: caseData.case_number,
        filingDate: caseData.filing_date,
        clientName: clientResponse?.data?.name || clientResponse?.data?.full_name || 'Not assigned',
        lawyerName: lawyerResponse?.data?.name || lawyerResponse?.data?.full_name || 'Not assigned',
        judgeName: judgeResponse?.data?.name || judgeResponse?.data?.full_name || 'Not assigned'
      };

      console.log('Case Data:', caseData);
      console.log('Client Response:', clientResponse);
      console.log('Lawyer Response:', lawyerResponse);
      console.log('Judge Response:', judgeResponse);
      console.log('Formatted Case:', formattedCase);

      setSelectedHearing(hearing);
      setSelectedCase(formattedCase);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error fetching case details:", error);
      // Fallback to mock data
      const caseData = getCaseById(hearing.caseId);
      setSelectedHearing(hearing);
      setSelectedCase(caseData);
      setIsDialogOpen(true);
    }
  };
  
  // Get status badge styling
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

  // Get type badge styling
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

  // Add function to check if case already has a hearing
  const checkExistingHearing = async (caseId: string) => {
    try {
      const { data: existingHearings, error } = await supabase
        .from('hearings')
        .select('*')
        .eq('case_id', caseId)
        .eq('status', 'scheduled');

      if (error) throw error;

      return existingHearings && existingHearings.length > 0;
    } catch (error) {
      console.error("Error checking existing hearings:", error);
      // Fallback to checking local state
      return filteredHearings.some(h => h.caseId === caseId && h.status === 'scheduled');
    }
  };

  // Update useEffect for schedule dialog to check existing hearings
  useEffect(() => {
    if (isScheduleDialogOpen) {
      const fetchData = async () => {
        try {
          // Fetch active cases that don't have a hearing scheduled
          const { data: casesData, error: casesError } = await supabase
            .from('cases')
            .select('*')
            .eq('status', 'active');

          if (casesError) throw casesError;

          // Filter out cases that already have hearings scheduled
          const availableCasesData = [];
          for (const caseData of casesData || []) {
            const hasHearing = await checkExistingHearing(caseData.id);
            if (!hasHearing) {
              availableCasesData.push(caseData);
            }
          }
          
          setAvailableCases(availableCasesData);

          // Fetch available judges
          const { data: judgesData, error: judgesError } = await supabase
            .from('judge_users')
            .select('*');

          if (judgesError) throw judgesError;
          setAvailableJudges(judgesData || []);

        } catch (error) {
          console.error("Error fetching data:", error);
          // Fallback to mock data
          const allCases = getCases().filter(c => c.status === 'active');
          const casesWithoutHearings = allCases.filter(c => 
            !filteredHearings.some(h => h.caseId === c.id && h.status === 'scheduled')
          );
          setAvailableCases(casesWithoutHearings);
          setAvailableJudges(getJudges());
        }
      };

      fetchData();
    }
  }, [isScheduleDialogOpen]);

  // Add function to check scheduling conflicts
  const checkSchedulingConflicts = async (date: string, time: string, duration: number, judgeId: string, selectedCourtroom: string) => {
    try {
      // Convert selected time to minutes for comparison
      const [hours, minutes] = time.split(':').map(Number);
      const selectedStartTime = hours * 60 + minutes;
      const selectedEndTime = selectedStartTime + duration;

      // Check for existing hearings on the same date
      const { data: existingHearings, error } = await supabase
        .from('hearings')
        .select('*, case:case_id(*)')
        .eq('date', date)
        .eq('status', 'scheduled');

      if (error) throw error;

      // Check each existing hearing for time conflicts
      for (const hearing of existingHearings || []) {
        const [h, m] = hearing.time.split(':').map(Number);
        const hearingStartTime = h * 60 + m;
        const hearingEndTime = hearingStartTime + hearing.duration;

        // Check if times overlap
        const hasTimeOverlap = (
          (selectedStartTime >= hearingStartTime && selectedStartTime < hearingEndTime) ||
          (selectedEndTime > hearingStartTime && selectedEndTime <= hearingEndTime) ||
          (selectedStartTime <= hearingStartTime && selectedEndTime >= hearingEndTime)
        );

        if (hasTimeOverlap) {
          // Check judge conflict using case's judge_id
          if (hearing.case?.judge_id === judgeId) {
            return {
              hasConflict: true,
              message: `Judge is already assigned to another hearing at ${hearing.time} on this date`
            };
          }

          // Check courtroom conflict
          if (hearing.courtroom === selectedCourtroom) {
            return {
              hasConflict: true,
              message: `${hearing.courtroom} is already booked for another hearing at ${hearing.time} on this date`
            };
          }
        }
      }

      return { hasConflict: false };
    } catch (error) {
      console.error("Error checking scheduling conflicts:", error);
      // Fallback to checking local state
      const existingHearings = filteredHearings.filter(h => 
        h.date === date && h.status === 'scheduled'
      );

      const [hours, minutes] = time.split(':').map(Number);
      const selectedStartTime = hours * 60 + minutes;
      const selectedEndTime = selectedStartTime + duration;

      for (const hearing of existingHearings) {
        const [h, m] = hearing.time.split(':').map(Number);
        const hearingStartTime = h * 60 + m;
        const hearingEndTime = hearingStartTime + hearing.duration;

        const hasTimeOverlap = (
          (selectedStartTime >= hearingStartTime && selectedStartTime < hearingEndTime) ||
          (selectedEndTime > hearingStartTime && selectedEndTime <= hearingEndTime) ||
          (selectedStartTime <= hearingStartTime && selectedEndTime >= hearingEndTime)
        );

        if (hasTimeOverlap) {
          // For mock data, get the case to check judge_id
          const relatedCase = getCaseById(hearing.caseId);
          if (relatedCase?.judgeId === judgeId) {
            return {
              hasConflict: true,
              message: `Judge is already assigned to another hearing at ${hearing.time} on this date`
            };
          }

          if (hearing.courtroom === selectedCourtroom) {
            return {
              hasConflict: true,
              message: `${hearing.courtroom} is already booked for another hearing at ${hearing.time} on this date`
            };
          }
        }
      }

      return { hasConflict: false };
    }
  };

  const handleScheduleHearing = async () => {
    if (!selectedCaseForHearing || !selectedJudge || !hearingDate || !hearingTime || !courtroom) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields"
      });
      return;
    }

    try {
      // Check if case already has a hearing scheduled
      const hasExistingHearing = await checkExistingHearing(selectedCaseForHearing);
      if (hasExistingHearing) {
        toast({
          variant: "destructive",
          title: "Hearing Already Scheduled",
          description: "This case already has a hearing scheduled. Please complete or cancel the existing hearing before scheduling a new one."
        });
        return;
      }

      // Check for scheduling conflicts
      const { hasConflict, message } = await checkSchedulingConflicts(
        hearingDate,
        hearingTime,
        parseInt(hearingDuration),
        selectedJudge,
        courtroom
      );

      if (hasConflict) {
        toast({
          variant: "destructive",
          title: "Scheduling Conflict",
          description: message
        });
        return;
      }

      // Get case title to avoid null constraint
      const selectedCaseData = availableCases.find(c => c.id === selectedCaseForHearing);
      if (!selectedCaseData?.title) {
        toast({
          variant: "destructive",
          title: "Invalid Case",
          description: "Selected case does not have a title"
        });
        return;
      }

      // Create new hearing
      const { data: hearingData, error: hearingError } = await supabase
        .from('hearings')
        .insert({
          case_id: selectedCaseForHearing,
          judge_id: selectedJudge,
          date: hearingDate,
          time: hearingTime,
          duration: parseInt(hearingDuration),
          description: hearingDescription || `${selectedCaseData.title} - ${hearingDate}`,
          courtroom: courtroom,
          status: 'scheduled',
          title: `${selectedCaseData.title} - Hearing`
        })
        .select()
        .single();

      if (hearingError) throw hearingError;

      // Update case status and judge
      const { data: updatedCase, error: caseError } = await supabase
        .from('cases')
        .update({ 
          status: 'active',
          judge_id: selectedJudge,
          updated_at: new Date()
        })
        .eq('id', selectedCaseForHearing)
        .select()
        .single();

      if (caseError) throw caseError;

      // Format the hearing data to match our Hearing type
      const formattedHearing: Hearing = {
        id: hearingData.id,
        caseId: hearingData.case_id,
        date: hearingData.date,
        time: hearingData.time,
        courtroom: hearingData.courtroom,
        duration: hearingData.duration,
        description: hearingData.description,
        status: hearingData.status
      };

      // Update local state with formatted data
      setFilteredHearings(prev => [...prev, formattedHearing]);
      
      // After successful scheduling, fetch updated hearings
      await fetchHearings();

      // Reset form and close dialog
      setSelectedCaseForHearing("");
      setSelectedJudge("");
      setHearingDate("");
      setHearingTime("");
      setHearingDuration("60");
      setHearingDescription("");
      setCourtroom("");
      setIsScheduleDialogOpen(false);

      toast({
        title: "Hearing Scheduled",
        description: "The hearing has been successfully scheduled"
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Scheduling Failed",
        description: error.message || "Failed to schedule hearing"
      });
    }
  };

  return (
    <PageLayout>
      <div className="container py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">
              {role === 'admin' 
                ? 'View and manage all scheduled court hearings' 
                : 'View and track your scheduled court hearings'}
            </p>
          </div>
          {role === 'admin' && (
            <Button 
              className="mt-4 md:mt-0 bg-court-primary hover:bg-court-primary/90"
              onClick={() => setIsScheduleDialogOpen(true)}
            >
              <CalendarDays className="mr-2 h-4 w-4" /> Schedule New Hearing
            </Button>
          )}
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {role === 'admin' 
                  ? `Court Hearings - ${format(currentMonth, 'MMMM yyyy')}` 
                  : `Your Hearings - ${format(currentMonth, 'MMMM yyyy')}`}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              {role === 'admin' 
                ? 'Calendar view of all scheduled hearings' 
                : 'Calendar view of your scheduled hearings'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Calendar grid - days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-medium py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid - days */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: new Date(monthStart).getDay() }).map((_, index) => (
                <div key={`empty-${index}`} className="h-28 bg-muted/20 rounded-md"></div>
              ))}
              
              {daysInMonth.map((day) => {
                const dayHearings = getHearingsForDay(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div 
                    key={day.toString()}
                    className={cn(
                      "h-28 border rounded-md overflow-hidden hover:border-court-primary transition-colors",
                      isToday ? "border-court-primary border-2" : "border-border"
                    )}
                  >
                    <div className={cn(
                      "text-right p-1",
                      isToday ? "bg-court-primary text-white" : "bg-background"
                    )}>
                      {format(day, 'd')}
                    </div>
                    <div className="p-1 overflow-y-auto h-[calc(100%-24px)] scrollbar-hide">
                      {dayHearings.length > 0 ? (
                        dayHearings.map(hearing => {
                          const relatedCase = getCaseById(hearing.caseId);
                          return (
                            <div 
                              key={hearing.id} 
                              className="text-xs p-1 mb-1 bg-court-accent/10 border border-court-accent/20 rounded truncate hover:bg-court-accent/20 cursor-pointer"
                              onClick={() => handleHearingClick(hearing)}
                            >
                              <p className="font-medium truncate">{hearing.time} - {relatedCase?.title}</p>
                              <p className="truncate text-muted-foreground">{hearing.courtroom}</p>
                            </div>
                          );
                        })
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {role === 'admin' ? 'Upcoming Hearings' : 'Your Upcoming Hearings'}
            </CardTitle>
            <CardDescription>
              {role === 'admin' ? 'Next scheduled court appearances' : 'Your next scheduled court appearances'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredHearings
                .filter(h => new Date(h.date) >= new Date() && h.status === 'scheduled')
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map(hearing => {
                  const relatedCase = getCaseById(hearing.caseId);
                  return (
                    <div 
                      key={hearing.id} 
                      className="p-3 border rounded-lg hover:border-court-primary transition-colors cursor-pointer"
                      onClick={() => handleHearingClick(hearing)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{relatedCase?.title}</h3>
                          <p className="text-sm text-muted-foreground">Case #{relatedCase?.caseNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{format(new Date(hearing.date), 'MMM dd, yyyy')}</p>
                          <p className="text-sm">{hearing.time} • {hearing.duration} min</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm">{hearing.courtroom} • {hearing.description}</p>
                      </div>
                    </div>
                  );
                })}
              {filteredHearings.filter(h => new Date(h.date) >= new Date() && h.status === 'scheduled').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No upcoming hearings found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Schedule Hearing Dialog */}
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Hearing</DialogTitle>
              <DialogDescription>
                Fill in the details to schedule a new court hearing
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="case">Select Case</Label>
                  <Select value={selectedCaseForHearing} onValueChange={setSelectedCaseForHearing}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a case" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCases.map(case_ => (
                        <SelectItem key={case_.id} value={case_.id}>
                          {case_.title} ({case_.case_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="judge">Assign Judge</Label>
                  <Select value={selectedJudge} onValueChange={setSelectedJudge}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a judge" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableJudges.map(judge => (
                        <SelectItem key={judge.id} value={judge.id}>
                          {judge.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={hearingDate}
                    onChange={(e) => setHearingDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={hearingTime}
                    onChange={(e) => setHearingTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select value={hearingDuration} onValueChange={setHearingDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courtroom">Courtroom</Label>
                  <Select value={courtroom} onValueChange={setCourtroom}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a courtroom" />
                    </SelectTrigger>
                    <SelectContent>
                      {COURTROOMS.map(room => (
                        <SelectItem key={room} value={room}>
                          {room}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Enter hearing description"
                  value={hearingDescription}
                  onChange={(e) => setHearingDescription(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleScheduleHearing}>
                Schedule Hearing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Case Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            {selectedCase && selectedHearing && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedCase.title}</DialogTitle>
                  <DialogDescription>
                    Case #{selectedCase.caseNumber || selectedCase.case_number}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={cn("capitalize", getStatusStyle(selectedCase.status))}>
                      {selectedCase.status}
                    </Badge>
                    <Badge className={cn("capitalize", getTypeStyle(selectedCase.type))}>
                      {selectedCase.type}
                    </Badge>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Hearing Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Date & Time</p>
                        <p>{format(new Date(selectedHearing.date), 'MMMM dd, yyyy')} at {selectedHearing.time}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p>{selectedHearing.duration} minutes</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Courtroom</p>
                        <p>{selectedHearing.courtroom}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="capitalize">{selectedHearing.status}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Case Information</h3>
                    <p className="mb-2">{selectedCase.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Filing Date</p>
                        <p>{selectedCase.filingDate || selectedCase.filing_date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Filing Location</p>
                        <p>{selectedCase.courtroom}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Parties Involved</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Client</p>
                        <p>{selectedCase.clientName || selectedCase.profiles?.name || 'Not assigned'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Attorney</p>
                        <p>{selectedCase.lawyerName || selectedCase.lawyer_profiles?.name || 'Not assigned'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Judge</p>
                        <p>{selectedCase.judgeName || selectedCase.judge_profiles?.name || 'Not assigned'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="mr-2"
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsDialogOpen(false);
                      window.location.href = `/cases/${selectedCase.id}`;
                    }}
                  >
                    View Full Case
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default Calendar;

