
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
      navigate("/");
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
      navigate("/");
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

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
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
