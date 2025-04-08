
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ResetSuccess = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-full max-w-md space-y-8">
        <CheckCircle className="mx-auto h-24 w-24 text-green-500" />
        
        <h1 className="text-3xl font-bold">Password Reset Successful!</h1>
        <p className="text-muted-foreground">
          Your password has been successfully reset. You can now sign in with your new password.
        </p>
        
        <Button 
          className="w-full" 
          onClick={() => navigate('/signin')}
        >
          Back to Sign In
        </Button>
      </div>
    </div>
  );
};

export default ResetSuccess;
