'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import MobileLayout from '@/components/mobile/MobileLayout';

// ── DESIGN TOKENS ──
const T = {
  bg: '#080808',
  surface: '#0f0f0f',
  surface2: '#161616',
  border: 'rgba(255,255,255,0.06)',
  borderActive: 'rgba(74,222,128,0.25)',
  text: '#f0ffe8',
  textSec: '#a0b0a0',
  textMut: '#708070',
  green: '#4ade80',
  greenDim: '#22c55e',
  amber: '#f59e0b',
  red: '#ff6b6b',
  gold: '#d4af37',
};

// ── SEED DATA ──
const SEED = {
  name: 'Arjun',
  city: 'Mumbai',
  weeklyBudget: 38.46,
  pebbles: 45,
  phase: 2,
  week: 3,
  envelopes: {
    transport: { allocated: 15.0, spent: 12.4 },
    food: { allocated: 10.0, spent: 11.2 },
    energy: { allocated: 8.0, spent: 7.8 },
    lifestyle: { allocated: 5.46, spent: 3.4 },
  },
  companion: { name: 'Chiku', species: 'Lion-Tailed Macaque', stage: 1, energy: 45 },
  history: [42.1, 39.8, 34.8],
  lastInsight:
    'Heavy AC cooling season. Setting AC to 26°C saves up to 20% on cooling carbon. Try a fan assist → it drops perceived temperature by 3°C.',
};

type SeedType = typeof SEED;

export default function MobileDashboard() {
  const [data, setData] = useState<SeedType>(SEED);
  const [mounted, setMounted] = useState(false);
  const [showPebblesModal, setShowPebblesModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('prakriti_user');
      const storedUsername = localStorage.getItem('prakriti_username');
      const storedCity = localStorage.getItem('prakriti_city');
      
      if (!stored) {
        const initialData = {
          ...SEED,
          name: storedUsername || SEED.name,
          city: storedCity || SEED.city,
        };
        localStorage.setItem('prakriti_user', JSON.stringify(initialData));
        setData(initialData);
      } else {
        const parsed = JSON.parse(stored);
        const hasEnvelopes = parsed?.envelopes?.transport?.spent !== undefined;
        const hasHistory = Array.isArray(parsed?.history);
        if (hasEnvelopes && hasHistory) {
          const merged = {
            ...parsed,
            name: storedUsername || parsed.name || SEED.name,
            city: storedCity || parsed.city || SEED.city,
          };
          setData(merged as SeedType);
        } else {
          const mergedData = {
            ...SEED,
            name: storedUsername || parsed.name || SEED.name,
            city: storedCity || parsed.city || SEED.city,
          };
          localStorage.setItem('prakriti_user', JSON.stringify(mergedData));
          setData(mergedData);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const safeEnvelopes = data?.envelopes ?? SEED.envelopes;
  const totalSpent = Object.values(safeEnvelopes).reduce((a, b) => a + b.spent, 0);
  const totalBudget = data?.weeklyBudget ?? SEED.weeklyBudget;
  const pct = Math.min((totalSpent / totalBudget) * 100, 100);
  const isWarning = pct > 90;

  const envelopes = [
    { key: 'transport', label: 'Transport', icon: '🚗', equiv: '→ 371 km on petrol scooter' },
    { key: 'food', label: 'Food', icon: '🍽️', equiv: '→ 14 home-cooked meals' },
    { key: 'energy', label: 'Energy', icon: '⚡', equiv: '→ 11 kWh grid electricity' },
    { key: 'lifestyle', label: 'Lifestyle', icon: '🎯', equiv: '→ 4 e-commerce deliveries' },
  ];

  const safeHistory = Array.isArray(data?.history) ? data.history : SEED.history;
  const sparkData = safeHistory.map((kg, i) => ({ week: `W${i + 1}`, kg }));

  const benchmarkData = [
    { name: 'You', value: totalSpent, fill: '#4ade80' },
    { name: data.city || 'Mumbai', value: 45.2, fill: '#506050' },
    { name: 'India', value: 52.1, fill: '#506050' },
    { name: 'Global', value: 65.4, fill: '#506050' },
    { name: 'Paris 1.5°C', value: 38.5, fill: '#22c55e' },
  ];

  if (!mounted) return null;

  return (
    <MobileLayout>
      <main style={{ padding: '20px 16px', boxSizing: 'border-box', width: '100%' }}>
        {/* HEADER */}
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '24px', color: T.text, margin: 0 }}>
              Good morning, {data.name}.
            </h1>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', color: T.textSec, marginTop: '4px', margin: 0 }}>
              Your carbon envelope status in {data.city}.
            </p>
          </div>
          <div
            style={{
              alignSelf: 'flex-start',
              padding: '4px 10px',
              borderRadius: '999px',
              border: `1px solid ${T.borderActive}`,
              background: 'rgba(74,222,128,0.06)',
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              color: T.green,
            }}
          >
            Week {data.week} · {data.phase === 2 ? 'Budget' : 'Baseline'}
          </div>
        </div>

        {/* SPENT CIRCLE / SUMMARY CARD */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: T.textMut, textTransform: 'uppercase' }}>
              WEEKLY SPENT
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: isWarning ? T.red : T.green, fontFamily: "'Space Mono', monospace", marginTop: '4px' }}>
              {totalSpent.toFixed(1)} <span style={{ fontSize: '14px', fontWeight: 500, color: T.textSec }}>kg</span>
            </div>
            <div style={{ fontSize: '12px', color: T.textSec, marginTop: '4px' }}>
              of {totalBudget.toFixed(1)} kg budget
            </div>
          </div>

          {/* Simple progress ring */}
          <div style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="70" height="70" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="35" cy="35" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              <circle
                cx="35"
                cy="35"
                r="28"
                fill="none"
                stroke={isWarning ? T.red : T.green}
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - pct / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <span style={{ position: 'absolute', fontFamily: "'Space Mono', monospace", fontSize: '12px', fontWeight: 700 }}>
              {Math.round(pct)}%
            </span>
          </div>
        </div>

        {/* CHIKU COMPANION CARD */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '40px' }}>🐒</div>
            <div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 700, margin: 0 }}>
                {data.companion.name}
              </h2>
              <span style={{ fontSize: '12px', color: T.textSec }}>
                {data.companion.species} · Stage {data.companion.stage}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: T.surface2, padding: '12px', borderRadius: '10px' }}>
            <div>
              <div style={{ fontSize: '13px', color: T.gold, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>
                ◆ {data.pebbles} Pebbles
              </div>
              <span style={{ fontSize: '10px', color: T.textMut }}>earned this month</span>
            </div>
            <div>
              <div style={{ fontSize: '13px', color: T.green, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>
                ⚡ {data.companion.energy}%
              </div>
              <span style={{ fontSize: '10px', color: T.textMut }}>energy levels</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowPebblesModal(true)}
              style={{
                flex: 1,
                height: '44px',
                borderRadius: '999px',
                border: '1px solid rgba(212,175,55,0.4)',
                background: 'transparent',
                color: T.gold,
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Earn Pebbles?
            </button>
            <button
              onClick={() => window.location.href = '/mobile/scan'}
              style={{
                flex: 1,
                height: '44px',
                borderRadius: '999px',
                border: '1px solid rgba(74,222,128,0.2)',
                background: 'rgba(74,222,128,0.1)',
                color: T.green,
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Adventure?
            </button>
          </div>
        </div>

        {/* ENVELOPES LIST */}
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>
            Envelopes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {envelopes.map((env) => {
              const spent = safeEnvelopes[env.key as keyof typeof safeEnvelopes]?.spent ?? 0;
              const allocated = safeEnvelopes[env.key as keyof typeof safeEnvelopes]?.allocated ?? 1.0;
              const ratio = Math.min((spent / allocated) * 100, 100);
              const envWarning = spent > allocated;

              return (
                <div
                  key={env.key}
                  style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: '12px',
                    padding: '16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{env.icon}</span>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{env.label}</span>
                    </div>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', color: envWarning ? T.red : T.textSec }}>
                      {spent.toFixed(1)} / {allocated.toFixed(1)} kg
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: '100%', height: '8px', background: T.surface2, borderRadius: '999px', overflow: 'hidden', marginBottom: '6px' }}>
                    <div
                      style={{
                        width: `${ratio}%`,
                        height: '100%',
                        background: envWarning ? T.red : T.green,
                        borderRadius: '999px',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '10px', color: T.textMut, fontFamily: "'Space Mono', monospace" }}>
                    {env.equiv}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* REGIONAL BENCHMARKS */}
        <section style={{ marginBottom: '20px' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>
            Benchmarks
          </h2>
          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: '16px',
              padding: '16px',
            }}
          >
            <div style={{ width: '100%', height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benchmarkData} layout="vertical" margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fill: '#a0b0a0' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </main>

      {/* PEBBLES MODAL */}
      {showPebblesModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(8,8,8,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
          }}
          onClick={() => setShowPebblesModal(false)}
        >
          <div
            style={{
              background: '#0f0f0f',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16,
              padding: '24px',
              maxWidth: '320px',
              width: '100%',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', color: '#f0ffe8', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Earn Pebbles <span style={{ color: '#d4af37' }}>◆</span>
            </h3>
            <ul style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', color: '#a0b0a0', paddingLeft: '16px', margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '10px', lineHeight: 1.4 }}>
              <li><strong>Budgeting:</strong> Keep weekly carbon footprint below allocated limit: +50 Pebbles.</li>
              <li><strong>Scanning:</strong> Log utility bills or Zomato receipts: +15 Pebbles.</li>
              <li><strong>Logging:</strong> Manual logging of commutes: +5 Pebbles.</li>
              <li><strong>Adventures:</strong> Send Chiku to explore the forest to discover Pebbles.</li>
            </ul>
            <button
              onClick={() => setShowPebblesModal(false)}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '999px',
                background: '#4ade80',
                color: '#080808',
                border: 'none',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
