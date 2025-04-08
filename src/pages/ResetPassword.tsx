
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { z } from "zod";

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [email, setEmail] = useState("");
  
  useEffect(() => {
    // Get the email from localStorage
    const storedEmail = localStorage.getItem("resetEmail");
    if (!storedEmail) {
      navigate("/forgot-password");
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);
  
  const validatePassword = () => {
    try {
      passwordSchema.parse(password);
      setPasswordError("");
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setPasswordError(err.errors[0].message);
      }
      return false;
    }
  };
  
  const validateConfirmPassword = () => {
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate passwords
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();
    
    if (!isPasswordValid || !isConfirmPasswordValid) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await resetPassword(email, password);
      // Navigation is handled in the resetPassword function
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-100 to-pink-100 dark:from-blue-950 dark:to-pink-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">VibeUniverse</h1>
          <p className="text-lg text-muted-foreground">Set your new password</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Create a new secure password for your account
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-500 dark:bg-red-900/20 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={`pl-10 pr-10 ${passwordError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) validatePassword();
                    }}
                    onBlur={validatePassword}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-xs text-red-500">{passwordError}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className={`pl-10 pr-10 ${confirmPasswordError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmPasswordError) validateConfirmPassword();
                    }}
                    onBlur={validateConfirmPassword}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {confirmPasswordError && (
                  <p className="text-xs text-red-500">{confirmPasswordError}</p>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Password must:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li className={password.length >= 8 ? "text-green-500" : ""}>Be at least 8 characters</li>
                  <li className={/[A-Z]/.test(password) ? "text-green-500" : ""}>Include an uppercase letter</li>
                  <li className={/[a-z]/.test(password) ? "text-green-500" : ""}>Include a lowercase letter</li>
                  <li className={/[0-9]/.test(password) ? "text-green-500" : ""}>Include a number</li>
                </ul>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : "Reset Password"}
              </Button>
              
              <div className="flex justify-center w-full">
                <Link 
                  to="/verify-otp" 
                  className="flex items-center text-sm text-primary hover:underline"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to OTP Verification
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
