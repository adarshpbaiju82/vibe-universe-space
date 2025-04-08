
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
  forgotPassword: (email: string) => Promise<void>;
  verifyResetCode: (email: string, code: string) => Promise<boolean>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<boolean>;
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

// Mock reset codes storage
const resetCodes: Record<string, { code: string, expiresAt: Date }> = {};

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

  // Password reset functionality
  const forgotPassword = async (email: string) => {
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user exists
      const user = MOCK_USERS.find(u => u.email === email);
      if (!user) {
        throw new Error("No account found with this email");
      }
      
      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store the code with an expiration time (15 minutes)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);
      
      resetCodes[email] = { code, expiresAt };
      
      // In a real app, send the code via email
      console.log(`Password reset code for ${email}: ${code}`);
      
      toast.success("Reset code sent to your email");
      return;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to request password reset");
      throw error;
    }
  };

  const verifyResetCode = async (email: string, code: string) => {
    try {
      // Check if the code exists and is valid
      const resetData = resetCodes[email];
      
      if (!resetData) {
        throw new Error("No reset code found for this email");
      }
      
      if (new Date() > resetData.expiresAt) {
        // Code has expired
        delete resetCodes[email];
        throw new Error("Reset code has expired. Please request a new one");
      }
      
      if (resetData.code !== code) {
        throw new Error("Invalid reset code");
      }
      
      // Code is valid
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to verify reset code");
      return false;
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      // First verify the code
      const isCodeValid = await verifyResetCode(email, code);
      
      if (!isCodeValid) {
        throw new Error("Invalid or expired reset code");
      }
      
      // In a real app, update the password in the database
      // For mock data, find the user and update password
      const userIndex = MOCK_USERS.findIndex(u => u.email === email);
      
      if (userIndex === -1) {
        throw new Error("User not found");
      }
      
      // Update password
      MOCK_USERS[userIndex].password = newPassword;
      
      // Remove the reset code
      delete resetCodes[email];
      
      toast.success("Password has been reset successfully");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reset password");
      return false;
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
      forgotPassword,
      verifyResetCode,
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
