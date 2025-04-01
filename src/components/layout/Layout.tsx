
import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";
import { useIsMobile } from "@/hooks/use-mobile";

const Layout = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Redirect to sign in if not authenticated
    if (!isAuthenticated) {
      navigate("/signin");
    }
  }, [isAuthenticated, navigate]);
  
  // Mobile view state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navbar - visible on all screen sizes */}
      <Navbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
      
      <div className="flex flex-1 w-full max-w-7xl mx-auto">
        {/* Sidebar - Hidden on mobile unless menu is open */}
        <div className={`${mobileMenuOpen ? 'fixed inset-0 z-50 bg-background' : 'hidden'} md:block md:relative md:w-64 xl:w-72 md:z-auto`}>
          <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
        </div>
        
        {/* Main Content Area */}
        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
        
        {/* Right Panel - Hidden on mobile */}
        <div className="hidden lg:block lg:w-80 xl:w-96 p-4">
          <RightPanel />
        </div>
      </div>
    </div>
  );
};

export default Layout;
