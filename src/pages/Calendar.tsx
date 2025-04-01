
import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllHearings, getCaseById } from "@/services/mockData";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const hearings = getAllHearings();
  
  // Get days for the current month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get hearings for each day
  const getHearingsForDay = (date: Date) => {
    return hearings.filter(hearing => {
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
              View and manage all scheduled court hearings
            </p>
          </div>
          <Button className="mt-4 md:mt-0 bg-court-primary hover:bg-court-primary/90">
            Schedule New Hearing
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Court Hearings - {format(currentMonth, 'MMMM yyyy')}</CardTitle>
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
              Calendar view of all scheduled hearings
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
                      "h-28 border rounded-md overflow-hidden",
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
      </div>
    </PageLayout>
  );
};

export default Calendar;
