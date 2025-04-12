
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import { Search, MoreVertical } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Student {
  id: string;
  name: string;
  email: string;
  batch: string;
  status: 'active' | 'inactive' | 'pending';
  progress: number;
  avatar?: string;
}

const Students = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { data: students, isLoading, isError } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      // In a real app, this would fetch data from your Supabase database
      // For now, we're returning mock data
      return [
        {
          id: '1',
          name: 'Alex Johnson',
          email: 'alex@example.com',
          batch: 'Batch 3 - Frontend',
          status: 'active',
          progress: 75,
          avatar: ''
        },
        {
          id: '2',
          name: 'Emma Williams',
          email: 'emma@example.com',
          batch: 'Batch 2 - Backend',
          status: 'active',
          progress: 60,
          avatar: ''
        },
        {
          id: '3',
          name: 'Michael Brown',
          email: 'michael@example.com',
          batch: 'Batch 3 - Frontend',
          status: 'inactive',
          progress: 40,
          avatar: ''
        },
        {
          id: '4',
          name: 'Olivia Davis',
          email: 'olivia@example.com',
          batch: 'Batch 1 - Full Stack',
          status: 'pending',
          progress: 0,
          avatar: ''
        }
      ] as Student[];
    }
  });
  
  const filteredStudents = students?.filter(student => {
    // Filter by search query
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.batch.toLowerCase().includes(searchQuery.toLowerCase());
    
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
            <div className="p-6 text-center">Loading students...</div>
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
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback>{student.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{student.batch}</TableCell>
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
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Student</DropdownMenuItem>
                            <DropdownMenuItem>Send Message</DropdownMenuItem>
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
