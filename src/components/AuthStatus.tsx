import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { formatTokenExpiration, isTokenValid } from '../utils/authUtils';
import { LogOut, User, Shield, Clock } from 'lucide-react';

const AuthStatus: React.FC = () => {
  const { user, token, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Not authenticated</p>
        </CardContent>
      </Card>
    );
  }

  const tokenValid = token ? isTokenValid(token) : false;
  const tokenExpiration = token ? formatTokenExpiration(token) : 'N/A';

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {user?.role === 'admin' ? (
            <Shield className="h-5 w-5 text-red-500" />
          ) : (
            <User className="h-5 w-5 text-blue-500" />
          )}
          Authentication Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">User:</span>
            <span className="text-sm">{user?.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Email:</span>
            <span className="text-sm">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Role:</span>
            <Badge variant={user?.role === 'admin' ? 'destructive' : 'secondary'}>
              {user?.role}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Department:</span>
            <span className="text-sm">{user?.department}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Token Status:</span>
            <Badge variant={tokenValid ? 'default' : 'destructive'}>
              {tokenValid ? 'Valid' : 'Invalid'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Expires: {tokenExpiration}
            </span>
          </div>
        </div>

        <Button 
          onClick={logout} 
          variant="outline" 
          size="sm"
          className="w-full"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </CardContent>
    </Card>
  );
};

export default AuthStatus; 