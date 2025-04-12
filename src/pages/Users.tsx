
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
import { Search, Plus } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'tutor' | 'student';
  avatar?: string;
  created_at: string;
}

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // In a real app, this would fetch data from your Supabase database
      // For now, we're returning mock data
      return [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'admin',
          avatar: 'https://github.com/shadcn.png',
          created_at: '2023-01-15T00:00:00Z'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'tutor',
          avatar: '',
          created_at: '2023-02-20T00:00:00Z'
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike@example.com',
          role: 'student',
          avatar: '',
          created_at: '2023-03-10T00:00:00Z'
        }
      ] as User[];
    }
  });
  
  const filteredUsers = users?.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'tutor': return 'default';
      case 'student': return 'secondary';
      default: return 'outline';
    }
  };
  
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="mt-4 md:mt-0 flex gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-[250px]"
            />
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="px-6 py-4">
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center">Loading users...</div>
          ) : isError ? (
            <div className="p-6 text-center text-destructive">Error loading users</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
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

export default Users;
