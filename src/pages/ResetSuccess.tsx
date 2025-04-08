
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const ResetSuccess = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-100 to-pink-100 dark:from-blue-950 dark:to-pink-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">VibeUniverse</h1>
          <p className="text-lg text-muted-foreground">Password reset complete</p>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                <Check className="h-8 w-8 text-green-600 dark:text-green-500" />
              </div>
            </div>
            <CardTitle className="text-center">Success!</CardTitle>
          </CardHeader>
          
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Link to="/signin" className="w-full">
              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600"
              >
                Sign In
              </Button>
            </Link>
            
            <div className="text-center text-sm text-muted-foreground">
              Thank you for using VibeUniverse
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ResetSuccess;
