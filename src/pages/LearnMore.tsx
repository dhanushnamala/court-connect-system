
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, FileText, Gavel, Shield } from "lucide-react";

const LearnMore = () => {
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
          <div>
            <Link to="/login">
              <Button className="bg-court-primary hover:bg-court-primary/90 mr-2">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center mb-8">
              <Link to="/">
                <Button variant="ghost" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-court-primary mb-8">
              About Court Connect System
            </h1>
            
            <div className="prose max-w-none">
              <p className="text-xl text-gray-700 mb-8">
                Court Connect is a comprehensive digital solution designed to streamline court case management
                and improve accessibility and efficiency in the judicial system.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700">
                Our mission is to modernize the judicial process by providing intuitive, secure, and efficient 
                digital tools for all stakeholders in the legal system. We aim to reduce administrative burden,
                increase transparency, and improve access to justice.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-6">Key Benefits</h2>
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-green-50 p-2">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium mb-2">Enhanced Efficiency</h3>
                      <p className="text-gray-600">
                        Automated workflows, document management, and calendar synchronization
                        help reduce manual work and streamline court operations.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-green-50 p-2">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium mb-2">Improved Accessibility</h3>
                      <p className="text-gray-600">
                        24/7 access to case information, documents, and schedules for
                        authorized users from any device with internet connection.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-green-50 p-2">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium mb-2">Enhanced Security</h3>
                      <p className="text-gray-600">
                        Role-based access controls, audit trails, and industry-standard
                        encryption to protect sensitive legal information.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-green-50 p-2">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium mb-2">Cost Reduction</h3>
                      <p className="text-gray-600">
                        Significant reductions in paper usage, storage costs, and administrative
                        overhead through digitization of processes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-6">Who Uses Court Connect?</h2>
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-court-primary/10 text-court-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gavel className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Judges</h3>
                  <p className="text-gray-600">
                    Access case details, manage hearings, and issue orders electronically.
                  </p>
                </div>
                
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-court-primary/10 text-court-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Legal Professionals</h3>
                  <p className="text-gray-600">
                    File motions, track cases, and communicate securely with the court.
                  </p>
                </div>
                
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-court-primary/10 text-court-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Court Administration</h3>
                  <p className="text-gray-600">
                    Manage court operations, staff scheduling, and resource allocation.
                  </p>
                </div>
              </div>
              
              <div className="bg-court-primary text-white p-8 rounded-lg text-center my-12">
                <h2 className="text-3xl font-bold mb-4">Ready to transform your court management?</h2>
                <p className="text-xl mb-6">Join courts across the country that are already benefiting from our system.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/signup">
                    <Button size="lg" className="bg-white text-court-primary hover:bg-gray-100">
                      Create an Account
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-court-primary/90">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
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

export default LearnMore;
