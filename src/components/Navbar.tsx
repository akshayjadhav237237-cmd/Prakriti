'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const HOME_LINKS = [
  { label: 'Track', href: '/track' },
  { label: 'Insights', href: '/insights' },
  { label: 'About', href: '/about' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'GitHub', href: 'https://github.com/akshayjadhav237237-cmd/Prakriti' },
];

const INT_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Track', href: '/track' },
  { label: 'Insights', href: '/insights' },
];

export default function Navbar() {
  const path = usePathname();
  const isHome = path === '/';

  if (isHome) {
    return (
      <nav style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        background: 'rgba(12,12,10,0.82)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid rgba(240,237,230,0.1)',
        borderRadius: '14px',
        padding: '7px 10px',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
      }}>
        {HOME_LINKS.map(link => (
          <Link
            key={link.label}
            href={link.href}
            target={link.href.startsWith('http') ? '_blank' : undefined}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '14px',
              fontWeight: 400,
              color: 'rgba(240,237,230,0.5)',
              textDecoration: 'none',
              padding: '7px 16px',
              borderRadius: '8px',
              transition: 'color 0.18s ease, background 0.18s ease',
              display: 'inline-block',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#f0ede6';
              e.currentTarget.style.background = 'rgba(240,237,230,0.06)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(240,237,230,0.5)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    );
  }

  /* Interior */
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: '58px',
      background: 'rgba(8,8,8,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(240,237,230,0.07)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 40px', zIndex: 500,
    }}>
      <Link href="/" style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: '13px', fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: '#f0ede6', textDecoration: 'none',
      }}>
        PRAKRITI<span style={{ color: '#39ff7a' }}>*</span>
      </Link>
      <div style={{ display: 'flex', gap: '4px' }}>
        {INT_LINKS.map(link => (
          <Link key={link.href} href={link.href} style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '14px',
            color: path === link.href ? '#f0ede6' : 'rgba(240,237,230,0.42)',
            textDecoration: 'none', padding: '6px 14px',
            borderRadius: '8px', transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#f0ede6'}
            onMouseLeave={e => e.currentTarget.style.color = 
              path === link.href ? '#f0ede6' : 'rgba(240,237,230,0.42)'}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
