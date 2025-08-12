import React, { useState } from 'react';
import { authApi } from '../services/api';
import { getStoredToken, getStoredUser, setStoredAuth, clearStoredAuth } from '../utils/authUtils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const LoginTest: React.FC = () => {
  const [result, setResult] = useState<string>('');

  const testLogin = async () => {
    try {
      setResult('Testing login...');
      
      const response = await authApi.login({ email: 'admin@company.com', password: 'admin123' });
      
      setResult(`Login successful: ${JSON.stringify(response, null, 2)}`);
    } catch (error: any) {
      setResult(`Login failed: ${error.message}`);
    }
  };

  const testDirectFetch = async () => {
    try {
      setResult('Testing direct fetch...');
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'admin@company.com', password: 'admin123' }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setResult(`Direct fetch failed: ${data.message}`);
      } else {
        setResult(`Direct fetch successful: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error: any) {
      setResult(`Direct fetch error: ${error.message}`);
    }
  };

  const testLocalStorage = () => {
    try {
      setResult('Testing localStorage...');
      
      // Test storing
      const testUser = { id: 1, name: 'Test User', email: 'test@test.com' };
      const testToken = 'test-token';
      
      setStoredAuth(testToken, testUser);
      
      // Test retrieving
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();
      
      setResult(`localStorage test:
Stored token: ${storedToken}
Stored user: ${JSON.stringify(storedUser, null, 2)}
localStorage available: ${typeof localStorage !== 'undefined'}`);
      
      // Clean up
      clearStoredAuth();
    } catch (error: any) {
      setResult(`localStorage test failed: ${error.message}`);
    }
  };

  const checkCurrentStorage = () => {
    try {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();
      
      setResult(`Current localStorage:
Token: ${storedToken ? 'Present' : 'Not found'}
User: ${storedUser ? JSON.stringify(storedUser, null, 2) : 'Not found'}`);
    } catch (error: any) {
      setResult(`Storage check failed: ${error.message}`);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Login Test</h2>
      
      <div className="space-x-4">
        <button 
          onClick={testLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Test API Service Login
        </button>
        
        <button 
          onClick={testDirectFetch}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Test Direct Fetch
        </button>
        
        <button 
          onClick={testLocalStorage}
          className="px-4 py-2 bg-yellow-500 text-white rounded"
        >
          Test localStorage
        </button>
        
        <button 
          onClick={checkCurrentStorage}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          Check Current Storage
        </button>
      </div>
      
      <div className="mt-4">
        <h3 className="font-semibold">Result:</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {result}
        </pre>
      </div>
    </div>
  );
};

export default LoginTest; 