'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calculator } from 'lucide-react';

interface InnerLayoutProps {
  children: React.ReactNode;
  pageName?: string;
}

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#4ade80' : '#a0b0a0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    label: 'Log Activity',
    href: '/log',
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#4ade80' : '#a0b0a0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  {
    label: 'Insights',
    href: '/insights',
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#4ade80' : '#a0b0a0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    label: 'Calculate',
    href: '/calculate',
    icon: (active: boolean) => (
      <Calculator size={18} stroke={active ? '#4ade80' : '#a0b0a0'} strokeWidth="2" />
    ),
  },
];

const DEMO = {
  name: 'Arjun',
  city: 'Mumbai',
  pebbles: 45,
  week: 3,
  totalWeeks: 13,
  phase: 'Budget',
  spent: 34.8,
  budget: 38.46,
};

export default function InnerLayout({ children, pageName }: InnerLayoutProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userData, setUserData] = useState(DEMO);

  useEffect(() => {
    // Force dark mode
    if (typeof window !== 'undefined') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.style.backgroundColor = '#080808';
    }

    // Load user data from localStorage safely
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('prakriti_user');
      const storedUsername = localStorage.getItem('prakriti_username');
      const storedCity = localStorage.getItem('prakriti_city');

      if (stored) {
        const parsed = JSON.parse(stored);
        const hasEnvelopes = parsed?.envelopes?.transport !== undefined;
        let spent = DEMO.spent;
        if (hasEnvelopes) {
          try {
            spent = Object.values(parsed.envelopes as Record<string, { spent: number }>)
              .reduce((a, b) => a + (b?.spent ?? 0), 0);
          } catch { /* keep DEMO.spent */ }
        }
        setUserData({
          name: storedUsername || parsed?.name || DEMO.name,
          city: storedCity || parsed?.city || DEMO.city,
          pebbles: parsed?.pebbles ?? DEMO.pebbles,
          week: parsed?.week ?? DEMO.week,
          totalWeeks: DEMO.totalWeeks,
          phase: parsed?.phase === 2 ? 'Budget' : parsed?.phase === 1 ? 'Baseline' : 'Reduce',
          spent,
          budget: parsed?.weeklyBudget ?? DEMO.budget,
        });
      } else {
        setUserData({
          ...DEMO,
          name: storedUsername || DEMO.name,
          city: storedCity || DEMO.city,
        });
      }
    } catch { /* keep DEMO */ }
  }, []);

  const spentPct = Math.min((userData.spent / userData.budget) * 100, 100);

  return (
    <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', position: 'relative' }}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* ── SIDEBAR (desktop ≥1024px, shown via globals.css) ── */}
      <aside
        className="inner-sidebar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '240px',
          background: '#080808',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          flexDirection: 'column',
          padding: '24px 16px',
          zIndex: 200,
          overflowY: 'auto',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '15px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#f0ffe8',
          textDecoration: 'none',
          marginBottom: '40px',
          display: 'block',
          flexShrink: 0,
        }}>
          PRAKRITI<span style={{ color: '#00FF41' }}>*</span>
        </Link>

        {/* Nav items */}
        <nav aria-label="Main navigation" role="navigation" style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <ul role="list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href} role="listitem">
                  <Link
                    href={item.href}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      borderLeft: active ? '2px solid #4ade80' : '2px solid transparent',
                      background: active ? 'rgba(74,222,128,0.08)' : 'transparent',
                      color: active ? '#4ade80' : '#a0b0a0',
                      textDecoration: 'none',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '14px',
                      fontWeight: active ? 500 : 400,
                      transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                        (e.currentTarget as HTMLElement).style.color = '#f0ffe8';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = '#a0b0a0';
                      }
                    }}
                  >
                    {item.icon(active)}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', color: '#a0b0a0' }}>
            {userData.name} · {userData.city}
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', color: '#d4af37' }}>
            ◆ {userData.pebbles} Pebbles
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
            borderRadius: '9999px', border: '1px solid rgba(74,222,128,0.25)',
            background: 'rgba(74,222,128,0.06)', fontFamily: "'Space Mono', monospace",
            fontSize: '11px', color: '#4ade80', alignSelf: 'flex-start',
          }}>
            Week {userData.week} of {userData.totalWeeks} · {userData.phase}
          </div>
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#708070', marginBottom: '6px' }}>
              {userData.spent.toFixed(1)} / {userData.budget} kg CO₂e
            </div>
            <div
              role="progressbar"
              aria-valuenow={userData.spent}
              aria-valuemin={0}
              aria-valuemax={userData.budget}
              aria-label={`Carbon usage: ${userData.spent.toFixed(1)} of ${userData.budget} kg`}
              style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}
            >
              <div style={{
                height: '100%',
                width: `${spentPct}%`,
                background: spentPct > 90
                  ? 'linear-gradient(90deg,#f59e0b,#ef4444)'
                  : 'linear-gradient(90deg,#4ade80,#22c55e)',
                borderRadius: '9999px',
                transition: 'width 0.8s ease-out',
              }} />
            </div>
          </div>
        </div>
      </aside>

      {/* ── MOBILE TOP BAR (hidden on desktop via globals.css) ── */}
      <div
        className="inner-topbar"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '56px',
          background: '#080808', borderBottom: '1px solid rgba(255,255,255,0.06)',
          alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', zIndex: 200,
        }}
      >
        <Link href="/" style={{
          fontFamily: "'Space Mono', monospace", fontSize: '13px', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f0ffe8', textDecoration: 'none',
        }}>
          PRAKRITI<span style={{ color: '#00FF41' }}>*</span>
        </Link>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', color: '#a0b0a0',
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        }}>
          {pageName}
        </span>
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}
          aria-label="Menu"
        >
          {[0,1,2].map(i => (
            <span key={i} style={{ display: 'block', width: '20px', height: '1.5px', background: '#a0b0a0', borderRadius: '2px' }} />
          ))}
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setDrawerOpen(false)}
        >
          <div
            style={{
              position: 'absolute', top: 0, right: 0, width: '240px', height: '100%',
              background: '#0f0f0f', borderLeft: '1px solid rgba(255,255,255,0.06)',
              padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '4px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setDrawerOpen(false)}
              style={{ alignSelf: 'flex-end', background: 'none', border: 'none', color: '#a0b0a0', cursor: 'pointer', marginBottom: '16px', fontSize: '20px' }}
            >✕</button>
            {NAV_ITEMS.map(item => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={() => setDrawerOpen(false)} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px',
                  background: active ? 'rgba(74,222,128,0.08)' : 'transparent',
                  color: active ? '#4ade80' : '#a0b0a0', textDecoration: 'none',
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px',
                }}>
                  {item.icon(active)}
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main
        id="main-content"
        className="inner-main"
        style={{
          flex: 1,
          background: '#080808',
          minHeight: '100vh',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </main>

      {/* ── MOBILE BOTTOM TAB BAR (hidden on desktop via globals.css) ── */}
      <nav
        className="inner-bottomtabs"
        aria-label="Bottom navigation"
        role="navigation"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, height: '56px',
          background: '#0f0f0f', borderTop: '1px solid rgba(255,255,255,0.06)',
          alignItems: 'center', justifyContent: 'space-around', zIndex: 200,
        }}
      >
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '3px', textDecoration: 'none', flex: 1, padding: '8px 0',
              }}
            >
              {item.icon(active)}
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: '10px',
                color: active ? '#4ade80' : '#708070',
              }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
