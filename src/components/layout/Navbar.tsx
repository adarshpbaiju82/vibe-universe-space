
import { Link, useLocation } from "react-router-dom";
import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onMenuToggle: () => void;
}

const Navbar = ({ onMenuToggle }: NavbarProps) => {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);
  
  return (
    <nav className="bg-background border-b border-border sticky top-0 z-10 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <h1 className="text-xl font-bold gradient-text">VibeUniverse</h1>
          </Link>
        </div>
        
        {/* Right: Notifications, Profile, Logout */}
        <div className="flex items-center space-x-2">
          <Link to="/notifications">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "relative",
                isActive("/notifications") && "bg-accent"
              )}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent"></span>
            </Button>
          </Link>
          
          <Link to={`/profile/${user?.username}`}>
            <Button 
              variant="ghost" 
              size="icon"
              className={cn(
                isActive(`/profile/${user?.username}`) && "bg-accent"
              )}
            >
              <User className="h-5 w-5" />
            </Button>
          </Link>
          
          {/* Logout Button - visible on all screen sizes */}
          <Button 
            variant="ghost" 
            size="icon"
            className="text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
            onClick={() => logout()}
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
