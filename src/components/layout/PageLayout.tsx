
import { ReactNode } from "react";
import Header from "./Header";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

const PageLayout = ({ children, className = "" }: PageLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={`flex-1 ${className} bg-slate-50`}>
        {children}
      </main>
      <footer className="py-4 px-6 border-t text-center text-sm text-muted-foreground">
        Court Connect Management System &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default PageLayout;
