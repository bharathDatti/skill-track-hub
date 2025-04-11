
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { demoUsers } from '@/contexts/DemoDataContext';
import { useAuthStore, UserRole } from '@/store/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Demo login logic
      setTimeout(() => {
        // Find the demo user with matching email (case insensitive)
        const userKey = Object.keys(demoUsers).find(
          (key) => demoUsers[key as keyof typeof demoUsers].email.toLowerCase() === email.toLowerCase()
        ) as keyof typeof demoUsers | undefined;
        
        if (userKey && password === 'password') {
          const demoUser = demoUsers[userKey];
          
          // Convert to proper User type with correct role typing
          const user = {
            id: demoUser.id,
            name: demoUser.name,
            email: demoUser.email,
            role: demoUser.role as UserRole,
            avatar: demoUser.avatar
          };
          
          // Simulate login with properly typed user
          login('demo-token', user);
          navigate('/dashboard');
          toast.success('Logged in successfully');
        } else {
          toast.error('Invalid credentials. Try using one of the demo accounts.');
        }
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      toast.error('Failed to login. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">DevMastery</h1>
          <p className="text-gray-600 mt-2">Learning Management Platform</p>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="email@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a 
                    href="#" 
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              
              <div className="text-sm space-y-1">
                <p>Demo Accounts (Password: "password"):</p>
                <ul className="list-disc pl-5 text-muted-foreground">
                  <li>admin@devmastery.com (Admin)</li>
                  <li>tutor@devmastery.com (Tutor)</li>
                  <li>student@devmastery.com (Student)</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
