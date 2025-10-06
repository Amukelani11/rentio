'use client';

import { useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('error');
  const redirectTo = searchParams.get('redirect') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        // After sign-in, decide where to go: onboarding if no role, else dashboard
        try {
          const me = await fetch('/api/auth/user')
          if (me.ok) {
            const uj = await me.json()
            const roles = Array.isArray(uj?.user?.roles) ? uj.user.roles : []
            router.push(redirectTo || (roles.length === 0 ? '/onboarding' : '/dashboard'))
          } else {
            router.push(redirectTo || '/onboarding')
          }
        } catch {
          router.push(redirectTo || '/onboarding')
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
    const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
          redirectTo: `${window.location.origin}/api/auth/google/callback${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`,
      },
    });
      
      if (error) {
        setError(error.message);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sign in with Google');
    }
  };

  const handleSendOtp = async () => {
    setError('');
    setOtpError('');
    if (!email) {
      setError('Please enter your email first.');
      return;
    }
    setSendingCode(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
        },
      });
      if (error) {
        setError(error.message);
        return;
      }
      setOtpModalOpen(true);
      setTimeout(() => otpInputRef.current?.focus(), 150);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send code.');
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setOtpError('');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({ email, token: otp.trim(), type: 'email' });
      if (error) {
        setOtpError(error.message);
        return;
      }
      setOtpModalOpen(false);
      try {
        const me = await fetch('/api/auth/user')
        if (me.ok) {
          const uj = await me.json()
          const roles = Array.isArray(uj?.user?.roles) ? uj.user.roles : []
          router.push(redirectTo || (roles.length === 0 ? '/onboarding' : '/dashboard'))
        } else {
          router.push(redirectTo || '/onboarding')
        }
      } catch {
        router.push(redirectTo || '/onboarding')
      }
    } catch (e) {
      setOtpError(e instanceof Error ? e.message : 'Invalid or expired code.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in to Rentio</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(error || errorMessage) && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error || errorMessage}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={handleSendOtp} disabled={sendingCode}>
              {sendingCode && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Email me a code
            </Button>
          </form>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </Button>
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
      {/* OTP Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/40 bg-white/80 p-6 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-white/10">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-50">Enter verification code</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-200">We emailed a 6‑digit code to {email}. Enter it below to continue.</p>
            {otpError && (
              <Alert variant="destructive" className="mt-3">
                <AlertDescription>{otpError}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleVerifyOtp} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="otp">One-time code</Label>
                <Input
                  id="otp"
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <Button type="button" variant="ghost" onClick={() => setOtpModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={verifying}>
                  {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
