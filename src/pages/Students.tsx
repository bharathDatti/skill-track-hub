
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';

interface Student {
  id: string;
  full_name: string | null;
  email?: string;
  batch_name?: string;
  status: 'active' | 'inactive' | 'pending';
  progress: number;
  avatar_url: string | null;
}

interface BatchEnrollment {
  id: string;
  batch_id: string;
  student_id: string;
  status: string;
  batch_name?: string;
}

const Students = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setIsError(false);

      // Get all profiles with 'student' role
      const { data: studentProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url, created_at')
        .eq('role', 'student');

      if (profilesError) throw profilesError;

      // Get all enrollments
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('batch_enrollments')
        .select('id, batch_id, student_id, status');

      if (enrollmentsError) throw enrollmentsError;

      // Get all batches for batch names
      const { data: batches, error: batchesError } = await supabase
        .from('batches')
        .select('id, name');

      if (batchesError) throw batchesError;

      // Create a map of batch IDs to names
      const batchMap = batches.reduce((acc: Record<string, string>, batch) => {
        acc[batch.id] = batch.name;
        return acc;
      }, {});

      // Enhance enrollments with batch names
      const enhancedEnrollments = enrollments.map((enrollment: any) => ({
        ...enrollment,
        batch_name: batchMap[enrollment.batch_id] || 'Unknown Batch'
      }));

      // Group enrollments by student
      const studentEnrollments = enhancedEnrollments.reduce((acc: Record<string, BatchEnrollment[]>, enrollment) => {
        if (!acc[enrollment.student_id]) {
          acc[enrollment.student_id] = [];
        }
        acc[enrollment.student_id].push(enrollment);
        return acc;
      }, {});

      // Format student data
      const formattedStudents = studentProfiles.map((profile) => {
        const studentEnrollment = studentEnrollments[profile.id]?.[0];
        return {
          id: profile.id,
          full_name: profile.full_name,
          // For demo purposes, create a dummy email
          email: `student_${profile.id.substring(0, 8)}@example.com`,
          batch_name: studentEnrollment?.batch_name || 'Not Enrolled',
          // Determine status based on enrollment
          status: studentEnrollment ? 
            (studentEnrollment.status === 'approved' ? 'active' : 
             studentEnrollment.status === 'pending' ? 'pending' : 'inactive') : 
            'inactive',
          // Random progress for demo
          progress: Math.floor(Math.random() * 101),
          avatar_url: profile.avatar_url
        } as Student;
      });

      setStudents(formattedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      setIsError(true);
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    // Filter by search query
    const matchesSearch = 
      student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.batch_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by status
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };
  
  const getProgressColorClass = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Redirect if not admin or tutor
  if (currentUser?.role !== 'admin' && currentUser?.role !== 'tutor') {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You don't have permission to view this page.</p>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full sm:w-[250px]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader className="px-6 py-4">
          <CardTitle>All Students</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center flex justify-center items-center">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading students...
            </div>
          ) : isError ? (
            <div className="p-6 text-center text-destructive">Error loading students</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents?.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={student.avatar_url || undefined} />
                            <AvatarFallback>{student.full_name?.[0] || 'S'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.full_name || 'Unnamed Student'}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{student.batch_name}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(student.status)}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getProgressColorClass(student.progress)}`} 
                              style={{ width: `${student.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">{student.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => toast.info('View student details')}>View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info('Edit student details')}>Edit Student</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info('Send message to student')}>Send Message</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Students;
