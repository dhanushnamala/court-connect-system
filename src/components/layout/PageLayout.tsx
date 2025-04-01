
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
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
