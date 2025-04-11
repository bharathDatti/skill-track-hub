
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";

type EnrollmentWithDetails = {
  id: string;
  batch_id: string;
  student_id: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  batches: {
    name: string;
  } | null;
};

const EnrollmentRequests = () => {
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Redirect if not tutor or admin
  useEffect(() => {
    if (user && user.role !== "tutor" && user.role !== "admin") {
      navigate("/dashboard");
      toast.error("You don't have permission to access this page");
    }
  }, [user, navigate]);

  // Fetch enrollment requests
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("batch_enrollments")
          .select(`
            *,
            profiles:student_id(full_name, avatar_url),
            batches:batch_id(name)
          `)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) {
          // Cast the data to the correct type to ensure TypeScript compatibility
          const typedData = data.map(item => ({
            ...item,
            status: item.status as "pending" | "approved" | "rejected",
            profiles: item.profiles as { 
              full_name: string | null;
              avatar_url: string | null;
            } | null,
            batches: item.batches
          }));
          
          setEnrollments(typedData);
        }
      } catch (error) {
        console.error("Error fetching enrollment requests:", error);
        toast.error("Failed to load enrollment requests");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEnrollments();
    }
  }, [user]);

  // Handle approval/rejection
  const handleEnrollmentAction = async (
    enrollmentId: string,
    action: "approved" | "rejected"
  ) => {
    try {
      const { error } = await supabase
        .from("batch_enrollments")
        .update({
          status: action,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", enrollmentId);

      if (error) throw error;

      toast.success(`Enrollment ${action} successfully`);
      
      // Update local state
      setEnrollments(enrollments.filter(e => e.id !== enrollmentId));
    } catch (error) {
      console.error(`Error ${action} enrollment:`, error);
      toast.error(`Failed to ${action} enrollment`);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Enrollment Requests</h1>
        <Button variant="outline" onClick={() => navigate("/batches")}>
          Back to Batches
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <p>Loading enrollment requests...</p>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="text-center p-10">
          <p>No pending enrollment requests.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Requested On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell>
                    {enrollment.profiles?.full_name || "Unknown Student"}
                  </TableCell>
                  <TableCell>{enrollment.batches?.name || "Unknown Batch"}</TableCell>
                  <TableCell>
                    {format(new Date(enrollment.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      onClick={() =>
                        handleEnrollmentAction(enrollment.id, "approved")
                      }
                      variant="default"
                      size="sm"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() =>
                        handleEnrollmentAction(enrollment.id, "rejected")
                      }
                      variant="destructive"
                      size="sm"
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default EnrollmentRequests;
