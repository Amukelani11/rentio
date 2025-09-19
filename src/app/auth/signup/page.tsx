"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<'form' | 'verify'>("form");
  const [sendingCode, setSendingCode] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('error');
  const successMessage = searchParams.get('message');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'form') {
      setLoading(true);
      setError('');
      setMessage('');
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            shouldCreateUser: true,
            data: name ? { name } : undefined,
          },
        });
        if (error) {
          setError(error.message);
        } else {
          setStep('verify');
          setCooldown(30);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      await handleVerifyOtp();
    }
  };

  const handleGoogleSignUp = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setOtpError('');
    setSendingCode(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
          data: name ? { name } : undefined,
        },
      });
      if (error) {
        setOtpError(error.message);
        return;
      }
      setCooldown(30);
    } catch (e) {
      setOtpError(e instanceof Error ? e.message : 'Failed to resend code.');
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyOtp = async () => {
    setVerifying(true);
    setOtpError('');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({ email, token: otp.trim(), type: 'email' });
      if (error) {
        setOtpError(error.message);
        return;
      }
      // Set password and name metadata after verifying
      await supabase.auth.updateUser({ password, data: name ? { name } : undefined });
      router.push('/dashboard');
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
          <CardTitle className="text-2xl font-bold text-center">Sign up for Rentio</CardTitle>
          <CardDescription className="text-center">
            Enter your details and we’ll email you a 6‑digit code to finish signup
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(error || errorMessage) && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error || errorMessage}</AlertDescription>
            </Alert>
          )}
          
          {(message || successMessage) && (
            <Alert className="mb-4">
              <AlertDescription>{message || successMessage}</AlertDescription>
            </Alert>
          )}
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Email me a code to sign up
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Alert>
                <AlertDescription>We sent a 6‑digit code to {email}. Enter it below to finish signing up.</AlertDescription>
              </Alert>
              {otpError && (
                <Alert variant="destructive">
                  <AlertDescription>{otpError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="otp">Verification code</Label>
                <Input id="otp" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} required />
              </div>
              <div className="flex items-center justify-between gap-2">
                <Button type="button" variant="outline" onClick={handleResend} disabled={sendingCode || cooldown > 0}>
                  {sendingCode ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending
                    </>
                  ) : cooldown > 0 ? (
                    <>Resend in {cooldown}s</>
                  ) : (
                    <>Resend code</>
                  )}
                </Button>
                <Button type="submit" disabled={verifying}>
                  {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify & continue
                </Button>
              </div>
            </form>
          )}
          
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
            onClick={handleGoogleSignUp}
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
            Sign up with Google
          </Button>
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

