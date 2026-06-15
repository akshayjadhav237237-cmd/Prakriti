'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, ReferenceLine
} from 'recharts';
import { dbService } from '@/core/supabase';
import confetti from 'canvas-confetti';
import InnerLayout from '@/components/InnerLayout';

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  }),
};

const KPI = [
  { label: 'WEEK',      value: '3 / 13',   sub: 'Phase 2: Budget',    color: '#f0ffe8' },
  { label: 'REDUCTION', value: '\u2193 18%',     sub: 'vs last month',      color: '#4ade80' },
  { label: 'PEBBLES',   value: '? 45',      sub: 'earned total',       color: '#d4af37' },
  { label: 'STREAK',    value: '2 weeks',   sub: 'under budget',       color: '#4ade80' },
];

const DONUT_DATA = [
  { name: 'Transport', value: 12.4, color: '#4ade80' },
  { name: 'Food',      value: 11.2, color: '#f59e0b' },
  { name: 'Energy',    value: 7.8,  color: '#60a5fa' },
  { name: 'Lifestyle', value: 3.4,  color: '#a78bfa' },
];
const TOTAL_DONUT = DONUT_DATA.reduce((a, b) => a + b.value, 0);

const BAR_DATA = [
  { week: 'Week 1', kg: 42.1 },
  { week: 'Week 2', kg: 39.8 },
  { week: 'Week 3', kg: 34.8 },
];

const ACTIONS = [
  { num: '01', action: 'Switch AC to 26�C',       save: 'Save ~3.2 kg/wk' },
  { num: '02', action: 'Take bus once this week',  save: 'Save ~5.1 kg/wk' },
  { num: '03', action: 'Skip one Swiggy order',   save: 'Save ~1.2 kg/wk' },
];


export default function InsightsPage() {
  const [doneActions, setDoneActions] = useState<number[]>([]);

  const customTooltipStyle = {
    background: '#161616',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    fontFamily: "'Space Mono', monospace",
    fontSize: 12,
    color: '#f0ffe8',
  };

  const handleActionToggle = (i: number) => {
    setDoneActions(prev => {
      const isNowDone = !prev.includes(i);
      const next = isNowDone ? [...prev, i] : prev.filter(x => x !== i);
      if (isNowDone) {
        confetti({
          particleCount: 60,
          spread: 55,
          origin: { y: 0.7 },
          colors: ['#4ade80', '#d4af37', '#f0ffe8'],
        });
      }
      return next;
    });
  };

  return (
    <InnerLayout pageName="Insights">
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ── HEADER ── */}
        <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={0} style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 28, color: '#f0ffe8', margin: 0 }}>
            Insights
          </h1>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: '#a0b0a0', marginTop: 6 }}>
            Your climate story, told through data.
          </p>
        </motion.div>

        {/* ── KPI ROW ── */}
        <motion.div
          variants={fadeIn} initial="hidden" animate="visible" custom={1}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}
          className="kpi-grid"
        >
          {KPI.map((k, i) => (
            <div key={i} style={{
              background: '#0f0f0f',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, padding: '20px 24px',
            }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#506050', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
                {k.label}
              </div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 28, color: k.color, marginBottom: 4 }}>
                {k.value}
              </div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: '#a0b0a0' }}>
                {k.sub}
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── ROW 2: Donut + Bar Chart ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }} className="chart-grid">

          {/* Donut */}
          <motion.div
            variants={fadeIn} initial="hidden" animate="visible" custom={2}
            style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px' }}
          >
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#506050', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>
              Category Breakdown
            </div>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie data={DONUT_DATA} innerRadius={70} outerRadius={95} paddingAngle={3} dataKey="value" stroke="none">
                    {DONUT_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={customTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 140 }}>
                {DONUT_DATA.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: '#f0ffe8', flex: 1 }}>{d.name}</span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#a0b0a0' }}>
                      {d.value.toFixed(1)} · {((d.value / TOTAL_DONUT) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Bar chart */}
          <motion.div
            variants={fadeIn} initial="hidden" animate="visible" custom={3}
            style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px' }}
          >
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#506050', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>
              Weekly History
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={BAR_DATA} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <XAxis dataKey="week" tick={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fill: '#506050' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fill: '#506050' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={customTooltipStyle} />
                <ReferenceLine y={38.46} stroke="rgba(74,222,128,0.4)" strokeDasharray="4 4"
                  label={{ value: 'Budget', position: 'insideTopRight', fontFamily: "'Space Mono',monospace", fontSize: 11, fill: '#4ade80' }} />
                <Bar dataKey="kg" radius={[4, 4, 0, 0]} barSize={32}>
                  {BAR_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.kg > 38.46 ? '#ef4444' : '#4ade80'} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* ── PHASE TRACKER ── */}
        <motion.div
          variants={fadeIn} initial="hidden" animate="visible" custom={4}
          style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '28px 32px', marginBottom: 24 }}
        >
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#506050', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 24 }}>
            Journey Progress
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
            {/* Phase 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 80 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#080808', fontWeight: 700 }}>✓</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Baseline</div>
            </div>
            <div style={{ flex: 1, height: 2, background: '#4ade80', opacity: 0.6 }} />

            {/* Phase 2 current */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 80 }}>
              <div className="pulse-ring" style={{
                width: 16, height: 16, borderRadius: '50%',
                border: '2px solid #f0ffe8', background: 'transparent',
              }} />
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#f0ffe8', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Budget</div>
            </div>
            <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.08)' }} />

            {/* Phase 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 80 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#506050' }} />
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#506050', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Reduce</div>
            </div>
          </div>

          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: '#f0ffe8', marginBottom: 4 }}>
            Next milestone: Stay under budget for 1 more week
          </p>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: '#a0b0a0', margin: 0 }}>
            Unlock: Shola Forest region for Chiku
          </p>
        </motion.div>

        {/* ── ACTION ROWS ── */}
        <motion.div
          variants={fadeIn} initial="hidden" animate="visible" custom={5}
          style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px', marginBottom: 24 }}
        >
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#506050', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>
            Reduce Your Footprint
          </div>
          {ACTIONS.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: i < ACTIONS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#506050', minWidth: 24, flexShrink: 0 }}>{a.num}</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: '#f0ffe8', flex: 1 }}>{a.action}</span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: '#4ade80', marginRight: 12, whiteSpace: 'nowrap' }}>{a.save}</span>
              <button
                onClick={() => handleActionToggle(i)}
                style={{
                  padding: '4px 14px', borderRadius: 9999,
                  border: doneActions.includes(i) ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(74,222,128,0.2)',
                  background: doneActions.includes(i) ? 'rgba(74,222,128,0.15)' : 'transparent',
                  color: '#4ade80',
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 12,
                  cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!doneActions.includes(i)) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(74,222,128,0.08)'; }}
                onMouseLeave={e => { if (!doneActions.includes(i)) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                {doneActions.includes(i) ? '\u2713 Done' : 'Do'}
              </button>
            </div>
          ))}
        </motion.div>

      </div>

      <style>{`
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(240,255,232,0.4); }
          70%  { box-shadow: 0 0 0 6px rgba(240,255,232,0); }
          100% { box-shadow: 0 0 0 0 rgba(240,255,232,0); }
        }
        .pulse-ring {
          animation: pulse-ring 2s ease-out infinite;
        }
        @media (max-width: 767px) {
          .kpi-grid { grid-template-columns: repeat(2,1fr) !important; }
          .chart-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </InnerLayout>
  );
}
