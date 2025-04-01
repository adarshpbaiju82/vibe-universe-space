
import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Bell, Settings, LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  onCloseMobile?: () => void;
}

const Sidebar = ({ onCloseMobile }: SidebarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: "/", text: "Home", icon: Home },
    { path: "/explore", text: "Explore", icon: Compass },
    { path: "/notifications", text: "Notifications", icon: Bell },
    { path: "/settings", text: "Settings", icon: Settings },
  ];
  
  return (
    <div className="h-full flex flex-col p-4 border-r border-border">
      {/* Mobile Close Button */}
      <div className="md:hidden flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold gradient-text">VibeUniverse</h1>
        <Button variant="ghost" size="icon" onClick={onCloseMobile}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {/* User Profile Summary */}
      {user && (
        <Link 
          to={`/profile/${user.username}`} 
          className="flex items-center space-x-3 mb-8 p-2 rounded-md hover:bg-secondary/50 transition-colors"
          onClick={onCloseMobile}
        >
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} alt={user.username} />
            <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span className="text-sm text-muted-foreground">@{user.username}</span>
          </div>
        </Link>
      )}
      
      {/* Navigation Links */}
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              onClick={onCloseMobile}
            >
              <Button
                variant={isActive(item.path) ? "secondary" : "ghost"}
                className={`w-full justify-start ${isActive(item.path) ? 'font-medium' : ''}`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.text}
              </Button>
            </Link>
          );
        })}
      </nav>
      
      {/* New Post Button */}
      <div className="my-4">
        <Button className="w-full vibe-button">
          Create Post
        </Button>
      </div>
      
      {/* Logout */}
      <Button 
        variant="ghost" 
        className="w-full justify-start text-muted-foreground mt-auto"
        onClick={() => {
          logout();
          if (onCloseMobile) onCloseMobile();
        }}
      >
        <LogOut className="mr-3 h-5 w-5" />
        Logout
      </Button>
    </div>
  );
};

export default Sidebar;
