
import { useState } from 'react';
import { CheckCircle2, Clock, PlusCircle, Search, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import ModuleCard from '@/components/dashboard/ModuleCard';
import { useDemoData } from '@/contexts/DemoDataContext';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

// Define course types available in the system
const courseTypes = [
  "Web Development",
  "Java",
  "Python",
  "DevOps",
  "Data Science",
  "Digital Marketing",
  "Machine Learning",
  "Cloud Computing",
  "Mobile Development",
  "UI/UX Design"
];

const Roadmap = () => {
  const { modules } = useDemoData();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [selectedCourseType, setSelectedCourseType] = useState<string>("Web Development");
  
  // Dialog state for creating/editing roadmaps
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState<any>(null);
  
  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    courseType: 'Web Development',
    duration_weeks: 1,
    tasks: []
  });
  
  // Filter modules based on search query, active tab, and course type
  const filteredModules = modules.filter(module => {
    // Filter by search term
    const matchesSearch = 
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.tasks.some(task => task.title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by tab (all, in-progress, or completed)
    let matchesTab = true;
    if (activeTab === 'in-progress') matchesTab = !module.complete;
    if (activeTab === 'completed') matchesTab = module.complete;
    
    // Filter by course type (assuming modules have a courseType property)
    const matchesCourseType = module.courseType === selectedCourseType || !selectedCourseType;
    
    return matchesSearch && matchesTab && matchesCourseType;
  });
  
  const handleAddModule = () => {
    if (!newModule.title.trim()) {
      toast.error("Module title is required");
      return;
    }
    
    // Generate a simple ID for the new module
    const id = `module-${Date.now()}`;
    
    // Create a new module object
    const module = {
      id,
      title: `${selectedCourseType}: ${newModule.title}`,
      description: newModule.description,
      courseType: selectedCourseType,
      duration_weeks: newModule.duration_weeks,
      complete: false,
      progress: 0,
      tasks: []
    };
    
    // Add to demo data modules
    // Note: In a real application, this would save to the database
    useDemoData().addModule(module);
    
    // Reset form and close dialog
    setNewModule({
      title: '',
      description: '',
      courseType: 'Web Development',
      duration_weeks: 1,
      tasks: []
    });
    
    setIsAddDialogOpen(false);
    toast.success("Roadmap module added successfully");
  };
  
  const handleEditModule = () => {
    if (!currentModule || !currentModule.title.trim()) {
      toast.error("Module title is required");
      return;
    }
    
    // Update the module
    // Note: In a real application, this would update the database
    useDemoData().updateModule(currentModule.id, currentModule);
    
    setIsEditDialogOpen(false);
    toast.success("Roadmap module updated successfully");
  };
  
  const handleDeleteModule = () => {
    if (!currentModule) return;
    
    // Delete the module
    // Note: In a real application, this would delete from the database
    useDemoData().deleteModule(currentModule.id);
    
    setIsDeleteDialogOpen(false);
    setCurrentModule(null);
    toast.success("Roadmap module deleted successfully");
  };
  
  // Check if user can edit roadmaps (admin or tutor)
  const canEditRoadmap = user?.role === 'admin' || user?.role === 'tutor';
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Learning Roadmap</h1>
          <p className="text-muted-foreground">
            Course roadmaps for different technologies and skills
          </p>
        </div>
        
        {canEditRoadmap && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Module
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Roadmap Module</DialogTitle>
                <DialogDescription>
                  Create a new module for your learning roadmap
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="courseType">Course Type</Label>
                  <Select
                    value={newModule.courseType}
                    onValueChange={(value) => setNewModule({ ...newModule, courseType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course type" />
                    </SelectTrigger>
                    <SelectContent>
                      {courseTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Module Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Introduction to React"
                    value={newModule.title}
                    onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this module covers..."
                    value={newModule.description}
                    onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (weeks)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    value={newModule.duration_weeks}
                    onChange={(e) => setNewModule({ ...newModule, duration_weeks: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddModule}>
                  Add Module
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {/* Course type selector */}
      <div className="flex flex-wrap gap-2">
        <Select value={selectedCourseType} onValueChange={setSelectedCourseType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select course type" />
          </SelectTrigger>
          <SelectContent>
            {courseTypes.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                  {filteredModules.filter(m => m.complete).length}/{filteredModules.length}
                </span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${filteredModules.length ? (filteredModules.filter(m => m.complete).length / filteredModules.length) * 100 : 0}%` }}
                />
              </div>
              
              <div className="pt-2 space-y-2">
                {filteredModules.map((module, index) => (
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
                      {module.title.replace(/^.*?: /, '')}
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
                            <DropdownMenuItem 
                              onClick={() => {
                                setCurrentModule(module);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setCurrentModule(module);
                                setIsDeleteDialogOpen(true);
                              }}
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
                            {task.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <Circle className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className={cn("text-sm", 
                              task.completed && "line-through text-muted-foreground"
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
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveTab('all');
                    setSelectedCourseType("Web Development");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Edit Module Dialog */}
      {currentModule && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Roadmap Module</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editCourseType">Course Type</Label>
                <Select
                  value={currentModule.courseType || "Web Development"}
                  onValueChange={(value) => setCurrentModule({ ...currentModule, courseType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course type" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editTitle">Module Title</Label>
                <Input
                  id="editTitle"
                  value={currentModule.title?.replace(/^.*?: /, '') || ''}
                  onChange={(e) => setCurrentModule({ 
                    ...currentModule, 
                    title: `${currentModule.courseType}: ${e.target.value}`
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={currentModule.description || ''}
                  onChange={(e) => setCurrentModule({ ...currentModule, description: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editDuration">Duration (weeks)</Label>
                <Input
                  id="editDuration"
                  type="number"
                  min={1}
                  value={currentModule.duration_weeks || 1}
                  onChange={(e) => setCurrentModule({ 
                    ...currentModule, 
                    duration_weeks: parseInt(e.target.value) || 1
                  })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditModule}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      {currentModule && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Roadmap Module</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this module? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteModule}>
                Delete Module
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Roadmap;
