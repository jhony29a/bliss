import { MobileNavbar } from "@/components/Navbar";
import { ReactNode } from "react";
import { useUser } from "@/contexts/UserContext";
import { useLocation } from "wouter";

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

const MobileLayout = ({ children, showNav = true }: MobileLayoutProps) => {
  const { isLoggedIn } = useUser();
  const [location] = useLocation();
  
  // Don't show navbar on auth page or when not logged in
  const shouldShowNav = isLoggedIn && showNav && location !== "/auth";
  
  // Adjust padding based on navbar visibility
  const isAuthPage = location === "/auth";
  
  return (
    <div className="max-w-screen-xl mx-auto bg-light min-h-screen md:hidden">
      <div className={isAuthPage ? '' : (shouldShowNav ? 'pb-20' : 'pb-0')}>
        {children}
      </div>
      {shouldShowNav && <MobileNavbar />}
    </div>
  );
};

export default MobileLayout;
