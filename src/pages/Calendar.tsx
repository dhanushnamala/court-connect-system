
import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllHearings, getCaseById, getCasesByClient, getCasesByLawyer, getCasesByJudge, Hearing } from "@/services/mockData";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

// Enhanced Calendar view with better UI
const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filteredHearings, setFilteredHearings] = useState<Hearing[]>([]);
  const { user, role } = useAuth();
  
  // Filter hearings based on user role
  useEffect(() => {
    const allHearings = getAllHearings();
    
    if (role === 'admin') {
      // Admin sees all hearings
      setFilteredHearings(allHearings);
    } else if (user) {
      // Filter hearings based on user role and ID
      let userCases = [];
      
      if (role === 'client') {
        userCases = getCasesByClient(user.id);
      } else if (role === 'lawyer') {
        userCases = getCasesByLawyer(user.id);
      } else if (role === 'judge') {
        userCases = getCasesByJudge(user.id);
      }
      
      // Get case IDs relevant to this user
      const userCaseIds = userCases.map(c => c.id);
      
      // Filter hearings to only those related to the user's cases
      const userHearings = allHearings.filter(hearing => 
        userCaseIds.includes(hearing.caseId)
      );
      
      setFilteredHearings(userHearings);
    }
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
            <Button className="mt-4 md:mt-0 bg-court-primary hover:bg-court-primary/90">
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
                      "h-28 border rounded-md overflow-hidden hover:border-court-primary transition-colors cursor-pointer",
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
                              className="text-xs p-1 mb-1 bg-court-accent/10 border border-court-accent/20 rounded truncate"
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
                    <div key={hearing.id} className="p-3 border rounded-lg hover:border-court-primary transition-colors">
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
      </div>
    </PageLayout>
  );
};

export default Calendar;
