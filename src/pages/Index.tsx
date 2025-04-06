
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Briefcase, FileText, Gavel, Shield } from "lucide-react";

const Index = () => {
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-md bg-court-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">CCS</span>
            </div>
            <span className="font-bold text-xl text-court-primary">Court Connect</span>
          </div>
          <div className="flex gap-2">
            <Link to="/login">
              <Button className="bg-court-primary hover:bg-court-primary/90">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-court-primary mb-6">
              Court Case Management System
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Streamline your legal workflow with our comprehensive case management platform designed for courts, lawyers, and clients.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="bg-court-primary hover:bg-court-primary/90">
                  Get Started
                </Button>
              </Link>
              <Link to="/learn-more">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="w-12 h-12 bg-court-primary/10 text-court-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Case Management</h3>
                <p className="text-gray-600">
                  Track and manage all your legal cases from filing to resolution with comprehensive case details.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="w-12 h-12 bg-court-primary/10 text-court-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Document Repository</h3>
                <p className="text-gray-600">
                  Securely store, organize, and access all case-related documents in one centralized location.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="w-12 h-12 bg-court-primary/10 text-court-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gavel className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Hearing Scheduling</h3>
                <p className="text-gray-600">
                  Easily schedule and track court appearances, avoiding conflicts and managing notifications.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="w-12 h-12 bg-court-primary/10 text-court-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Role-Based Access</h3>
                <p className="text-gray-600">
                  Secure access controls ensure users can only view and modify information relevant to their role.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-court-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to streamline your legal workflow?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join courts, law firms, and legal professionals already using our platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-court-primary hover:bg-gray-100">
                  Sign Up Now
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-court-primary/90">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-white flex items-center justify-center">
                  <span className="text-court-primary font-bold text-sm">CCS</span>
                </div>
                <span className="font-bold text-white">Court Connect</span>
              </div>
              <p className="mt-2 text-sm">Efficient legal case management</p>
            </div>
            <div className="text-sm">
              &copy; {new Date().getFullYear()} Court Connect System. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
