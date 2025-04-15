
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Module } from "@/contexts/DemoDataContext";

interface ModuleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  module: Partial<Module>;
  setModule: (module: Partial<Module>) => void;
  courseTypes: string[];
  mode: 'add' | 'edit';
}

export const ModuleDialog = ({
  isOpen,
  onClose,
  onSubmit,
  module,
  setModule,
  courseTypes,
  mode
}: ModuleDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New Roadmap Module' : 'Edit Roadmap Module'}</DialogTitle>
          {mode === 'add' && (
            <DialogDescription>
              Create a new module for your learning roadmap
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="courseType">Course Type</Label>
            <Select
              value={module.courseType || "Web Development"}
              onValueChange={(value) => setModule({ ...module, courseType: value })}
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
              value={mode === 'edit' ? module.title?.replace(/^.*?: /, '') : module.title}
              onChange={(e) => setModule({ 
                ...module, 
                title: mode === 'edit' ? `${module.courseType}: ${e.target.value}` : e.target.value
              })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={module.description}
              onChange={(e) => setModule({ ...module, description: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (weeks)</Label>
            <Input
              id="duration"
              type="number"
              min={1}
              value={module.duration_weeks || 1}
              onChange={(e) => setModule({ 
                ...module, 
                duration_weeks: parseInt(e.target.value) || 1
              })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            {mode === 'add' ? 'Add Module' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
