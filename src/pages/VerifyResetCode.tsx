
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Schema for form validation
const formSchema = z.object({
  code: z.string().length(6, { message: 'Verification code must be 6 digits' }),
});

type FormValues = z.infer<typeof formSchema>;

const VerifyResetCode = () => {
  const { verifyResetCode } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  
  useEffect(() => {
    // Get email from session storage
    const storedEmail = sessionStorage.getItem('resetEmail');
    if (!storedEmail) {
      toast.error('Email not found. Please restart the password reset process.');
      navigate('/forgot-password');
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  });
  
  const onSubmit = async (values: FormValues) => {
    if (!email) return;
    
    try {
      const isValid = await verifyResetCode(email, values.code);
      if (isValid) {
        // Store the code in session storage for the reset password step
        sessionStorage.setItem('resetCode', values.code);
        navigate('/reset-password');
      }
    } catch (error) {
      // Error is handled by the verifyResetCode function
      console.error(error);
    }
  };
  
  const handleResendCode = async () => {
    if (!email) return;
    
    try {
      const { forgotPassword } = useAuth();
      await forgotPassword(email);
      toast.success('A new code has been sent to your email');
    } catch (error) {
      console.error(error);
    }
  };
  
  if (!email) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <Link to="/forgot-password" className="mb-6 self-start">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold">Verify Reset Code</h1>
          <p className="mt-2 text-muted-foreground">
            We've sent a 6-digit code to {email}. Enter the code below to continue.
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel className="text-center">Verification Code</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Verifying..." : "Verify Code"}
            </Button>
          </form>
        </Form>
        
        <div className="mt-4 text-center text-sm">
          <p>
            Didn't receive a code?{" "}
            <Button variant="link" className="p-0 h-auto" onClick={handleResendCode}>
              Resend Code
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyResetCode;
