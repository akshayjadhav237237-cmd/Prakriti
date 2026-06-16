'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, FileText, Calculator, Camera } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/mobile', icon: Home },
    { label: 'Dashboard', href: '/mobile/dashboard', icon: LayoutDashboard },
    { label: 'Log', href: '/mobile/log', icon: FileText },
    { label: 'Calculate', href: '/mobile/calculate', icon: Calculator },
    { label: 'Scan', href: '/mobile/scan', icon: Camera },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: '#0f0f0f',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 9999,
        paddingBottom: 'safe-area-inset-bottom',
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              height: '100%',
              textDecoration: 'none',
              color: isActive ? '#4ade80' : '#a0b0a0',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '10px',
              gap: '4px',
              transition: 'color 0.2s',
            }}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
