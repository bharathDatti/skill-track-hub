
import { useState } from 'react';
import { CheckCircle2, CheckCheck, Clock, LayoutList, Trophy, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from '@/components/dashboard/StatCard';
import ProgressRing from '@/components/dashboard/ProgressRing';
import ModuleCard from '@/components/dashboard/ModuleCard';
import AnnouncementCard from '@/components/dashboard/AnnouncementCard';
import UpcomingTasks from '@/components/dashboard/UpcomingTasks';
import { useDemoData } from '@/contexts/DemoDataContext';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

// Helper function to calculate overall progress
const calculateOverallProgress = (modules: any[]) => {
  if (modules.length === 0) return 0;
  return modules.reduce((sum, module) => sum + module.progress, 0) / modules.length;
};

// Helper function to flatten tasks from all modules
const flattenTasks = (modules: any[]) => {
  return modules.flatMap(module => 
    module.tasks.map((task: any) => ({
      ...task,
      module: module.title
    }))
  );
};

// Helper to count completed tasks
const countCompletedTasks = (tasks: any[]) => {
  return tasks.filter(task => task.complete).length;
};

const Dashboard = () => {
  const { modules, announcements } = useDemoData();
  const { user } = useAuthStore();
  const [localModules, setLocalModules] = useState(modules);
  
  const overallProgress = calculateOverallProgress(localModules);
  const allTasks = flattenTasks(localModules);
  const completedTasksCount = countCompletedTasks(allTasks);
  const pendingTasksCount = allTasks.length - completedTasksCount;
  
  const currentModuleIndex = localModules.findIndex(m => m.progress < 100);
  const currentModule = currentModuleIndex >= 0 ? localModules[currentModuleIndex] : localModules[localModules.length - 1];
  
  // Get upcoming tasks (incomplete and sorted by due date)
  const upcomingTasks = allTasks
    .filter(task => !task.complete)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5); // Get only 5 upcoming tasks
    
  const handleCompleteTask = (taskId: string) => {
    // Find the task in the modules and mark it as complete
    const updatedModules = localModules.map(module => {
      const taskIndex = module.tasks.findIndex((task: any) => task.id === taskId);
      
      if (taskIndex !== -1) {
        const updatedTasks = [...module.tasks];
        updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], complete: true };
        
        // Calculate new progress
        const completedTasks = updatedTasks.filter((t: any) => t.complete).length;
        const progress = Math.round((completedTasks / updatedTasks.length) * 100);
        
        return {
          ...module,
          tasks: updatedTasks,
          progress,
          complete: progress === 100
        };
      }
      
      return module;
    });
    
    setLocalModules(updatedModules);
    toast.success('Task marked as complete!');
  };
    
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}!
        </p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Overall Progress"
          value={`${Math.round(overallProgress)}%`}
          icon={<Trophy className="h-4 w-4" />}
          description="of the learning roadmap"
        />
        <StatCard
          title="Completed Tasks"
          value={completedTasksCount}
          icon={<CheckCheck className="h-4 w-4" />}
          trend={
            completedTasksCount > 0
              ? { value: 5, isPositive: true }
              : undefined
          }
        />
        <StatCard
          title="Pending Tasks"
          value={pendingTasksCount}
          icon={<Clock className="h-4 w-4" />}
          description="tasks to complete"
        />
        {user?.role === 'admin' || user?.role === 'tutor' ? (
          <StatCard
            title="Active Students"
            value={10}
            icon={<Users className="h-4 w-4" />}
            trend={{ value: 2, isPositive: true }}
          />
        ) : (
          <StatCard
            title="Learning Streak"
            value="3 days"
            icon={<CheckCircle2 className="h-4 w-4" />}
            description="Keep it going!"
          />
        )}
      </div>
      
      {/* Current Progress & Upcoming Tasks */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Current Module */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Current Module</CardTitle>
            <CardDescription>Your active learning module</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <div className="text-center">
              <ProgressRing 
                progress={currentModule.progress} 
                size={120}
                strokeWidth={10}
                className="mb-4"
              />
              <h3 className="text-xl font-bold">{currentModule.title}</h3>
              <p className="text-muted-foreground mt-1">{currentModule.description}</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Upcoming Tasks */}
        <div className="lg:col-span-2">
          <UpcomingTasks 
            tasks={upcomingTasks} 
            onCompleteTask={handleCompleteTask}
          />
        </div>
      </div>
      
      {/* Recent Learning Modules */}
      <div>
        <h2 className="text-lg font-medium mb-4">Learning Roadmap</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {localModules.slice(0, 3).map((module) => (
            <ModuleCard key={module.id} {...module} />
          ))}
        </div>
      </div>
      
      {/* Recent Announcements */}
      <div>
        <h2 className="text-lg font-medium mb-4">Recent Announcements</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {announcements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
