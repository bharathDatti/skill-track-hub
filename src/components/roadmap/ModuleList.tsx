
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Module } from "@/contexts/DemoDataContext";

interface ModuleListProps {
  modules: Module[];
  canEditRoadmap: boolean;
  onEditModule: (module: Module) => void;
  onDeleteModule: (module: Module) => void;
}

export const ModuleList = ({
  modules,
  canEditRoadmap,
  onEditModule,
  onDeleteModule
}: ModuleListProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {modules.length > 0 ? (
        modules.map((module) => (
          <Card key={module.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle>{module.title}</CardTitle>
                
                {canEditRoadmap && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8.625 2.5C8.625 3.12132 8.12132 3.625 7.5 3.625C6.87868 3.625 6.375 3.12132 6.375 2.5C6.375 1.87868 6.87868 1.375 7.5 1.375C8.12132 1.375 8.625 1.87868 8.625 2.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM8.625 12.5C8.625 13.1213 8.12132 13.625 7.5 13.625C6.87868 13.625 6.375 13.1213 6.375 12.5C6.375 11.8787 6.87868 11.375 7.5 11.375C8.12132 11.375 8.625 11.8787 8.625 12.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditModule(module)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDeleteModule(module)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">{module.description}</p>
              <div className="space-y-3">
                {module.tasks && module.tasks.slice(0, 3).map((task, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="mt-0.5">
                      {task.complete ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className={cn("text-sm", 
                        task.complete && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </p>
                    </div>
                  </div>
                ))}
                
                {module.tasks && module.tasks.length > 3 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    +{module.tasks.length - 3} more tasks
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex justify-between text-xs text-muted-foreground">
              <span>Duration: {module.duration_weeks} {module.duration_weeks === 1 ? 'week' : 'weeks'}</span>
              <span>{module.courseType}</span>
            </CardFooter>
          </Card>
        ))
      ) : (
        <div className="md:col-span-2 flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-gray-100 rounded-full p-4 mb-4">
            <Search className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium">No modules found</h3>
          <p className="text-muted-foreground mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
};
