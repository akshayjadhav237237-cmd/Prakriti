import React from 'react';
import './mobile.css';

export const metadata = {
  title: 'Prakriti Mobile',
  description: 'Carbon Budget Platform for Urban India - Mobile Version',
};

export default function MobileRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ backgroundColor: '#080808', minHeight: '100vh', width: '100%' }}>
      {children}
    </div>
  );
}
