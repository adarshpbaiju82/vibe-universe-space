
import { Link } from "react-router-dom";
import { Menu, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavbarProps {
  onMenuToggle: () => void;
}

const Navbar = ({ onMenuToggle }: NavbarProps) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  return (
    <nav className="bg-background border-b border-border sticky top-0 z-10 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Menu Toggle & Logo */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onMenuToggle} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link to="/" className="flex items-center">
            <h1 className="text-xl font-bold gradient-text">VibeUniverse</h1>
          </Link>
        </div>
        
        {/* Right: Notifications, Profile */}
        <div className="flex items-center space-x-3">
          <Link to="/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-accent"></span>
            </Button>
          </Link>
          
          <Link to={`/profile/${user?.username}`}>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
