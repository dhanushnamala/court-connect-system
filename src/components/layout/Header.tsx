import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Bell, Mail, Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, role, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Button 
            variant="ghost" 
            className="md:hidden" 
            size="icon"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-court-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">CCS</span>
            </div>
            <span className="hidden font-bold text-xl text-court-primary md:inline-block">Court Connect</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <nav className="flex items-center gap-4">
            <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link to="/cases" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Cases
            </Link>
            <Link to="/calendar" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Calendar
            </Link>
            
            {role === "admin" ? (
              <Link to="/queries" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Queries
              </Link>
            ) : (
              <Link to="/contact-us" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            )}
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder.svg" alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Mobile navigation menu */}
      <div className={cn(
        "fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md animate-in slide-in-from-bottom-80 md:hidden",
        showMobileMenu ? "block bg-background" : "hidden"
      )}>
        <div className="relative z-20 grid gap-6 p-4 rounded-md bg-background">
          <nav className="grid grid-flow-row auto-rows-max text-sm">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
              onClick={() => setShowMobileMenu(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/cases" 
              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
              onClick={() => setShowMobileMenu(false)}
            >
              Cases
            </Link>
            <Link 
              to="/calendar" 
              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
              onClick={() => setShowMobileMenu(false)}
            >
              Calendar
            </Link>
            {role === "admin" && (
              <Link 
                to="/users" 
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                onClick={() => setShowMobileMenu(false)}
              >
                Users
              </Link>
            )}
            
            {role === "admin" ? (
              <Link 
                to="/queries" 
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                onClick={() => setShowMobileMenu(false)}
              >
                Queries
              </Link>
            ) : (
              <Link 
                to="/contact-us" 
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                onClick={() => setShowMobileMenu(false)}
              >
                Contact
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
