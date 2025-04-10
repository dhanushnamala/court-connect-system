
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import CaseDetail from "./pages/CaseDetail";
import Calendar from "./pages/Calendar";
import Documents from "./pages/Documents";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";
import ContactUs from "./pages/ContactUs";
import Queries from "./pages/Queries";
import LearnMore from "./pages/LearnMore";
import AdminCreation from "./pages/AdminCreation";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Admin-only route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { role, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

// App routes with authentication
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<SignUp />} />
    <Route path="/learn-more" element={<LearnMore />} />
    <Route path="/contact-us" element={<ContactUs />} />
    
    {/* Protected routes */}
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } />
    
    <Route path="/cases" element={
      <ProtectedRoute>
        <Cases />
      </ProtectedRoute>
    } />
    
    <Route path="/cases/:id" element={
      <ProtectedRoute>
        <CaseDetail />
      </ProtectedRoute>
    } />
    
    <Route path="/calendar" element={
      <ProtectedRoute>
        <Calendar />
      </ProtectedRoute>
    } />
    
    <Route path="/documents" element={
      <ProtectedRoute>
        <Documents />
      </ProtectedRoute>
    } />
    
    {/* Admin-only routes */}
    <Route path="/users" element={
      <AdminRoute>
        <Users />
      </AdminRoute>
    } />
    
    <Route path="/queries" element={
      <AdminRoute>
        <Queries />
      </AdminRoute>
    } />
    
    <Route path="/admin/create" element={
      <AdminRoute>
        <AdminCreation />
      </AdminRoute>
    } />
    
    {/* Catch-all route */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
