
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { z } from "zod";
import { toast } from "sonner";

// OTP validation schema
const otpSchema = z.string().length(6, "OTP must be 6 digits");

const VerifyOTP = () => {
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();
  
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [otpError, setOtpError] = useState("");
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
  
  const validateOtp = () => {
    try {
      otpSchema.parse(otp);
      setOtpError("");
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setOtpError(err.errors[0].message);
      }
      return false;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate OTP
    if (!validateOtp()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await verifyOTP(email, otp);
      // Navigation is handled in the verifyOTP function
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to verify OTP");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResendOtp = async () => {
    try {
      // In a real app, we would resend the OTP here
      // For demo, we'll just show a success message
      setOtp("");
      setError("");
      setOtpError("");
      
      toast.success("New OTP sent to your email!");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to resend OTP");
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-100 to-pink-100 dark:from-blue-950 dark:to-pink-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">VibeUniverse</h1>
          <p className="text-lg text-muted-foreground">Verify your identity</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>OTP Verification</CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to {email}
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
                <div className="flex justify-center my-4">
                  <InputOTP 
                    maxLength={6} 
                    value={otp} 
                    onChange={setOtp}
                    className={otpError ? 'border-red-500' : ''}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {otpError && (
                  <p className="text-xs text-red-500 text-center">{otpError}</p>
                )}
              </div>
              
              <div className="text-xs text-center text-muted-foreground">
                Didn't receive the code?{" "}
                <button 
                  type="button"
                  onClick={handleResendOtp}
                  className="text-primary hover:underline"
                >
                  Resend
                </button>
              </div>
              
              <div className="text-xs text-center text-blue-500 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md">
                For demo purposes, use the code: <strong>123456</strong>
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
                    Verifying...
                  </>
                ) : "Verify OTP"}
              </Button>
              
              <div className="flex justify-center w-full">
                <Link 
                  to="/forgot-password" 
                  className="flex items-center text-sm text-primary hover:underline"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Forgot Password
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default VerifyOTP;
