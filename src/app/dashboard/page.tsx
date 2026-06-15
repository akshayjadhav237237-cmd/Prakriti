'use client';

import { useEffect, useState } from 'react';
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
  Cell,
} from 'recharts';
import InnerLayout from '@/components/InnerLayout';

// ── DESIGN TOKENS ──
const T = {
  bg: '#080808',
  surface: '#0f0f0f',
  surface2: '#161616',
  border: 'rgba(255,255,255,0.06)',
  borderActive: 'rgba(74,222,128,0.25)',
  text: '#f0ffe8',
  textSec: '#a0b0a0',
  textMut: '#506050',
  green: '#4ade80',
  greenDim: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
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
    'Heavy AC cooling season. Setting AC to 26�C saves up to 20% on cooling carbon. Try a fan assist � it drops perceived temperature by 3�C.',
};

// ── FADE-IN VARIANT ──
const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  }),
};

// ── CIRCULAR RING SVG ──
function CircularRing({
  pct,
  size = 120,
  strokeWidth = 6,
  color = '#4ade80',
}: {
  pct: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease-out' }}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          transform: 'rotate(90deg)',
          transformOrigin: `${size / 2}px ${size / 2}px`,
          fontFamily: "'Space Mono', monospace",
          fontSize: size === 80 ? '14px' : '18px',
          fontWeight: 700,
          fill: '#f0ffe8',
        }}
      >
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

type SeedType = typeof SEED;

export default function DashboardPage() {
  const [data, setData] = useState<SeedType>(SEED);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('prakriti_user');
      if (!stored) {
        localStorage.setItem('prakriti_user', JSON.stringify(SEED));
        // Seed auth keys so OnboardingGuard doesn't redirect
        if (!localStorage.getItem('prakriti_username')) {
          localStorage.setItem('prakriti_username', SEED.name);
          localStorage.setItem('prakriti_user_id', 'prakriti-demo-user');
        }

      } else {
        const parsed = JSON.parse(stored);
        // Validate structure — old format may lack envelopes/history
        const hasEnvelopes = parsed?.envelopes?.transport?.spent !== undefined;
        const hasHistory = Array.isArray(parsed?.history);
        if (hasEnvelopes && hasHistory) {
          setData(parsed as SeedType);
        } else {
          // Old format — reset to SEED
          localStorage.setItem('prakriti_user', JSON.stringify(SEED));
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
    { key: 'transport', label: 'Transport', icon: '\ud83d\ude97', equiv: '� 371 km on petrol scooter' },
    { key: 'food', label: 'Food', icon: '\ud83c\udf7d\ufe0f', equiv: '� 14 home-cooked meals' },
    { key: 'energy', label: 'Energy', icon: '\u26a1', equiv: '� 11 kWh grid electricity' },
    { key: 'lifestyle', label: 'Lifestyle', icon: '\ud83c\udfaf', equiv: '� 4 e-commerce deliveries' },
  ];

  const safeHistory = Array.isArray(data?.history) ? data.history : SEED.history;
  const sparkData = safeHistory.map((kg, i) => ({ week: `W${i + 1}`, kg }));

  const benchmarkData = [
    { name: 'You', value: totalSpent, fill: '#4ade80' },
    { name: 'Mumbai', value: 45.2, fill: '#506050' },
    { name: 'India', value: 52.1, fill: '#506050' },
    { name: 'Global', value: 65.4, fill: '#506050' },
    { name: 'Paris 1.5�C', value: 38.5, fill: '#22c55e' },
  ];

  return (
    <InnerLayout pageName="Dashboard">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* HEADER */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          custom={0}
          style={{
            marginBottom: 32,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: 32,
                color: T.text,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Good morning, {data.name}.
            </h1>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 15,
                color: T.textSec,
                marginTop: 6,
                marginBottom: 0,
              }}
            >
              Your carbon envelope for this week.
            </p>
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 9999,
              border: `1px solid ${T.borderActive}`,
              background: 'rgba(74,222,128,0.06)',
              fontFamily: "'Space Mono', monospace",
              fontSize: 12,
              color: T.green,
            }}
          >
            Week {data.week} \u00b7 Phase:{' '}
            {data.phase === 2 ? 'Budget' : data.phase === 1 ? 'Baseline' : 'Reduce'}
          </div>
        </motion.div>

        {/* ROW 1: Budget Hero + Companion */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)',
            gap: 20,
            marginBottom: 20,
          }}
          className="dash-row1"
        >
          {/* Budget Hero Card */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={1}
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 16,
              padding: '28px 32px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="dash-big-num"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontWeight: 700,
                    fontSize: 48,
                    color: T.text,
                    lineHeight: 1,
                    marginBottom: 6,
                  }}
                >
                  {totalSpent.toFixed(1)} kg
                </div>
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 14,
                    color: T.textSec,
                    marginBottom: 20,
                  }}
                >
                  CO2e used of {totalBudget} kg envelope
                </div>

                <div
                  style={{
                    height: 6,
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 9999,
                    overflow: 'hidden',
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: mounted ? `${pct}%` : '0%',
                      background: isWarning
                        ? 'linear-gradient(90deg,#f59e0b,#ef4444)'
                        : 'linear-gradient(90deg,#4ade80,#22c55e)',
                      borderRadius: 9999,
                      transition: 'width 0.8s ease-out',
                    }}
                  />
                </div>
                <div
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 13,
                    color: T.textSec,
                    marginBottom: 4,
                  }}
                >
                  {pct.toFixed(1)}% spent \u00b7 {(totalBudget - totalSpent).toFixed(2)} kg remaining
                </div>
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 13,
                    color: T.textMut,
                  }}
                >
                  3 days left in this week
                </div>
              </div>

              <div style={{ flexShrink: 0, marginLeft: 24 }} className="dash-ring">
                <CircularRing pct={pct} color={isWarning ? T.amber : T.green} />
              </div>
            </div>
          </motion.div>

          {/* Companion Card */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={2}
            style={{
              background: `linear-gradient(135deg, rgba(34,197,94,0.04), transparent), ${T.surface}`,
              border: '1px solid rgba(74,222,128,0.12)',
              borderRadius: 16,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 20,
                  color: T.text,
                  marginBottom: 4,
                }}
              >
                \ud83d\udc12 {data.companion.name}
              </div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: T.green }}>
                Baby \u00b7 Stage {data.companion.stage}/5
              </div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: T.textMut, marginTop: 2 }}>
                {data.companion.species}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: T.textMut }}>
                  Energy
                </span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: T.green }}>
                  {data.companion.energy}/100
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 9999,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: mounted ? `${data.companion.energy}%` : '0%',
                    background: T.green,
                    borderRadius: 9999,
                    transition: 'width 0.8s ease-out',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 8,
                background: 'rgba(212,175,55,0.06)',
                border: '1px solid rgba(212,175,55,0.15)',
              }}
            >
              <span style={{ fontSize: 16 }}>?</span>
              <div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, color: T.gold, fontWeight: 700 }}>
                  {data.pebbles} Pebbles
                </div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: T.textMut }}>
                  earned this month
                </div>
              </div>
            </div>

            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 13,
                color: T.textMut,
                fontStyle: 'italic',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              3 weeks under budget unlocks
              <br />
              Shola Forest adventure
            </p>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                style={{
                  padding: '8px 14px',
                  borderRadius: 9999,
                  border: '1px solid rgba(212,175,55,0.4)',
                  background: 'transparent',
                  color: T.gold,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(212,175,55,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Earn Pebbles ?
              </button>
              <button
                style={{
                  padding: '8px 14px',
                  borderRadius: 9999,
                  border: '1px solid rgba(74,222,128,0.2)',
                  background: 'rgba(74,222,128,0.1)',
                  color: T.green,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(74,222,128,0.18)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(74,222,128,0.1)')}
              >
                Adventure ?
              </button>
            </div>
          </motion.div>
        </div>

        {/* ROW 2: Envelope Cards */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          custom={3}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2,1fr)',
            gap: 16,
            marginBottom: 20,
          }}
          className="dash-envelopes"
        >
          {envelopes.map((env) => {
            const envData = data.envelopes[env.key as keyof typeof data.envelopes];
            const ep = Math.min((envData.spent / envData.allocated) * 100, 100);
            const over = envData.spent > envData.allocated;
            const warn = ep > 80 && !over;
            const barColor = over ? T.red : warn ? T.amber : T.green;
            const borderColor = over
              ? 'rgba(239,68,68,0.35)'
              : warn
              ? 'rgba(245,158,11,0.25)'
              : 'rgba(74,222,128,0.15)';
            return (
              <div
                key={env.key}
                style={{
                  background: T.surface,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 12,
                  padding: '20px 24px',
                  boxShadow: over ? '0 0 16px rgba(239,68,68,0.12)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 9999,
                        background: 'rgba(255,255,255,0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    >
                      {env.icon}
                    </span>
                    <div>
                      <div
                        style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 11,
                          color: T.textMut,
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                        }}
                      >
                        {env.label}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Space Mono', monospace",
                          fontWeight: 700,
                          fontSize: 20,
                          color: T.text,
                        }}
                      >
                        {envData.spent.toFixed(1)}{' '}
                        <span style={{ fontSize: 13, fontWeight: 400, color: T.textSec }}>
                          / {envData.allocated} kg
                        </span>
                      </div>
                    </div>
                  </div>
                  {over && (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 9999,
                        background: 'rgba(239,68,68,0.12)',
                        color: T.red,
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 10,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        flexShrink: 0,
                      }}
                    >
                      OVER
                    </span>
                  )}
                  {warn && (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 9999,
                        background: 'rgba(245,158,11,0.12)',
                        color: T.amber,
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 10,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        flexShrink: 0,
                      }}
                    >
                      HIGH
                    </span>
                  )}
                </div>

                <div
                  style={{
                    height: 4,
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 9999,
                    overflow: 'hidden',
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: mounted ? `${ep}%` : '0%',
                      background: barColor,
                      borderRadius: 9999,
                      transition: 'width 0.6s ease-out',
                    }}
                  />
                </div>

                <p
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 12,
                    color: T.textMut,
                    fontStyle: 'italic',
                    margin: 0,
                  }}
                >
                  {env.equiv}
                </p>
              </div>
            );
          })}
        </motion.div>

        {/* ROW 3: Sparkline + Benchmarks */}
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}
          className="dash-row3"
        >
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={4}
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 16,
              padding: '24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11,
                  color: T.textMut,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}
              >
                Weekly Trend
              </div>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: T.green }}>
                \u2193 18% vs avg
              </span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={sparkData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="week"
                  tick={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fill: '#506050' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fill: '#506050' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#161616',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 12,
                    color: '#f0ffe8',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="kg"
                  stroke="#4ade80"
                  strokeWidth={2}
                  fill="url(#trendGrad)"
                  dot={{ fill: '#4ade80', r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={5}
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 16,
              padding: '24px',
            }}
          >
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                color: T.textMut,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: 16,
              }}
            >
              Regional Benchmarks
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={benchmarkData}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  tick={{ fontFamily: "'Space Mono',monospace", fontSize: 10, fill: '#506050' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={75}
                  tick={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fill: '#a0b0a0' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#161616',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 12,
                    color: '#f0ffe8',
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                  {benchmarkData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.fill}
                      fillOpacity={
                        entry.name === 'You' || entry.name === 'Paris 1.5�C' ? 1 : 0.5
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* ROW 4: AI Coach */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          custom={6}
          style={{
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 16,
            background: 'rgba(74,222,128,0.04)',
            border: '1px solid rgba(74,222,128,0.18)',
          }}
        >
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              color: T.green,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 14 }}>\ud83e\udd16</span> AI Coach
          </div>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 14,
              color: T.text,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {data.lastInsight}
          </p>
        </motion.div>

        {/* ROW 5: Seasonal Banner */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          custom={7}
          style={{
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 16,
            background: 'rgba(245,158,11,0.04)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}
        >
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              color: T.amber,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 14 }}>\u2600\ufe0f</span> Summer Mode
          </div>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 14,
              color: T.text,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Heavy AC cooling season is here. Setting AC to 26�C saves up to 20% on cooling carbon.
            Try fan assist � drops perceived temperature by 3�C.
          </p>
        </motion.div>

        {/* ROW 6: Quick Stats Footer */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          custom={8}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            marginBottom: 8,
          }}
          className="dash-stats"
        >
          {[
            { label: 'City', value: data.city, icon: '\ud83d\udccd' },
            {
              label: 'Phase',
              value: data.phase === 2 ? 'Budget' : data.phase === 1 ? 'Baseline' : 'Reduce',
              icon: '\ud83d\udcca',
            },
            { label: 'Pebbles', value: `? ${data.pebbles}`, icon: '\u2728' },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: T.surface2,
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span style={{ fontSize: 20 }}>{stat.icon}</span>
              <div>
                <div
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 10,
                    color: T.textMut,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: 2,
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 15,
                    fontWeight: 700,
                    color: T.text,
                  }}
                >
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .dash-row1 { grid-template-columns: 1fr !important; }
          .dash-row3 { grid-template-columns: 1fr !important; }
          .dash-envelopes { grid-template-columns: 1fr !important; }
          .dash-stats { grid-template-columns: 1fr !important; }
          .dash-big-num { font-size: 32px !important; }
          .dash-ring { display: none; }
        }
        @media (max-width: 1023px) {
          .dash-row1 { grid-template-columns: 1fr !important; }
          .dash-envelopes { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </InnerLayout>
  );
}
