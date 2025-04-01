
import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";
import BottomNav from "./BottomNav";
import { useIsMobile } from "@/hooks/use-mobile";

const Layout = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  useEffect(() => {
    // Redirect to sign in if not authenticated
    if (!isAuthenticated) {
      navigate("/signin");
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navbar - visible on all screen sizes */}
      <Navbar onMenuToggle={() => {}} />
      
      <div className="flex flex-1 w-full max-w-7xl mx-auto">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden md:block md:relative md:w-64 xl:w-72 md:z-auto">
          <Sidebar onCloseMobile={() => {}} />
        </div>
        
        {/* Main Content Area */}
        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <div className="animate-fade-in pb-16 md:pb-0">
            <Outlet />
          </div>
        </main>
        
        {/* Right Panel - Hidden on mobile */}
        <div className="hidden lg:block lg:w-80 xl:w-96 p-4">
          <RightPanel />
        </div>
      </div>
      
      {/* Bottom Mobile Navigation */}
      <BottomNav />
    </div>
  );
};

export default Layout;
