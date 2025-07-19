
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { workspaceService } from '@/services/workspaceService';
import type { Workspace } from '@/types/database';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('travel_agent');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    // Load workspaces when component mounts
    const loadWorkspaces = async () => {
      try {
        const data = await workspaceService.getAll();
        setWorkspaces(data);
      } catch (error) {
        console.error('Error loading workspaces:', error);
      }
    };
    loadWorkspaces();
  }, []);

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    
    try {
      const newWorkspace = await workspaceService.create({
        name: newWorkspaceName,
        description: `Travel Agency: ${newWorkspaceName}`,
        is_active: true
      });
      
      setWorkspaces(prev => [newWorkspace, ...prev]);
      setSelectedWorkspaceId(newWorkspace.id);
      setNewWorkspaceName('');
      setShowCreateWorkspace(false);
      
      toast({
        title: "Success",
        description: "Workspace created successfully!",
      });
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast({
        title: "Error",
        description: "Failed to create workspace. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        }
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (role === 'travel_agent' && !selectedWorkspaceId) {
      setError('Please select a travel agency or create a new one');
      return;
    }

    setGoogleLoading(true);
    setError('');

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          data: {
            role: role,
            workspace_id: role === 'travel_agent' ? selectedWorkspaceId : null,
          }
        }
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        toast({
          title: "Success",
          description: "Signed in successfully!",
        });
        navigate('/');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            username: username,
            role: role,
            workspace_id: role === 'travel_agent' ? selectedWorkspaceId : null,
          }
        }
      });

      if (error) {
        setError(error.message);
      } else {
        toast({
          title: "Success",
          description: "Account created successfully! Please check your email to confirm your account.",
        });
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/8cfa4a00-bda0-48f3-9145-21434c9c3a5b.png" 
              alt="SAKINA Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <CardTitle>Welcome to SAKINA</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <TabsContent value="signin">
              <div className="space-y-4">
                <Button 
                  onClick={handleGoogleSignIn} 
                  className="w-full" 
                  variant="outline"
                  disabled={googleLoading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {googleLoading ? 'Signing in...' : 'Continue with Google'}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </div>
            </TabsContent>
            
            <TabsContent value="signup">
              <div className="space-y-4">
                <div>
                  <Label>Account Type</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="travel-agent"
                        name="role"
                        value="travel_agent"
                        checked={role === 'travel_agent'}
                        onChange={(e) => setRole(e.target.value)}
                        className="text-primary focus:ring-primary"
                      />
                      <Label htmlFor="travel-agent" className="cursor-pointer">Travel Agent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="hotel-provider"
                        name="role"
                        value="hotel_provider"
                        checked={role === 'hotel_provider'}
                        onChange={(e) => setRole(e.target.value)}
                        className="text-primary focus:ring-primary"
                      />
                      <Label htmlFor="hotel-provider" className="cursor-pointer">Hotel Provider</Label>
                    </div>
                  </div>
                </div>
                
                {role === 'travel_agent' && (
                  <div>
                    <Label>Code</Label>
                    <div className="flex gap-2 mt-2">
                      <Select value={selectedWorkspaceId} onValueChange={setSelectedWorkspaceId}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select your travel agency" />
                        </SelectTrigger>
                        <SelectContent>
                          {workspaces.map((workspace) => (
                            <SelectItem key={workspace.id} value={workspace.id}>
                              {workspace.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Dialog open={showCreateWorkspace} onOpenChange={setShowCreateWorkspace}>
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline" size="sm">
                            +
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Travel Agency</DialogTitle>
                            <DialogDescription>
                              Enter the name of your travel agency to create a new workspace.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="workspace-name">Agency Name</Label>
                              <Input
                                id="workspace-name"
                                value={newWorkspaceName}
                                onChange={(e) => setNewWorkspaceName(e.target.value)}
                                placeholder="Enter agency name"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleCreateWorkspace} className="flex-1">
                                Create
                              </Button>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setShowCreateWorkspace(false)}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleGoogleSignUp} 
                  className="w-full" 
                  variant="outline"
                  disabled={googleLoading || (role === 'travel_agent' && !selectedWorkspaceId)}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {googleLoading ? 'Creating account...' : 'Sign up with Google'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or sign up with email
                    </span>
                  </div>
                </div>
                
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-fullname">Full Name</Label>
                    <Input
                      id="signup-fullname"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-username">Username</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
