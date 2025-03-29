import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Explore from "@/pages/Explore";
import Matches from "@/pages/Matches";
import Messages from "@/pages/Messages";
import Chat from "@/pages/Chat";
import Profile from "@/pages/Profile";
import Auth from "@/pages/Auth";
import { UserProvider } from "@/contexts/UserContext";
import MobileLayout from "@/components/layout/MobileLayout";
import DesktopLayout from "@/components/layout/DesktopLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/contexts/UserContext";
import InstallBanner from "@/components/InstallBanner";
import OfflineFallback from "@/components/OfflineFallback";
import PWAStatusBadge from "@/components/PWAStatusBadge";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  const isMobile = useIsMobile();
  const [location] = useLocation();
  const { isLoggedIn } = useUser();
  
  // If at auth page and already logged in, redirect to home
  if (location === "/auth" && isLoggedIn) {
    return <Redirect to="/" />;
  }
  
  // For mobile, only show the navbar on main pages
  const shouldShowMobileNav = isMobile && 
    ["/", "/matches", "/messages", "/profile"].includes(location);
  
  // Define routes
  const routes = (
    <Switch>
      <Route path="/auth" component={Auth} />
      <ProtectedRoute path="/" component={Explore} />
      <ProtectedRoute path="/matches" component={Matches} />
      <ProtectedRoute path="/messages" component={Messages} />
      <ProtectedRoute path="/chat/:id" component={Chat} />
      <ProtectedRoute path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
  
  // Render with appropriate layout
  if (isMobile) {
    return (
      <MobileLayout showNav={shouldShowMobileNav}>
        {routes}
      </MobileLayout>
    );
  }
  
  return (
    <DesktopLayout>
      {routes}
    </DesktopLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Router />
        <InstallBanner />
        <PWAStatusBadge />
        <OfflineFallback />
        <Toaster />
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
