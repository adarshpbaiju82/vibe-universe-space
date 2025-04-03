
import { Link, useLocation } from "react-router-dom";
import { Bell, User, MessageCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onMenuToggle: () => void;
}

const Navbar = ({ onMenuToggle }: NavbarProps) => {
  const { user } = useAuth();
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
        
        {/* Search - Only visible on desktop */}
        {!isMobile && (
          <div className="hidden md:flex items-center mx-4 w-full max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search VibeUniverse..."
                className="w-full bg-muted/50 border-none rounded-full py-2 pl-10 pr-4 text-sm"
              />
            </div>
          </div>
        )}
        
        {/* Right: Notifications, Chat, Profile */}
        <div className="flex items-center space-x-2">
          <Link to="/chat">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "relative",
                isActive("/chat") && "bg-accent"
              )}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-vibe-500"></span>
            </Button>
          </Link>
          
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
