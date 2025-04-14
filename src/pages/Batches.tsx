
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2, PlusCircle, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";

// Define types for our data
type Batch = {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
};

type Enrollment = {
  id: string;
  batch_id: string;
  student_id: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  approved_at?: string | null;
  approved_by?: string | null;
};

type BatchFormValues = {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
};

const Batches = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);
  
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const isAdmin = user?.role === 'admin';
  const isTutor = user?.role === 'tutor';
  const isStudent = user?.role === 'student';

  const form = useForm<BatchFormValues>({
    defaultValues: {
      name: "",
      description: "",
      start_date: "",
      end_date: "",
    },
  });
  
  // Fetch batches and enrollments
  useEffect(() => {
    if (user) {
      fetchBatches();
    }
  }, [user]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      
      // Fetch all batches
      const { data: batchesData, error: batchesError } = await supabase
        .from("batches")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (batchesError) throw batchesError;
      
      if (batchesData) {
        setBatches(batchesData);
      }
      
      // If user is a student, fetch their enrollments
      if (isStudent && user) {
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from("batch_enrollments")
          .select("*")
          .eq("student_id", user.id);
          
        if (enrollmentsError) throw enrollmentsError;
        
        if (enrollmentsData) {
          // Cast the data to ensure TypeScript compatibility
          setEnrollments(enrollmentsData.map(e => ({
            ...e,
            status: e.status as "pending" | "approved" | "rejected"
          })));
        }
      }
      
      // If user is a tutor, fetch all enrollments that need approval
      if (isTutor) {
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from("batch_enrollments")
          .select("*")
          .eq("status", "pending");
          
        if (enrollmentsError) throw enrollmentsError;
        
        if (enrollmentsData) {
          // Cast the data to ensure TypeScript compatibility
          setEnrollments(enrollmentsData.map(e => ({
            ...e,
            status: e.status as "pending" | "approved" | "rejected"
          })));
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Could not load batches");
    } finally {
      setLoading(false);
    }
  };

  // Handle enrollment request
  const handleEnroll = async (batchId: string) => {
    if (!user) {
      toast.error("You must be logged in to enroll");
      return;
    }

    try {
      // Check if already enrolled
      const existingEnrollment = enrollments.find(e => e.batch_id === batchId);
      if (existingEnrollment) {
        toast.info("You are already enrolled in this batch");
        return;
      }

      const { error } = await supabase.from("batch_enrollments").insert({
        batch_id: batchId,
        student_id: user.id
      });

      if (error) throw error;
      toast.success("Enrollment request submitted");
      
      // Refresh enrollments
      const { data, error: fetchError } = await supabase
        .from("batch_enrollments")
        .select("*")
        .eq("student_id", user.id);
        
      if (fetchError) throw fetchError;
      if (data) {
        // Cast the data to ensure TypeScript compatibility
        setEnrollments(data.map(e => ({
          ...e,
          status: e.status as "pending" | "approved" | "rejected"
        })));
      }
      
    } catch (error) {
      console.error("Error enrolling:", error);
      toast.error("Could not enroll in batch");
    }
  };

  // Get enrollment status for a batch
  const getEnrollmentStatus = (batchId: string) => {
    const enrollment = enrollments.find(e => e.batch_id === batchId);
    return enrollment ? enrollment.status : null;
  };

  const handleEditBatch = (batch: Batch) => {
    setCurrentBatch(batch);
    form.reset({
      name: batch.name,
      description: batch.description || "",
      start_date: batch.start_date || "",
      end_date: batch.end_date || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteBatch = (batch: Batch) => {
    setCurrentBatch(batch);
    setIsDeleteDialogOpen(true);
  };

  const onSubmitEdit = async (data: BatchFormValues) => {
    if (!currentBatch) return;
    
    try {
      const { error } = await supabase
        .from("batches")
        .update({
          name: data.name,
          description: data.description,
          start_date: data.start_date,
          end_date: data.end_date,
        })
        .eq("id", currentBatch.id);

      if (error) throw error;

      // Update local state
      setBatches(batches.map(batch => 
        batch.id === currentBatch.id ? { 
          ...batch, 
          name: data.name,
          description: data.description,
          start_date: data.start_date,
          end_date: data.end_date
        } : batch
      ));

      toast.success("Batch updated successfully");
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating batch:", error);
      toast.error("Failed to update batch");
    }
  };

  const confirmDeleteBatch = async () => {
    if (!currentBatch) return;
    
    try {
      const { error } = await supabase
        .from("batches")
        .delete()
        .eq("id", currentBatch.id);

      if (error) throw error;

      // Update local state
      setBatches(batches.filter(batch => batch.id !== currentBatch.id));

      toast.success("Batch deleted successfully");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting batch:", error);
      toast.error("Failed to delete batch");
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Available Batches</h1>
        {isAdmin && (
          <Button onClick={() => navigate("/batches/create")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Batch
          </Button>
        )}
        {isTutor && (
          <Button onClick={() => navigate("/enrollments")}>
            View Enrollment Requests
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="flex items-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Loading batches...</p>
          </div>
        </div>
      ) : batches.length === 0 ? (
        <div className="text-center p-10">
          <p>No batches available.</p>
          {isAdmin && (
            <Button className="mt-4" onClick={() => navigate("/batches/create")}>
              Create Your First Batch
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {batches.map((batch) => (
            <Card key={batch.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{batch.name}</CardTitle>
                    {batch.start_date && batch.end_date && (
                      <CardDescription>
                        {format(new Date(batch.start_date), "MMM d, yyyy")} - 
                        {format(new Date(batch.end_date), "MMM d, yyyy")}
                      </CardDescription>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditBatch(batch);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBatch(batch);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {batch.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                {isStudent && (
                  <>
                    {getEnrollmentStatus(batch.id) === "pending" ? (
                      <Badge variant="outline">Enrollment Pending</Badge>
                    ) : getEnrollmentStatus(batch.id) === "approved" ? (
                      <Badge>Enrolled</Badge>
                    ) : getEnrollmentStatus(batch.id) === "rejected" ? (
                      <Badge variant="destructive">Enrollment Rejected</Badge>
                    ) : (
                      <Button onClick={() => handleEnroll(batch.id)}>
                        Enroll
                      </Button>
                    )}
                  </>
                )}
                <Button variant="outline" onClick={() => navigate(`/batches/${batch.id}`)}>
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Batch Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Batch</DialogTitle>
            <DialogDescription>
              Make changes to this batch
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Name</FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Batch</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this batch? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteBatch}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Batches;
