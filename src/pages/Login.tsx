import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useApp();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = () => {
    // Validation
    if (!formData.username.trim()) {
      toast({
        title: "Error", 
        description: "Please enter a username",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.password) {
      toast({
        title: "Error",
        description: "Please enter a password", 
        variant: "destructive"
      });
      return;
    }

    // Mock login - in real app this would be handled by authentication service
    const mockUser = {
      id: Math.random().toString(36).substr(2, 9),
      email: `${formData.username}@example.com`,
      name: formData.username,
      role: 'TRAVEL' as const, // Default role, in real app would come from backend
      createdAt: new Date().toISOString(),
    };
    
    setCurrentUser(mockUser);
    toast({
      title: "Success",
      description: "Login successful!",
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/lovable-uploads/2e0f222c-cef6-4ccc-83d1-1896315257f9.png" 
              alt="SAKINA Logo" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Sign in to your SAKINA account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
            </div>

            <Button 
              onClick={handleLogin}
              className="w-full"
              size="lg"
            >
              Login
            </Button>

            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-normal"
                  onClick={() => navigate('/')}
                >
                  Sign up here
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;