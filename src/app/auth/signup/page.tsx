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

