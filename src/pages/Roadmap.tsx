
import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useDemoData, Module } from '@/contexts/DemoDataContext';
import { useAuthStore } from '@/store/authStore';
import { RoadmapFilters } from '@/components/roadmap/RoadmapFilters';
import { CourseTypeSelector } from '@/components/roadmap/CourseTypeSelector';
import { ModuleList } from '@/components/roadmap/ModuleList';
import { ModuleDialog } from '@/components/roadmap/ModuleDialog';
import { DeleteModuleDialog } from '@/components/roadmap/DeleteModuleDialog';

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
  const { modules, addModule, updateModule, deleteModule } = useDemoData();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [selectedCourseType, setSelectedCourseType] = useState<string>("Web Development");
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  
  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    courseType: 'Web Development',
    duration_weeks: 1,
    tasks: []
  });

  // Filter modules based on search query, active tab, and course type
  const filteredModules = modules.filter(module => {
    const matchesSearch = 
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.tasks.some(task => task.title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTab = activeTab === 'all' ? true : 
      activeTab === 'in-progress' ? !module.complete : module.complete;
    
    const matchesCourseType = module.courseType === selectedCourseType || !selectedCourseType;
    
    return matchesSearch && matchesTab && matchesCourseType;
  });

  // Check if user can edit roadmaps (admin or tutor)
  const canEditRoadmap = user?.role === 'admin' || user?.role === 'tutor';

  const handleAddModule = () => {
    if (!newModule.title.trim()) {
      toast.error("Module title is required");
      return;
    }
    
    const id = `module-${Date.now()}`;
    const module: Module = {
      id,
      title: `${selectedCourseType}: ${newModule.title}`,
      description: newModule.description,
      courseType: selectedCourseType,
      duration_weeks: newModule.duration_weeks,
      complete: false,
      progress: 0,
      tasks: []
    };
    
    addModule(module);
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
    
    updateModule(currentModule.id, currentModule);
    setIsEditDialogOpen(false);
    toast.success("Roadmap module updated successfully");
  };
  
  const handleDeleteModule = () => {
    if (!currentModule) return;
    deleteModule(currentModule.id);
    setIsDeleteDialogOpen(false);
    setCurrentModule(null);
    toast.success("Roadmap module deleted successfully");
  };

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
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Module
          </Button>
        )}
      </div>
      
      <CourseTypeSelector
        selectedCourseType={selectedCourseType}
        setSelectedCourseType={setSelectedCourseType}
        courseTypes={courseTypes}
      />
      
      <RoadmapFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCourseType={selectedCourseType}
        setSelectedCourseType={setSelectedCourseType}
        courseTypes={courseTypes}
      />
      
      <ModuleList
        modules={filteredModules}
        canEditRoadmap={canEditRoadmap}
        onEditModule={(module) => {
          setCurrentModule(module);
          setIsEditDialogOpen(true);
        }}
        onDeleteModule={(module) => {
          setCurrentModule(module);
          setIsDeleteDialogOpen(true);
        }}
      />
      
      <ModuleDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddModule}
        module={newModule}
        setModule={setNewModule}
        courseTypes={courseTypes}
        mode="add"
      />
      
      <ModuleDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleEditModule}
        module={currentModule || {}}
        setModule={setCurrentModule}
        courseTypes={courseTypes}
        mode="edit"
      />
      
      <DeleteModuleDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteModule}
      />
    </div>
  );
};

export default Roadmap;
