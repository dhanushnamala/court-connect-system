
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, isAuthenticated } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-md bg-court-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">CCS</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-court-primary">Court Connect System</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-sm text-court-accent hover:text-court-primary">
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Demo accounts (password: password):</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>admin@example.com (Admin)</li>
                  <li>lawyer@example.com (Lawyer)</li>
                  <li>judge@example.com (Judge)</li>
                  <li>client@example.com (Client)</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-court-primary hover:bg-court-primary/90" disabled={isLoading}>
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
