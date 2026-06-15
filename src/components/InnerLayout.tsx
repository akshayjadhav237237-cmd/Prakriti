'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
];

// Demo data for sidebar bottom section
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
    // Force dark mode on inner pages
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    document.documentElement.style.backgroundColor = '#080808';

    // Load user data from localStorage if available
    try {
      const stored = localStorage.getItem('prakriti_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserData({
          name: parsed.name || DEMO.name,
          city: parsed.city || DEMO.city,
          pebbles: parsed.pebbles || DEMO.pebbles,
          week: parsed.week || DEMO.week,
          totalWeeks: DEMO.totalWeeks,
          phase: parsed.phase === 2 ? 'Budget' : parsed.phase === 1 ? 'Baseline' : 'Reduce',
          spent: parsed.envelopes ? Object.values(parsed.envelopes as Record<string, {spent: number}>).reduce((a, b) => a + b.spent, 0) : DEMO.spent,
          budget: parsed.weeklyBudget || DEMO.budget,
        });
      }
    } catch {}
  }, []);

  const spentPct = Math.min((userData.spent / userData.budget) * 100, 100);

  return (
    <div style={{ background: '#080808', minHeight: '100vh', display: 'flex' }}>

      {/* ── SIDEBAR (desktop ≥1024px) ── */}
      <aside style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '240px',
        background: '#080808',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        zIndex: 200,
        overflowY: 'auto',
      }}
      className="inner-sidebar"
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
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
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
                  marginLeft: active ? '0' : '2px',
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
            );
          })}
        </nav>

        {/* Bottom section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
          {/* User pill */}
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', color: '#a0b0a0' }}>
            {userData.name} · {userData.city}
          </div>

          {/* Pebbles */}
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', color: '#d4af37' }}>
            ◆ {userData.pebbles} Pebbles
          </div>

          {/* Phase pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 10px',
            borderRadius: '9999px',
            border: '1px solid rgba(74,222,128,0.25)',
            background: 'rgba(74,222,128,0.06)',
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            color: '#4ade80',
            alignSelf: 'flex-start',
          }}>
            Week {userData.week} of {userData.totalWeeks} · {userData.phase}
          </div>

          {/* Budget bar */}
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#506050', marginBottom: '6px' }}>
              {userData.spent.toFixed(1)} / {userData.budget} kg CO₂e
            </div>
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${spentPct}%`,
                background: spentPct > 90 ? 'linear-gradient(90deg,#f59e0b,#ef4444)' : 'linear-gradient(90deg,#4ade80,#22c55e)',
                borderRadius: '9999px',
                transition: 'width 0.8s ease-out',
              }} />
            </div>
          </div>
        </div>
      </aside>

      {/* ── MOBILE TOP BAR ── */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '56px',
        background: '#080808',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 200,
      }}
      className="inner-topbar"
      >
        <Link href="/" style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#f0ffe8',
          textDecoration: 'none',
        }}>
          PRAKRITI<span style={{ color: '#00FF41' }}>*</span>
        </Link>

        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '14px',
          color: '#a0b0a0',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
        }}>
          {pageName}
        </span>

        {/* Hamburger */}
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
          aria-label="Menu"
        >
          {[0, 1, 2].map(i => (
            <span key={i} style={{ display: 'block', width: '20px', height: '1.5px', background: '#a0b0a0', borderRadius: '2px' }} />
          ))}
        </button>
      </div>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setDrawerOpen(false)}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '240px',
              height: '100%',
              background: '#0f0f0f',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
              padding: '24px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
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
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px', borderRadius: '8px',
                  background: active ? 'rgba(74,222,128,0.08)' : 'transparent',
                  color: active ? '#4ade80' : '#a0b0a0',
                  textDecoration: 'none',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '15px',
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
      <main style={{
        flex: 1,
        background: '#080808',
        minHeight: '100vh',
      }}
      className="inner-main"
      >
        {children}
      </main>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '56px',
        background: '#0f0f0f',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 200,
      }}
      className="inner-bottomtabs"
      >
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              textDecoration: 'none',
              flex: 1,
              padding: '8px 0',
            }}>
              {item.icon(active)}
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '10px',
                color: active ? '#4ade80' : '#506050',
              }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <style>{`
        /* Desktop: show sidebar, hide topbar + bottomtabs */
        @media (min-width: 1024px) {
          .inner-sidebar { display: flex !important; }
          .inner-topbar { display: none !important; }
          .inner-bottomtabs { display: none !important; }
          .inner-main { margin-left: 240px; padding: 40px; padding-bottom: 40px; }
        }
        /* Mobile/tablet: hide sidebar, show topbar + bottomtabs */
        @media (max-width: 1023px) {
          .inner-sidebar { display: none !important; }
          .inner-topbar { display: flex !important; }
          .inner-bottomtabs { display: flex !important; }
          .inner-main { margin-left: 0; padding: 72px 16px 72px 16px; }
        }
      `}</style>
    </div>
  );
}
