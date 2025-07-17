import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, User, ArrowLeft } from 'lucide-react';
import { UserRole } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setCurrentUser } = useApp();
  const { toast } = useToast();
  
  const preselectedRole = searchParams.get('role') as UserRole;
  
  const [formData, setFormData] = useState({
    role: preselectedRole || '' as UserRole,
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = () => {
    // Validation
    if (!formData.role) {
      toast({
        title: "Error",
        description: "Please select a role",
        variant: "destructive"
      });
      return;
    }
    
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
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    // Create user
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email: `${formData.username}@${formData.role.toLowerCase()}.com`,
      name: formData.username,
      role: formData.role,
      createdAt: new Date().toISOString(),
    };
    
    setCurrentUser(newUser);
    navigate('/');
  };

  const roleOptions = [
    { value: 'TRAVEL', label: 'Travel Agency', icon: User },
    { value: 'PROVIDER', label: 'Hotel Provider', icon: Building2 }
  ];

  const selectedRoleOption = roleOptions.find(option => option.value === formData.role);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/lovable-uploads/4ce371b9-ed76-4091-8fcd-7a0661911651.png" 
              alt="SAKINA Logo" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Create Account
          </h1>
          <p className="text-muted-foreground">
            Join the SAKINA platform
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>
              Fill in your details to create your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role">
                    {selectedRoleOption && (
                      <div className="flex items-center">
                        <selectedRoleOption.icon className="h-4 w-4 mr-2" />
                        {selectedRoleOption.label}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        <option.icon className="h-4 w-4 mr-2" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              />
            </div>

            <Button 
              onClick={handleRegister}
              className="w-full"
              size="lg"
            >
              Register
            </Button>

            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;