
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  dueDate: string;
  complete: boolean;
  module?: string;
}

interface UpcomingTasksProps {
  tasks: Task[];
  onCompleteTask?: (taskId: string) => void;
}

const UpcomingTasks = ({ tasks, onCompleteTask }: UpcomingTasksProps) => {
  const sortedTasks = [...tasks].sort((a, b) => {
    // First by completion status
    if (a.complete !== b.complete) {
      return a.complete ? 1 : -1;
    }
    // Then by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  // Calculate if a task is due soon (within 2 days)
  const isDueSoon = (dateString: string) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 2;
  };

  // Format date to show "Today", "Tomorrow", or the date
  const formatDueDate = (dateString: string) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const dueDate = new Date(dateString);
    
    if (
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    ) {
      return "Today";
    } else if (
      dueDate.getDate() === tomorrow.getDate() &&
      dueDate.getMonth() === tomorrow.getMonth() &&
      dueDate.getFullYear() === tomorrow.getFullYear()
    ) {
      return "Tomorrow";
    } else {
      return dueDate.toLocaleDateString();
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No upcoming tasks</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {sortedTasks.map((task) => (
              <li 
                key={task.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  task.complete 
                    ? "bg-muted/50 border-muted" 
                    : isDueSoon(task.dueDate)
                    ? "bg-orange-50 border-orange-200"
                    : "bg-white border-gray-200"
                )}
              >
                <div className="flex items-center">
                  {task.complete ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-3 shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
                  )}
                  <div>
                    <p className={cn(
                      "font-medium", 
                      task.complete && "line-through text-muted-foreground"
                    )}>
                      {task.title}
                    </p>
                    {task.module && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {task.module}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-sm whitespace-nowrap",
                    isDueSoon(task.dueDate) && !task.complete 
                      ? "text-orange-600 font-medium" 
                      : "text-muted-foreground"
                  )}>
                    {formatDueDate(task.dueDate)}
                  </span>
                  
                  {onCompleteTask && !task.complete && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="whitespace-nowrap"
                      onClick={() => onCompleteTask(task.id)}
                    >
                      Mark Done
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingTasks;
