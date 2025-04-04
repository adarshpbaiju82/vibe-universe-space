
import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Bell, User, PlusSquare, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const BottomNav = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/explore", icon: Compass, label: "Explore" },
    { path: "/create", icon: PlusSquare, label: "Create" },
    { path: "/notifications", icon: Bell, label: "Alerts" },
    { path: `/profile/${user?.username || ''}`, icon: User, label: "Profile" },
  ];
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-background border-t border-border">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link 
            key={item.label} 
            to={item.path} 
            className={cn(
              "flex flex-col items-center justify-center w-full h-full",
              "text-muted-foreground transition-colors",
              isActive(item.path) && "text-primary"
            )}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
        {/* Logout Button for mobile */}
        <button
          className="flex flex-col items-center justify-center w-full h-full text-red-500"
          onClick={() => logout()}
        >
          <LogOut className="h-5 w-5 mb-1" />
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;
