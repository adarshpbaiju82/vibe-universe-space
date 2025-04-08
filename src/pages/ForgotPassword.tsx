
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { z } from "zod";

// Email validation schema
const emailSchema = z.string().email("Please enter a valid email address");

const ForgotPassword = () => {
  const { requestPasswordReset } = useAuth();
  
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  
  const validateEmail = () => {
    try {
      emailSchema.parse(email);
      setEmailError("");
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setEmailError(err.errors[0].message);
      }
      return false;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate email
    if (!validateEmail()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await requestPasswordReset(email);
      // Navigation is handled in the requestPasswordReset function
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to send OTP");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-100 to-pink-100 dark:from-blue-950 dark:to-pink-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">VibeUniverse</h1>
          <p className="text-lg text-muted-foreground">Recover your account</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>
              Enter your email to receive a one-time password
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
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className={`pl-10 ${emailError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) validateEmail();
                    }}
                    onBlur={validateEmail}
                    required
                  />
                </div>
                {emailError && (
                  <p className="text-xs text-red-500">{emailError}</p>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground">
                We'll send a verification code to this email address
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
                    Sending...
                  </>
                ) : "Send OTP"}
              </Button>
              
              <div className="flex justify-center w-full">
                <Link 
                  to="/signin" 
                  className="flex items-center text-sm text-primary hover:underline"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
