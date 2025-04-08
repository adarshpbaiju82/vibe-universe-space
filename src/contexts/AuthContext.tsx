
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

// Define types
interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio?: string;
  followerCount: number;
  followingCount: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  setIntendedPath: (path: string) => void;
  requestPasswordReset: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  resetPassword: (email: string, password: string) => Promise<void>;
}

// Mock user data
const MOCK_USERS = [
  {
    id: "1",
    email: "user@example.com",
    password: "password",
    username: "cosmicvibe",
    name: "Cosmic Viber",
    avatar: "https://i.pravatar.cc/150?img=1",
    bio: "Just vibing in the universe ✨",
    followerCount: 234,
    followingCount: 156
  },
  {
    id: "2",
    email: "test@example.com",
    password: "password",
    username: "stardust",
    name: "Star Dust",
    avatar: "https://i.pravatar.cc/150?img=2",
    bio: "Collecting cosmic energy",
    followerCount: 578,
    followingCount: 283
  }
];

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // These hooks are now safely inside Router context since we moved the BrowserRouter up
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Check if user is stored in localStorage on component mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Store and retrieve the intended path
  const setIntendedPath = (path: string) => {
    if (path !== '/signin' && path !== '/signup') {
      localStorage.setItem("intendedPath", path);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = MOCK_USERS.find(u => u.email === email && u.password === password);
      
      if (!mockUser) {
        throw new Error("Invalid email or password");
      }
      
      const { password: _, email: __, ...userWithoutSensitiveInfo } = mockUser;
      setUser(userWithoutSensitiveInfo);
      localStorage.setItem("user", JSON.stringify(userWithoutSensitiveInfo));
      toast.success("Successfully logged in!");
      
      // Redirect to intended path if it exists, otherwise go to home
      const intendedPath = localStorage.getItem("intendedPath") || "/";
      localStorage.removeItem("intendedPath"); // Clear the stored path
      navigate(intendedPath);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
      throw error;
    }
  };

  const signup = async (email: string, username: string, password: string) => {
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email or username already exists
      if (MOCK_USERS.some(u => u.email === email)) {
        throw new Error("Email already in use");
      }
      
      if (MOCK_USERS.some(u => u.username === username)) {
        throw new Error("Username already taken");
      }
      
      // In a real app, we would create the user in the database here
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        name: username,
        avatar: `https://i.pravatar.cc/150?u=${email}`,
        followerCount: 0,
        followingCount: 0
      };
      
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      toast.success("Account created successfully!");
      
      // Redirect to intended path if it exists, otherwise go to home
      const intendedPath = localStorage.getItem("intendedPath") || "/";
      localStorage.removeItem("intendedPath"); // Clear the stored path
      navigate(intendedPath);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Signup failed");
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.info("You've been logged out");
    navigate("/signin");
  };

  // New password reset functions
  const requestPasswordReset = async (email: string) => {
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = MOCK_USERS.find(u => u.email === email);
      
      if (!mockUser) {
        throw new Error("Email not found");
      }
      
      // In a real app, we would send an email with the OTP here
      // For demo, we'll store the email in localStorage to use in the next steps
      localStorage.setItem("resetEmail", email);
      toast.success("OTP sent to your email!");
      
      // Navigate to OTP verification page
      navigate("/verify-otp");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send OTP");
      throw error;
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we would verify the OTP here
      // For demo, we'll just check if the OTP is "123456"
      if (otp !== "123456") {
        throw new Error("Invalid OTP");
      }
      
      toast.success("OTP verified successfully!");
      
      // Navigate to reset password page
      navigate("/reset-password");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to verify OTP");
      throw error;
    }
  };

  const resetPassword = async (email: string, password: string) => {
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we would update the password in the database here
      // For demo, we'll just show a success message
      
      // Clear the reset email from localStorage
      localStorage.removeItem("resetEmail");
      
      toast.success("Password reset successfully!");
      
      // Navigate to success page
      navigate("/reset-success");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reset password");
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      signup, 
      logout, 
      setIntendedPath,
      requestPasswordReset,
      verifyOTP,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
