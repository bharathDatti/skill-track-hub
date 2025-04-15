
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface RoadmapFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: 'all' | 'in-progress' | 'completed';
  setActiveTab: (tab: 'all' | 'in-progress' | 'completed') => void;
  selectedCourseType: string;
  setSelectedCourseType: (type: string) => void;
  courseTypes: string[];
}

export const RoadmapFilters = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  selectedCourseType,
  setSelectedCourseType,
  courseTypes
}: RoadmapFiltersProps) => {
  return (
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
  );
};
