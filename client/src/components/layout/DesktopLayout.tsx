import { DesktopSidebar } from "@/components/Navbar";
import { ReactNode } from "react";
import { useUser } from "@/contexts/UserContext";
import { useLocation } from "wouter";

interface DesktopLayoutProps {
  children: ReactNode;
}

const DesktopLayout = ({ children }: DesktopLayoutProps) => {
  const { isLoggedIn } = useUser();
  const [location] = useLocation();
  
  // Don't show sidebar on auth page or when not logged in
  const showSidebar = isLoggedIn && location !== "/auth";
  
  // If on auth page, use full width
  const isAuthPage = location === "/auth";
  
  return (
    <div className="max-w-screen-xl mx-auto bg-light min-h-screen hidden md:flex">
      {showSidebar && <DesktopSidebar />}
      <div className={`${showSidebar ? 'w-3/4' : 'w-full'} overflow-y-auto`}>
        <div className={isAuthPage ? 'p-0' : 'p-8'}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default DesktopLayout;
