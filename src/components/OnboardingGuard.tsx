'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const username = localStorage.getItem('prakriti_username');
    const userId = localStorage.getItem('prakriti_user_id');
    
    // An un-onboarded user has no credentials, or retains the default "Arjun" seed profile
    const isUnonboarded = 
      !username || 
      !userId || 
      username === 'Arjun' || 
      userId === 'demo-user-arjun' || 
      userId === 'arjun-mumbai-uuid';

    if (isUnonboarded) {
      if (pathname !== '/onboarding') {
        router.push('/onboarding');
      } else {
        setChecked(true);
      }
    } else {
      if (pathname === '/onboarding') {
        router.push('/dashboard');
      } else {
        setChecked(true);
      }
    }
  }, [pathname, router]);

  // Prevent flashing content during the redirect check
  if (!checked) {
    const username = typeof window !== 'undefined' ? localStorage.getItem('prakriti_username') : null;
    const userId = typeof window !== 'undefined' ? localStorage.getItem('prakriti_user_id') : null;
    
    const isUnonboarded = 
      !username || 
      !userId || 
      username === 'Arjun' || 
      userId === 'demo-user-arjun' || 
      userId === 'arjun-mumbai-uuid';

    if (isUnonboarded && pathname !== '/onboarding') {
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
  }

  return <>{children}</>;
}
