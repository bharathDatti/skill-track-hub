
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
};

const Batches = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const isAdmin = user?.role === 'admin';
  const isTutor = user?.role === 'tutor';
  const isStudent = user?.role === 'student';
  
  // Fetch batches and enrollments
  useEffect(() => {
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
            setEnrollments(enrollmentsData);
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
            setEnrollments(enrollmentsData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Could not load batches");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBatches();
    }
  }, [user, isAdmin, isTutor, isStudent]);

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
      if (data) setEnrollments(data);
      
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

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Available Batches</h1>
        {isAdmin && (
          <Button onClick={() => navigate("/batches/create")}>
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
          <p>Loading batches...</p>
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
                <CardTitle>{batch.name}</CardTitle>
                {batch.start_date && batch.end_date && (
                  <CardDescription>
                    {format(new Date(batch.start_date), "MMM d, yyyy")} - 
                    {format(new Date(batch.end_date), "MMM d, yyyy")}
                  </CardDescription>
                )}
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
    </div>
  );
};

export default Batches;
