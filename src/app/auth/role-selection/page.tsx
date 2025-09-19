'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { Role } from '@/lib/types';

const ROLES = [
  {
    id: Role.CUSTOMER,
    title: 'Customer',
    description: 'I want to rent items from others',
    icon: '🛍️',
    features: ['Browse and search listings', 'Book items securely', 'Leave reviews', 'Save favorites']
  },
  {
    id: Role.INDIVIDUAL_LISTER,
    title: 'Individual Lister',
    description: 'I want to rent out my personal items',
    icon: '🏠',
    features: ['List your items', 'Set your prices', 'Manage bookings', 'Earn money']
  },
  {
    id: Role.BUSINESS_LISTER,
    title: 'Business Lister',
    description: 'I run a rental business',
    icon: '🏢',
    features: ['Business profile', 'Inventory management', 'Package deals', 'Team accounts']
  }
];

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/auth/signin');
      }
    });
  }, [router]);

  const handleSubmit = async () => {
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First, add the role to user metadata
      const roleResponse = await fetch('/api/auth/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!roleResponse.ok) {
        const errorData = await roleResponse.json();
        throw new Error(errorData.error || 'Failed to add role');
      }

      // Then, mark the onboarding as completed for this role
      const onboardingResponse = await fetch('/api/onboarding/skip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ flow: selectedRole }),
      });

      if (!onboardingResponse.ok) {
        const errorData = await onboardingResponse.json();
        throw new Error(errorData.error || 'Failed to complete onboarding');
      }

      // Redirect based on selected role
      if (selectedRole === Role.CUSTOMER) { 
        router.push('/onboarding/renter') 
      } else if (selectedRole === Role.INDIVIDUAL_LISTER) { 
        router.push('/onboarding/lister') 
      } else if (selectedRole === Role.BUSINESS_LISTER) { 
        router.push('/onboarding/business') 
      } else { 
        router.push('/dashboard') 
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      // Mark onboarding as skipped
      const response = await fetch('/api/onboarding/skip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ flow: 'SKIP' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to skip onboarding');
      }

      router.push('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Rentio, {user?.user_metadata?.name || user?.email}!
          </h1>
          <p className="text-lg text-gray-600">
            Choose how you'd like to use Rentio. You can always add more roles later.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {ROLES.map((role) => (
            <Card
              key={role.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedRole === role.id 
                  ? 'ring-2 ring-coral-500 border-coral-500' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedRole(role.id)}
            >
              <CardHeader className="text-center">
                <div className="text-5xl mb-2">{role.icon}</div>
                <CardTitle className="text-xl">{role.title}</CardTitle>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {role.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 bg-coral-500 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedRole || loading}
            className="w-full sm:w-auto"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue as {selectedRole ? ROLES.find(r => r.id === selectedRole)?.title : 'Selected Role'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleSkip}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Skip for now
          </Button>
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          You can always add additional roles later in your account settings.
        </div>
      </div>
    </div>
  );
}






