'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TrackRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#080808',
      color: 'rgba(240,237,230,0.6)',
      fontFamily: "'Space Grotesk', sans-serif",
    }}>
      <p>Redirecting to dashboard...</p>
    </div>
  );
}
