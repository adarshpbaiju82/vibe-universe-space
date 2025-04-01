
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  onMenuToggle: () => void;
}

const Navbar = ({ onMenuToggle }: NavbarProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <nav className="bg-background border-b border-border sticky top-0 z-10 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Menu Toggle & Logo */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onMenuToggle}>
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link to="/" className="flex items-center">
            <h1 className="text-xl font-bold gradient-text">VibeUniverse</h1>
          </Link>
        </div>
        
        {/* Right: Search, Notifications, Profile */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-24 px-3 py-1 rounded-full bg-secondary text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-2 top-1.5 h-4 w-4 text-muted-foreground" />
          </div>
          
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
