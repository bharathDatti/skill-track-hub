
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DemoDataProvider } from "./contexts/DemoDataContext";

// Layouts
import DashboardLayout from "./components/layout/DashboardLayout";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Roadmap from "./pages/Roadmap";
import NotFound from "./pages/NotFound";
import Batches from "./pages/Batches";
import CreateBatch from "./pages/CreateBatch";
import EnrollmentRequests from "./pages/EnrollmentRequests";

// Private Route component
import { useAuthStore } from "./store/authStore";
import { ReactNode } from "react";

const queryClient = new QueryClient();

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Role-based route protection
const RoleRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: ReactNode;
  allowedRoles: ('admin' | 'tutor' | 'student')[];
}) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (user && user.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DemoDataProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <DashboardLayout />
                </PrivateRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/roadmap" element={<Roadmap />} />
              
              {/* Batch routes - accessible by all authenticated users */}
              <Route path="/batches" element={<Batches />} />
              
              {/* Admin-only routes */}
              <Route 
                path="/batches/create" 
                element={
                  <RoleRoute allowedRoles={['admin']}>
                    <CreateBatch />
                  </RoleRoute>
                } 
              />
              
              {/* Tutor/Admin routes */}
              <Route 
                path="/enrollments" 
                element={
                  <RoleRoute allowedRoles={['admin', 'tutor']}>
                    <EnrollmentRequests />
                  </RoleRoute>
                } 
              />
              
              {/* Add other dashboard routes here */}
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DemoDataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
