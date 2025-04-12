
import { useState } from 'react';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Example events - in a real app these would come from an API
  const events = [
    { id: 1, title: "Frontend Basics", date: new Date(2025, 3, 15), type: "lecture" },
    { id: 2, title: "React Fundamentals", date: new Date(2025, 3, 18), type: "assignment" },
    { id: 3, title: "TypeScript Workshop", date: new Date(2025, 3, 22), type: "workshop" }
  ];
  
  // Get events for the selected date
  const selectedDateEvents = date 
    ? events.filter(event => 
        event.date.getDate() === date.getDate() && 
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
      ) 
    : [];
  
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Calendar</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
            <CardDescription>Browse your schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Events for {date?.toLocaleDateString()}</CardTitle>
            <CardDescription>Your schedule for the selected date</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedDateEvents.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Badge variant={event.type === 'lecture' ? 'default' : event.type === 'assignment' ? 'destructive' : 'outline'}>
                      {event.type}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No events scheduled for this date
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;
