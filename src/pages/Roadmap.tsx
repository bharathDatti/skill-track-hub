
import { useState } from 'react';
import { CheckCircle2, Clock, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModuleCard from '@/components/dashboard/ModuleCard';
import { useDemoData } from '@/contexts/DemoDataContext';
import { cn } from '@/lib/utils';

const Roadmap = () => {
  const { modules } = useDemoData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'in-progress' | 'completed'>('all');
  
  // Filter modules based on search query and active tab
  const filteredModules = modules.filter(module => {
    const matchesSearch = 
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.tasks.some(task => task.title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'in-progress') return matchesSearch && !module.complete;
    if (activeTab === 'completed') return matchesSearch && module.complete;
    
    return matchesSearch;
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Learning Roadmap</h1>
        <p className="text-muted-foreground">
          Your 6-month full-stack development learning journey
        </p>
      </div>
      
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search modules or tasks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'all' | 'in-progress' | 'completed')}
          className="w-full sm:w-auto"
        >
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="in-progress" className="flex-1">In Progress</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Roadmap Overview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Sidebar */}
        <div className="md:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progress Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completed Modules</span>
                <span className="font-medium">
                  {modules.filter(m => m.complete).length}/{modules.length}
                </span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(modules.filter(m => m.complete).length / modules.length) * 100}%` }}
                />
              </div>
              
              <div className="pt-2 space-y-2">
                {modules.map((module, index) => (
                  <div key={module.id} className="flex items-center gap-2">
                    <div className={cn(
                      "h-6 w-6 rounded-full flex items-center justify-center text-xs",
                      module.complete 
                        ? "bg-primary text-white" 
                        : "border border-gray-300 text-gray-500"
                    )}>
                      {index + 1}
                    </div>
                    <span className={cn(
                      "text-sm truncate",
                      module.complete ? "text-primary font-medium" : "text-muted-foreground"
                    )}>
                      {module.title.replace(/^Month \d+: /, '')}
                    </span>
                    {module.complete ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400 ml-auto shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="md:col-span-9">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredModules.length > 0 ? (
              filteredModules.map((module) => (
                <ModuleCard key={module.id} {...module} showTasks={true} />
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
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveTab('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
