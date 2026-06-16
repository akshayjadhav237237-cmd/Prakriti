'use client';

import React from 'react';
import MobileNav from './MobileNav';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div
      style={{
        background: '#080808',
        color: '#f0ffe8',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        width: '100%',
        paddingBottom: '80px', /* padding to clear bottom tab nav */
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        /* Overrides for top desktop navbar inside mobile viewports */
        nav:not([style*="bottom"]) {
          width: 100% !important;
          max-width: 100vw !important;
          left: 0 !important;
          right: 0 !important;
          margin: 0 !important;
          padding: 0 16px !important;
          box-sizing: border-box !important;
          overflow-x: hidden !important;
        }
      `}} />
      <div style={{ flex: 1, width: '100%' }}>{children}</div>
      <MobileNav />
    </div>
  );
}
