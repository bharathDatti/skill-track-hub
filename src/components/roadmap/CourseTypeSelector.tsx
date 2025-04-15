
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CourseTypeSelectorProps {
  selectedCourseType: string;
  setSelectedCourseType: (type: string) => void;
  courseTypes: string[];
}

export const CourseTypeSelector = ({
  selectedCourseType,
  setSelectedCourseType,
  courseTypes
}: CourseTypeSelectorProps) => {
  return (
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
  );
};
