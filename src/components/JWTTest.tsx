import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '../services/api';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { getStoredToken, getStoredUser, isTokenValid, formatTokenExpiration } from '../utils/authUtils';
import { Loader2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const JWTTest: React.FC = () => {
  const { user, token, login, logout, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const [localStorageData, setLocalStorageData] = useState<any>(null);

  const testLogin = async () => {
    setIsLoading(true);
    setTestResult('');
    
    try {
      const success = await login(email, password);
      if (success) {
        setTestResult('✅ Login successful! JWT token stored in localStorage.');
      } else {
        setTestResult('❌ Login failed. Check credentials.');
      }
    } catch (error) {
      setTestResult('❌ Login error: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const testTokenValidation = () => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();
    
    if (!storedToken) {
      setTestResult('❌ No token found in localStorage');
      return;
    }

    const isValid = isTokenValid(storedToken);
    const expiration = formatTokenExpiration(storedToken);
    
    setTestResult(
      `🔍 Token Analysis:\n` +
      `• Valid: ${isValid ? '✅ Yes' : '❌ No'}\n` +
      `• Expires: ${expiration}\n` +
      `• User: ${storedUser?.name || 'Unknown'}`
    );
  };

  const testAPICall = async () => {
    setIsLoading(true);
    setTestResult('');
    
    try {
      const response = await authApi.getCurrentUser();
      setTestResult('✅ API call successful! Token is working.');
    } catch (error) {
      setTestResult('❌ API call failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLocalStorageData = () => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();
    
    setLocalStorageData({
      token: storedToken ? `${storedToken.substring(0, 20)}...` : null,
      user: storedUser,
      tokenValid: storedToken ? isTokenValid(storedToken) : false,
      expiration: storedToken ? formatTokenExpiration(storedToken) : null
    });
  };

  const clearStorage = () => {
    localStorage.clear();
    setLocalStorageData(null);
    setTestResult('🗑️ localStorage cleared. Refresh page to see effect.');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>JWT Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={testLogin} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Test Login
            </Button>
            <Button onClick={testTokenValidation} variant="outline">
              Validate Token
            </Button>
            <Button onClick={testAPICall} disabled={!isAuthenticated} variant="outline">
              Test API Call
            </Button>
            <Button onClick={refreshLocalStorageData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
            <Button onClick={clearStorage} variant="destructive">
              Clear Storage
            </Button>
          </div>

          {testResult && (
            <Alert>
              <AlertDescription className="whitespace-pre-line">
                {testResult}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Authentication Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Status:</span>
            <Badge variant={isAuthenticated ? 'default' : 'secondary'}>
              {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </Badge>
          </div>

          {isAuthenticated && user && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">User:</span>
                <span className="text-sm">{user.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Role:</span>
                <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                  {user.role}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Token Valid:</span>
                <Badge variant={token && isTokenValid(token) ? 'default' : 'destructive'}>
                  {token && isTokenValid(token) ? 'Valid' : 'Invalid'}
                </Badge>
              </div>
            </div>
          )}

          <Button onClick={logout} variant="outline" size="sm">
            Logout
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>localStorage Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={refreshLocalStorageData} variant="outline" size="sm" className="mb-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh localStorage Data
          </Button>
          
          {localStorageData ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">Token:</span>
                <span className="font-mono text-xs">{localStorageData.token || 'None'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Token Valid:</span>
                {localStorageData.tokenValid ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Expires:</span>
                <span className="text-xs">{localStorageData.expiration || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">User:</span>
                <span className="text-xs">{localStorageData.user?.name || 'None'}</span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Click "Refresh localStorage Data" to view</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JWTTest; 