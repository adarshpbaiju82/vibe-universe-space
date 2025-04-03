
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
  const isFullWidthChatPage = location.pathname.includes("/chat/");
  
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
      {/* Navbar - visible on all screen sizes except full-width chat pages on mobile */}
      {!(isMobile && isFullWidthChatPage) && (
        <Navbar onMenuToggle={() => {}} />
      )}
      
      <div className="flex flex-1 w-full max-w-7xl mx-auto">
        {/* Sidebar - Hidden on mobile and chat pages */}
        {!(isMobile && isFullWidthChatPage) && (
          <div className="hidden md:block md:relative md:w-64 xl:w-72 md:z-auto">
            <Sidebar onCloseMobile={() => {}} />
          </div>
        )}
        
        {/* Main Content Area - Full width on chat pages */}
        <main className={`flex-1 ${isMobile && isFullWidthChatPage ? 'p-0' : 'px-4 py-6 md:px-6 md:py-8'}`}>
          <div className={`${isMobile && isFullWidthChatPage ? '' : 'animate-fade-in pb-16 md:pb-0'}`}>
            <Outlet />
          </div>
        </main>
        
        {/* Right Panel - Hidden on mobile and chat pages */}
        {!(isMobile && isFullWidthChatPage) && (
          <div className="hidden lg:block lg:w-80 xl:w-96 p-4">
            <RightPanel />
          </div>
        )}
      </div>
      
      {/* Bottom Mobile Navigation - Hidden on full-width chat pages */}
      {!(isMobile && isFullWidthChatPage) && <BottomNav />}
    </div>
  );
};

export default Layout;
