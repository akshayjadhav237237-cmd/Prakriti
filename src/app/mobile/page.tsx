'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const FEATURES = [
  {
    num: '01',
    title: 'Carbon Budgeting.',
    bullets: [
      'Weekly carbon envelope system (38.46 kg)',
      'YNAB-inspired proactive allocation',
      'Visual spend-vs-budget tracker',
      'Daily emission breakdown by category',
    ],
    link: '/mobile/dashboard',
  },
  {
    num: '02',
    title: 'Gemini Vision Scan.',
    bullets: [
      'Scan any Indian electricity bill',
      'Auto-parse Swiggy & Zomato receipts',
      'Petrol pump slip recognition',
      'Zero manual data entry',
    ],
    link: '/mobile/log',
  },
  {
    num: '03',
    title: 'India-First Data.',
    bullets: [
      'CEA grid factor: 0.71 kg/kWh',
      'ARAI road transport coefficients',
      'Indian domestic aviation calculations',
      'Regional Swiggy & Zomato factors',
    ],
    link: '/mobile/calculate',
  },
];

export default function MobileLandingPage() {
  const router = useRouter();
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const username = localStorage.getItem('prakriti_username');
      const userId = localStorage.getItem('prakriti_user_id');
      const isNewUser =
        !username ||
        !userId ||
        username === 'Arjun' ||
        userId === 'demo-user-arjun' ||
        userId === 'arjun-mumbai-uuid';
      setHasUser(!isNewUser);
    }
  }, []);

  const handleCTA = () => {
    if (hasUser) {
      router.push('/mobile/dashboard');
    } else {
      router.push('/mobile/onboarding');
    }
  };

  return (
    <div
      style={{
        background: 'radial-gradient(circle at center, #111111 0%, #080808 100%)',
        color: '#f0ffe8',
        minHeight: '100vh',
        fontFamily: "'Space Grotesk', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 20px 80px',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        width: '100%',
      }}
    >
      {/* HEADER */}
      <header
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '48px',
        }}
      >
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          PRAKRITI<span style={{ color: '#4ade80' }}>*</span>
        </span>
      </header>

      {/* HERO SECTION */}
      <section
        style={{
          width: '100%',
          textAlign: 'center',
          marginBottom: '56px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: '36px',
            fontWeight: 800,
            lineHeight: 1.1,
            color: '#f0ffe8',
            margin: '0 0 16px 0',
          }}
        >
          Your carbon.<br />Your budget.<br />Your India.
        </h1>
        <p
          style={{
            fontSize: '15px',
            color: '#a0b0a0',
            lineHeight: 1.5,
            maxWidth: '280px',
            margin: '0 0 32px 0',
          }}
        >
          YNAB-inspired weekly envelope carbon accounting tuned precisely for Indian lifestyles.
        </p>

        <button
          onClick={handleCTA}
          style={{
            width: '100%',
            maxWidth: '320px',
            height: '48px',
            borderRadius: '9999px',
            background: '#f0ffe8',
            color: '#080808',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '15px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            transition: 'transform 0.1s active',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(240, 255, 232, 0.15)',
          }}
        >
          {hasUser ? 'Enter Dashboard' : 'Start Carbon Budgeting'} →
        </button>
      </section>

      {/* FEATURES SECTION */}
      <section style={{ width: '100%', maxWidth: '400px' }}>
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: '20px',
            fontWeight: 700,
            marginBottom: '24px',
            textAlign: 'left',
          }}
        >
          Core Engine Features
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {FEATURES.map((feat) => (
            <div
              key={feat.num}
              style={{
                background: '#0f0f0f',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px',
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: '16px',
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {feat.title}
                </h3>
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '12px',
                    color: '#4ade80',
                  }}
                >
                  {feat.num}
                </span>
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '18px',
                  color: '#a0b0a0',
                  fontSize: '13px',
                  lineHeight: 1.6,
                }}
              >
                {feat.bullets.map((b, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          marginTop: '64px',
          width: '100%',
          textAlign: 'center',
          fontSize: '11px',
          color: '#506050',
          fontFamily: "'Space Mono', monospace",
        }}
      >
        PRAKRITI © 2026 · Built for Urban India
      </footer>
    </div>
  );
}
