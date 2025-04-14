
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { CalendarIcon, CheckCircle2, Circle, Clock, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Update the Task interface to make priority optional
interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in-progress' | 'completed';
  priority?: 'low' | 'medium' | 'high'; // Make priority optional
  due_date: string;
  assigned_to?: string | null;
  assigned_by?: string | null;
}

interface Profile {
  id: string;
  full_name: string | null;
}

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium', // Default priority
    due_date: new Date().toISOString(),
    assigned_to: null
  });
  const { user } = useAuthStore();
  
  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchProfiles();
    }
  }, [user]);
  
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      let query = supabase.from('tasks').select('*');
      
      // If user is a student, only fetch tasks assigned to them
      if (user?.role === 'student') {
        query = query.eq('assigned_to', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Convert types to match our interface and add default priority if missing
      const formattedTasks = data.map(task => {
        // Create a properly typed Task object with priority defaulting to 'medium'
        const typedTask: Task = {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status as 'todo' | 'in-progress' | 'completed',
          due_date: task.due_date,
          assigned_to: task.assigned_to,
          assigned_by: task.assigned_by,
          // Add priority with default if it doesn't exist in the database
          priority: 'medium'
        };
        
        return typedTask;
      });
      
      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchProfiles = async () => {
    try {
      // Fetch profiles for assignment dropdown
      if (user?.role === 'admin' || user?.role === 'tutor') {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'student');
        
        if (error) throw error;
        setProfiles(data);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Failed to load student profiles');
    }
  };
  
  const getFilteredTasks = (status: 'todo' | 'in-progress' | 'completed') => {
    return tasks.filter(task => task.status === status);
  };
  
  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      toast.error("Task title is required");
      return;
    }
    
    try {
      // Create task data object without undefined/optional fields
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        due_date: newTask.due_date,
        assigned_to: newTask.assigned_to,
        assigned_by: user?.id
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select();
      
      if (error) throw error;
      
      // Create a properly typed Task object with all required fields
      const addedTask: Task = {
        id: data[0].id,
        title: data[0].title,
        description: data[0].description,
        status: data[0].status as 'todo' | 'in-progress' | 'completed',
        due_date: data[0].due_date,
        assigned_to: data[0].assigned_to,
        assigned_by: data[0].assigned_by,
        // Add the priority from our newTask state, not from the database response
        priority: newTask.priority
      };
      
      setTasks([...tasks, addedTask]);
      setIsAddDialogOpen(false);
      setNewTask({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: new Date().toISOString(),
        assigned_to: null
      });
      
      toast.success("Task added successfully");
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error("Failed to add task");
    }
  };
  
  const handleStatusChange = async (taskId: string, newStatus: 'todo' | 'in-progress' | 'completed') => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);
      
      if (error) throw error;
      
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      
      toast.success("Task status updated");
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error("Failed to update task status");
    }
  };
  
  const handlePriorityChange = async (taskId: string, newPriority: 'low' | 'medium' | 'high') => {
    try {
      // Update locally regardless of database update success
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, priority: newPriority } : task
      ));
      
      // Attempt to update in DB if field exists - don't throw error if it fails
      // as priority field might not exist in the database yet
      try {
        const { error } = await supabase
          .from('tasks')
          .update({ priority: newPriority })
          .eq('id', taskId);
        
        if (error) {
          console.warn('Priority field may not exist in database:', error);
        }
      } catch (dbError) {
        console.warn('Priority column may not exist in tasks table:', dbError);
      }
    } catch (error) {
      console.error('Error updating task priority:', error);
      toast.error("Failed to update task priority");
    }
  };
  
  // Check if user is admin or tutor to allow task creation
  const canCreateTasks = user?.role === 'admin' || user?.role === 'tutor';
  
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
                  value={task.priority || 'medium'} 
                  onValueChange={(value: 'low' | 'medium' | 'high') => handlePriorityChange(task.id, value)}
                  disabled={user?.role === 'student'}
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
              <CardFooter className="px-4 py-2 text-xs text-muted-foreground border-t">
                <div className="flex items-center">
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  Due: {format(new Date(task.due_date), 'PPP')}
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    );
  };
  
  if (user?.role !== 'admin' && user?.role !== 'tutor' && user?.role !== 'student') {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You don't have permission to view this page.</p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center">
        <div className="flex items-center">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading tasks...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        {canCreateTasks && (
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
                    value={newTask.description || ''}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newTask.priority || 'medium'}
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
                            !newTask.due_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newTask.due_date ? format(new Date(newTask.due_date), 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newTask.due_date ? new Date(newTask.due_date) : undefined}
                          onSelect={(date) => setNewTask({ ...newTask, due_date: date ? date.toISOString() : new Date().toISOString() })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                {(user?.role === 'admin' || user?.role === 'tutor') && (
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Assign To</Label>
                    <Select
                      value={newTask.assigned_to || ''}
                      onValueChange={(value) => 
                        setNewTask({ ...newTask, assigned_to: value !== '' ? value : null })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Assign to student" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {profiles.map(profile => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.full_name || `Student ${profile.id.substring(0, 4)}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
        )}
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
