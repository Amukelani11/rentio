'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Access Denied
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            You don't have permission to access this page. Please sign in with the correct account or contact support if you believe this is an error.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => router.push('/auth/signin')}
              className="w-full bg-coral-600 hover:bg-coral-700 text-white"
            >
              Sign In
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="w-full border-coral-300 text-coral-700 hover:bg-coral-50"
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="w-full text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help? <a href="/contact" className="text-coral-600 hover:text-coral-700 underline">Contact Support</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
