'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Routes that are always publicly accessible (no onboarding check)
const PUBLIC_ROUTES = ['/', '/onboarding'];

function isUnonboardedUser(): boolean {
  if (typeof window === 'undefined') return false;
  const username = localStorage.getItem('prakriti_username');
  const userId = localStorage.getItem('prakriti_user_id');
  return (
    !username ||
    !userId ||
    username === 'Arjun' ||
    userId === 'demo-user-arjun' ||
    userId === 'arjun-mumbai-uuid'
  );
}

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Landing page and onboarding are always accessible
    if (PUBLIC_ROUTES.includes(pathname)) {
      // If the user is already onboarded and tries to visit /onboarding, redirect to dashboard
      if (pathname === '/onboarding' && !isUnonboardedUser()) {
        router.push('/dashboard');
        return;
      }
      setChecked(true);
      return;
    }

    // For all other protected routes, check onboarding status
    if (isUnonboardedUser()) {
      router.push('/onboarding');
    } else {
      setChecked(true);
    }
  }, [pathname, router]);

  // Prevent flashing content during the redirect check for protected routes
  if (!checked) {
    // Public routes render immediately without a loading flash
    if (PUBLIC_ROUTES.includes(pathname)) {
      return <>{children}</>;
    }

    // Protected routes show a black screen while checking
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }} />
    );
  }

  return <>{children}</>;
}
