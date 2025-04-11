
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle } from "lucide-react";
import ProgressRing from "./ProgressRing";

interface Task {
  id: string;
  title: string;
  complete: boolean;
  dueDate: string;
}

interface ModuleProps {
  id: string;
  title: string;
  description: string;
  progress: number;
  complete: boolean;
  tasks: Task[];
  showTasks?: boolean;
}

const ModuleCard = ({ 
  id, 
  title, 
  description, 
  progress, 
  complete, 
  tasks, 
  showTasks = false
}: ModuleProps) => {
  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">
          {title}
        </CardTitle>
        {complete ? (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">Completed</Badge>
        ) : (
          <Badge variant="outline" className="text-brand-amber border-brand-amber">In Progress</Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4">
          <ProgressRing progress={progress} />
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        
        {showTasks && tasks.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Tasks:</h4>
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li 
                  key={task.id} 
                  className="flex items-center text-sm"
                >
                  {task.complete ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-400 mr-2" />
                  )}
                  <span className={task.complete ? "line-through text-gray-500" : ""}>
                    {task.title}
                  </span>
                  <span className="ml-auto text-xs text-gray-500">
                    Due {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModuleCard;
