
import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Bell, Settings, LogOut, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  onCloseMobile?: () => void;
}

const Sidebar = ({ onCloseMobile }: SidebarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: "/", text: "Home", icon: Home },
    { path: "/explore", text: "Explore", icon: Compass },
    { path: "/create", text: "Create", icon: PlusSquare },
    { path: "/notifications", text: "Notifications", icon: Bell },
    { path: "/settings", text: "Settings", icon: Settings },
  ];
  
  return (
    <div className="h-full flex flex-col p-4 border-r border-border">
      {/* User Profile Summary */}
      {user && (
        <Link 
          to={`/profile/${user.username}`} 
          className="flex items-center space-x-3 mb-8 p-2 rounded-md hover:bg-secondary/50 transition-colors"
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
      
      {/* Logout */}
      <Button 
        variant="ghost" 
        className="w-full justify-start text-muted-foreground mt-auto"
        onClick={() => {
          logout();
        }}
      >
        <LogOut className="mr-3 h-5 w-5" />
        Logout
      </Button>
    </div>
  );
};

export default Sidebar;
