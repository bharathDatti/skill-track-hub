
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { CalendarIcon, CheckCircle2, Circle, Clock, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date | null;
  assignedTo?: string;
}

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Review student submissions',
      description: 'Grade the React project submissions for Batch 3',
      status: 'todo',
      priority: 'high',
      dueDate: new Date(2025, 3, 20)
    },
    {
      id: '2',
      title: 'Prepare workshop materials',
      description: 'Create slides and examples for the React hooks workshop',
      status: 'in-progress',
      priority: 'medium',
      dueDate: new Date(2025, 3, 25)
    },
    {
      id: '3',
      title: 'Update curriculum',
      description: 'Add TypeScript modules to the frontend curriculum',
      status: 'completed',
      priority: 'low',
      dueDate: new Date(2025, 3, 15)
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: null
  });
  
  const getFilteredTasks = (status: 'todo' | 'in-progress' | 'completed') => {
    return tasks.filter(task => task.status === status);
  };
  
  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      toast.error("Task title is required");
      return;
    }
    
    const task: Task = {
      ...newTask,
      id: Date.now().toString()
    };
    
    setTasks([...tasks, task]);
    setIsAddDialogOpen(false);
    setNewTask({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: null
    });
    
    toast.success("Task added successfully");
  };
  
  const handleStatusChange = (taskId: string, newStatus: 'todo' | 'in-progress' | 'completed') => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    
    toast.success("Task status updated");
  };
  
  const handlePriorityChange = (taskId: string, newPriority: 'low' | 'medium' | 'high') => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, priority: newPriority } : task
    ));
  };
  
  const TaskList = ({ status }: { status: 'todo' | 'in-progress' | 'completed' }) => {
    const filteredTasks = getFilteredTasks(status);
    
    return (
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center p-6 bg-muted/40 rounded-lg">
            <p className="text-muted-foreground">No tasks</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <Card key={task.id} className={cn(
              "transition-all",
              task.status === 'completed' && "opacity-70"
            )}>
              <CardHeader className="px-4 py-3 flex flex-row items-start justify-between space-y-0 gap-2">
                <div className="flex items-start gap-2">
                  <Checkbox 
                    checked={task.status === 'completed'}
                    onCheckedChange={() => {
                      const newStatus = task.status === 'completed' ? 'todo' : 'completed';
                      handleStatusChange(task.id, newStatus);
                    }}
                  />
                  <div>
                    <CardTitle className={cn(
                      "text-base",
                      task.status === 'completed' && "line-through text-muted-foreground"
                    )}>
                      {task.title}
                    </CardTitle>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    )}
                  </div>
                </div>
                <Select 
                  value={task.priority} 
                  onValueChange={(value: 'low' | 'medium' | 'high') => handlePriorityChange(task.id, value)}
                >
                  <SelectTrigger className="w-24 h-7">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              {task.dueDate && (
                <CardFooter className="px-4 py-2 text-xs text-muted-foreground border-t">
                  <div className="flex items-center">
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    Due: {format(task.dueDate, 'PPP')}
                  </div>
                </CardFooter>
              )}
            </Card>
          ))
        )}
      </div>
    );
  };
  
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Add a new task to your list
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Task description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high') => 
                      setNewTask({ ...newTask, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newTask.dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newTask.dueDate ? format(newTask.dueDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newTask.dueDate || undefined}
                        onSelect={(date) => setNewTask({ ...newTask, dueDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTask}>
                Add Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="todo" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="todo" className="flex gap-2 items-center">
            <Circle className="h-4 w-4" /> To Do ({getFilteredTasks('todo').length})
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="flex gap-2 items-center">
            <Clock className="h-4 w-4" /> In Progress ({getFilteredTasks('in-progress').length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex gap-2 items-center">
            <CheckCircle2 className="h-4 w-4" /> Completed ({getFilteredTasks('completed').length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="todo">
          <TaskList status="todo" />
        </TabsContent>
        
        <TabsContent value="in-progress">
          <TaskList status="in-progress" />
        </TabsContent>
        
        <TabsContent value="completed">
          <TaskList status="completed" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tasks;
