
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const Statistics = () => {
  // Example data - in a real app these would come from an API
  const batchData = [
    { name: 'Jan', students: 40 },
    { name: 'Feb', students: 55 },
    { name: 'Mar', students: 70 },
    { name: 'Apr', students: 90 },
    { name: 'May', students: 60 },
    { name: 'Jun', students: 75 },
  ];
  
  const completionData = [
    { name: 'Week 1', completed: 85, pending: 15 },
    { name: 'Week 2', completed: 70, pending: 30 },
    { name: 'Week 3', completed: 60, pending: 40 },
    { name: 'Week 4', completed: 50, pending: 50 },
    { name: 'Week 5', completed: 40, pending: 60 },
  ];
  
  const roleDistributionData = [
    { name: 'Students', value: 120, color: '#22c55e' },
    { name: 'Tutors', value: 15, color: '#3b82f6' },
    { name: 'Admins', value: 5, color: '#ef4444' },
  ];
  
  const enrollmentData = [
    { name: 'Frontend Dev', enrolled: 45 },
    { name: 'Backend Dev', enrolled: 30 },
    { name: 'Mobile Dev', enrolled: 25 },
    { name: 'DevOps', enrolled: 20 },
    { name: 'UI/UX', enrolled: 35 },
  ];
  
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Statistics</h1>
      
      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="completion">Completion Rates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Distribution of users by role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleDistributionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {roleDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>New Students by Month</CardTitle>
                <CardDescription>Number of new students enrolled per month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={batchData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="students" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="enrollments">
          <Card>
            <CardHeader>
              <CardTitle>Course Enrollments</CardTitle>
              <CardDescription>Number of students enrolled in each course</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="enrolled" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completion">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Assignment Completion</CardTitle>
              <CardDescription>Assignment completion rates per week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" stackId="a" fill="#22c55e" />
                    <Bar dataKey="pending" stackId="a" fill="#f43f5e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Statistics;
