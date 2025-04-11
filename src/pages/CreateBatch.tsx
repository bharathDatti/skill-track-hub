
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";

type FormValues = {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
};

const CreateBatch = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Redirect if not admin
  if (user?.role !== "admin") {
    navigate("/dashboard");
    toast.error("You don't have permission to access this page");
    return null;
  }

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      description: "",
      start_date: "",
      end_date: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast.error("You must be logged in to create a batch");
      return;
    }

    try {
      setLoading(true);
      // Ensure we're using the actual UUID from the user object, not just the id property
      // which might not be in the proper UUID format
      const { error } = await supabase.from("batches").insert({
        name: data.name,
        description: data.description,
        start_date: data.start_date,
        end_date: data.end_date,
        created_by: user.id, // Make sure this is a valid UUID
      });

      if (error) {
        console.error("Error details:", error);
        throw error;
      }
      
      toast.success("Batch created successfully");
      navigate("/batches");
    } catch (error) {
      console.error("Error creating batch:", error);
      toast.error("Failed to create batch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Batch</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Batch Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter batch name" {...field} required />
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
                  <Textarea
                    placeholder="Enter batch description"
                    {...field}
                    rows={5}
                  />
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
                  <FormDescription>
                    When will the batch begin?
                  </FormDescription>
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
                  <FormDescription>
                    When will the batch end?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/batches")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Batch"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateBatch;
