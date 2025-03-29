import { Link, useLocation } from "wouter";
import { Heart, Search, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active: boolean;
}

const NavItem = ({ icon, label, href, active }: NavItemProps) => (
  <Link href={href}>
    <a className={cn(
      "flex flex-col items-center p-2 rounded-lg transition-colors",
      active ? "text-primary" : "text-gray-500 hover:text-gray-700"
    )}>
      {icon}
      <span className="text-xs mt-1 font-medium">{label}</span>
    </a>
  </Link>
);

export const MobileNavbar = () => {
  const [location] = useLocation();
  const { user } = useUser();
  
  if (!user) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg py-2 px-6 z-10">
      <div className="flex justify-between items-center">
        <NavItem 
          icon={<Search className="h-5 w-5" />} 
          label="Explorar" 
          href="/" 
          active={location === '/'} 
        />
        
        <NavItem 
          icon={<Heart className="h-5 w-5" />} 
          label="Matches" 
          href="/matches" 
          active={location === '/matches'} 
        />
        
        <NavItem 
          icon={<MessageSquare className="h-5 w-5" />} 
          label="Mensagens" 
          href="/messages" 
          active={location === '/messages' || location.startsWith('/chat/')} 
        />
        
        <NavItem 
          icon={<User className="h-5 w-5" />} 
          label="Perfil" 
          href="/profile" 
          active={location === '/profile'} 
        />
      </div>
    </div>
  );
};

export const DesktopSidebar = () => {
  const [location] = useLocation();
  const { user, logout } = useUser();
  
  if (!user) return null;

  return (
    <div className="w-1/4 bg-white shadow-lg p-6 flex flex-col h-screen">
      <div className="mb-8 flex flex-col items-center">
        <img src="/images/bliss-logo.svg" alt="Bliss Logo" className="h-16 mb-2" />
        <p className="text-gray-500 text-sm">Encontre novas conexões</p>
      </div>
      
      <div className="space-y-4 flex-grow">
        <NavItem 
          icon={<Search className="h-5 w-5 mr-3" />} 
          label="Explorar" 
          href="/" 
          active={location === '/'} 
        />
        
        <NavItem 
          icon={<Heart className="h-5 w-5 mr-3" />} 
          label="Matches" 
          href="/matches" 
          active={location === '/matches'} 
        />
        
        <NavItem 
          icon={<MessageSquare className="h-5 w-5 mr-3" />} 
          label="Mensagens" 
          href="/messages" 
          active={location === '/messages' || location.startsWith('/chat/')} 
        />
        
        <NavItem 
          icon={<User className="h-5 w-5 mr-3" />} 
          label="Perfil" 
          href="/profile" 
          active={location === '/profile'} 
        />
      </div>
      
      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <img 
            src={user.profilePicUrl} 
            alt={`Perfil de ${user.name}`} 
            className="w-10 h-10 rounded-full object-cover" 
          />
          <div>
            <p className="font-medium">{user.name}</p>
            <button 
              onClick={() => logout()} 
              className="text-xs text-gray-500 hover:text-primary"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default { MobileNavbar, DesktopSidebar };
