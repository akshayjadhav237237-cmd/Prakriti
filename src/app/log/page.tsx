'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  dbService, DailyLog, getWeekString, WeeklyBudget
} from '@/core/supabase';
import {
  calculateTransportFootprint, calculateMealFootprint,
  calculateElectricityFootprint, calculateCustomFootprint
} from '@/core/calculators';
import {
  TRANSPORT_EMISSION_FACTORS, TransportMode,
  MEAL_EMISSION_FACTORS, MealType
} from '@/core/constants';
import InnerLayout from '@/components/InnerLayout';

type ActiveTab = 'transport' | 'food' | 'energy' | 'lifestyle';

interface ActivityEntry {
  id: number; name: string; category: string;
  kg: number; time: string; date: string; icon: string;
}

const DEMO_ACTIVITY: ActivityEntry[] = [
  { id: 1, name: 'Scooter to office',       category: 'transport', kg: 2.1, time: '14:32', date: 'today',     icon: '\uD83D\uDE97' },
  { id: 2, name: 'Lunch at dhaba',          category: 'food',      kg: 0.8, time: '13:15', date: 'today',     icon: '\uD83C\uDF7D\uFE0F' },
  { id: 3, name: 'Electricity bill (MSEB)', category: 'energy',    kg: 8.4, time: '09:00', date: 'yesterday', icon: '\u26A1' },
];

const TABS: { key: ActiveTab; label: string }[] = [
  { key: 'transport', label: 'Transport' },
  { key: 'food',      label: 'Food'      },
  { key: 'energy',    label: 'Energy'    },
  { key: 'lifestyle', label: 'Lifestyle' },
];

const TRANSPORT_MODES = ['Scooter', 'Car', 'Bus', 'Metro', 'Bike', 'Walk'];

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  }),
};

export default function LogActivityPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('transport');
  const [showManual, setShowManual] = useState(false);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState<null | { items: { name: string; kg: number }[]; total: number }>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [distance, setDistance] = useState(10);
  const [transportMode, setTransportMode] = useState('Scooter');
  const [liveKg, setLiveKg] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('prakriti_activity');
      if (!stored) {
        localStorage.setItem('prakriti_activity', JSON.stringify(DEMO_ACTIVITY));
        setActivity(DEMO_ACTIVITY);
      } else {
        setActivity(JSON.parse(stored));
      }
    } catch { setActivity(DEMO_ACTIVITY); }
  }, []);

  useEffect(() => {
    const factor =
      transportMode === 'Scooter' ? 0.0334 :
      transportMode === 'Car'     ? 0.149  :
      transportMode === 'Bus'     ? 0.018  :
      transportMode === 'Metro'   ? 0.011  : 0;
    setLiveKg(factor * distance);
  }, [transportMode, distance]);

  const today     = activity.filter(a => a.date === 'today');
  const yesterday = activity.filter(a => a.date === 'yesterday');

  const catColors: Record<string, string> = {
    transport: '#4ade80', food: '#f59e0b', energy: '#60a5fa', lifestyle: '#a78bfa',
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanLoading(true);
    setScanError(null);
    setScanResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/scan', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Scan failed');
      const data = await res.json();
      setScanResult(data);
    } catch {
      setScanError('Could not read this bill. Try a clearer photo.');
    } finally {
      setScanLoading(false);
    }
  };

  return (
    <InnerLayout pageName="Log Activity">
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* HEADER */}
        <motion.div
          variants={fadeIn} initial="hidden" animate="visible" custom={0}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            marginBottom: 32, flexWrap: 'wrap', gap: 12,
          }}
        >
          <div>
            <h1 style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 28,
              color: '#f0ffe8', margin: 0,
            }}>
              Log Activity
            </h1>
            <p style={{
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 15,
              color: '#a0b0a0', marginTop: 6,
            }}>
              Add emissions to your envelope. Be proactive.
            </p>
          </div>
          <button
            onClick={() => setShowManual(!showManual)}
            style={{
              padding: '8px 18px', borderRadius: 9999,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'transparent', color: '#a0b0a0',
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 14,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(74,222,128,0.3)';
              (e.currentTarget as HTMLButtonElement).style.color = '#4ade80';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)';
              (e.currentTarget as HTMLButtonElement).style.color = '#a0b0a0';
            }}
          >
            + Manual
          </button>
        </motion.div>

        {/* SCAN CARD */}
        <motion.div
          variants={fadeIn} initial="hidden" animate="visible" custom={1}
          style={{
            background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16, padding: 40, marginBottom: 20,
            textAlign: 'center', transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(74,222,128,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
        >
          {!scanLoading && !scanResult && !scanError && (
            <>
              <div style={{ fontSize: 56, marginBottom: 16, lineHeight: 1 }}>\uD83D\uDCF8</div>
              <h2 style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 24,
                color: '#f0ffe8', margin: '0 0 12px',
              }}>
                Scan a receipt
              </h2>
              <p style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: '#a0b0a0',
                lineHeight: 1.6, maxWidth: 480, margin: '0 auto 24px',
              }}>
                Point camera at any Indian bill \u2014 electricity, petrol, Swiggy, Zomato. Gemini reads it instantly.
              </p>
              <label style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 28px', borderRadius: 9999,
                background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
                color: '#4ade80', fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              }}>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                Upload Receipt
              </label>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 12,
                color: '#506050', marginTop: 16,
              }}>
                Tata Power \u00B7 MSEB \u00B7 BESCOM \u00B7 Swiggy \u00B7 Zomato \u00B7 Petrol receipts \u00B7 Grocery
              </div>
            </>
          )}

          {scanLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '20px 0' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                border: '2px solid rgba(74,222,128,0.2)', borderTopColor: '#4ade80',
                animation: 'spin 0.8s linear infinite',
              }} />
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: '#a0b0a0' }}>
                Reading with Gemini...
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {scanError && (
            <div>
              <p style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 14,
                color: '#ef4444', marginBottom: 16,
              }}>
                {scanError}
              </p>
              <label style={{
                display: 'inline-flex', padding: '10px 20px', borderRadius: 9999,
                border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444',
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, cursor: 'pointer',
              }}>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                Try Again
              </label>
            </div>
          )}
        </motion.div>

        {/* SCAN RESULT */}
        {scanResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#161616', border: '1px solid rgba(74,222,128,0.2)',
              borderRadius: 12, padding: 24, marginBottom: 20,
            }}
          >
            <div style={{
              fontFamily: "'Space Mono', monospace", fontSize: 12,
              color: '#4ade80', marginBottom: 12,
            }}>
              \u2713 Scan Complete
            </div>
            {scanResult.items.map((item, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: '#f0ffe8' }}>
                  {item.name}
                </span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: '#a0b0a0' }}>
                  {item.kg.toFixed(2)} kg
                </span>
              </div>
            ))}
            <div style={{
              fontFamily: "'Space Mono', monospace", fontWeight: 700,
              fontSize: 28, color: '#4ade80', marginTop: 16, marginBottom: 16,
            }}>
              TOTAL {scanResult.total.toFixed(2)} kg CO\u2082e
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{
                padding: '10px 20px', borderRadius: 9999,
                background: '#4ade80', color: '#080808',
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 14,
                fontWeight: 600, border: 'none', cursor: 'pointer',
              }}>
                Add to Envelope
              </button>
              <button
                onClick={() => setScanResult(null)}
                style={{
                  padding: '10px 20px', borderRadius: 9999,
                  background: 'transparent', color: '#506050',
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 14,
                  border: 'none', cursor: 'pointer',
                }}
              >
                Discard
              </button>
            </div>
          </motion.div>
        )}

        {/* MANUAL ENTRY */}
        <AnimatePresence>
          {showManual && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginBottom: 20 }}
            >
              <div style={{
                background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16, padding: '24px',
              }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#506050',
                  textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16,
                }}>
                  Manual Entry
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
                  {TABS.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      style={{
                        padding: '6px 14px', borderRadius: 9999,
                        border: activeTab === tab.key
                          ? '1px solid rgba(74,222,128,0.25)'
                          : '1px solid rgba(255,255,255,0.06)',
                        background: activeTab === tab.key ? 'rgba(74,222,128,0.08)' : 'transparent',
                        color: activeTab === tab.key ? '#4ade80' : '#506050',
                        fontFamily: "'Space Grotesk', sans-serif", fontSize: 13,
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === 'transport' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <div style={{
                        fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#506050',
                        marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em',
                      }}>
                        Mode
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {TRANSPORT_MODES.map(m => (
                          <button
                            key={m}
                            onClick={() => setTransportMode(m)}
                            style={{
                              padding: '6px 14px', borderRadius: 9999,
                              border: transportMode === m
                                ? '1px solid rgba(74,222,128,0.25)'
                                : '1px solid rgba(255,255,255,0.06)',
                              background: transportMode === m ? 'rgba(74,222,128,0.08)' : 'transparent',
                              color: transportMode === m ? '#4ade80' : '#a0b0a0',
                              fontFamily: "'Space Grotesk', sans-serif", fontSize: 13,
                              cursor: 'pointer', transition: 'all 0.2s',
                            }}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{
                          fontFamily: "'Space Mono', monospace", fontSize: 11,
                          color: '#506050', textTransform: 'uppercase', letterSpacing: '0.1em',
                        }}>
                          Distance
                        </span>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: '#4ade80' }}>
                          {distance} km
                        </span>
                      </div>
                      <input
                        type="range" min={1} max={100} value={distance}
                        onChange={e => setDistance(+e.target.value)}
                        style={{ width: '100%', accentColor: '#4ade80' }}
                      />
                      <div style={{
                        fontFamily: "'Space Mono', monospace", fontSize: 11,
                        color: '#506050', marginTop: 4,
                      }}>
                        0.0334 kg/km (ARAI)
                      </div>
                    </div>

                    <div style={{
                      fontFamily: "'Space Mono', monospace", fontWeight: 700,
                      fontSize: 28, color: '#4ade80',
                    }}>
                      {liveKg.toFixed(3)} kg CO\u2082e
                    </div>

                    <button style={{
                      padding: '12px', borderRadius: 9999,
                      background: '#4ade80', color: '#080808',
                      fontFamily: "'Space Grotesk', sans-serif", fontSize: 15,
                      fontWeight: 600, border: 'none', cursor: 'pointer',
                    }}>
                      Log {liveKg.toFixed(2)} kg to Transport
                    </button>
                  </div>
                )}

                {activeTab !== 'transport' && (
                  <div style={{
                    fontFamily: "'Space Grotesk', sans-serif", fontSize: 14,
                    color: '#506050', padding: '20px 0',
                  }}>
                    Select a transport mode or use the scan card above to auto-detect from a receipt.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RECENT ACTIVITY */}
        <motion.div
          variants={fadeIn} initial="hidden" animate="visible" custom={2}
          style={{
            background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16, padding: '24px',
          }}
        >
          <div style={{
            fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#506050',
            textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20,
          }}>
            Recent
          </div>

          {today.length > 0 && (
            <>
              <div style={{
                fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#506050',
                textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12,
              }}>
                Today
              </div>
              {today.map(item => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <span style={{
                    width: 32, height: 32, borderRadius: 9999,
                    background: 'rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, flexShrink: 0,
                  }}>
                    {item.icon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: '#f0ffe8' }}>
                      {item.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                      <span style={{
                        fontFamily: "'Space Mono', monospace", fontSize: 10,
                        textTransform: 'uppercase',
                        color: catColors[item.category] || '#506050',
                        background: `${catColors[item.category] || '#506050'}18`,
                        padding: '1px 6px', borderRadius: 4,
                      }}>
                        {item.category}
                      </span>
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: '#506050' }}>
                        {item.time}
                      </span>
                    </div>
                  </div>
                  <span style={{
                    fontFamily: "'Space Mono', monospace", fontSize: 13,
                    color: item.kg > 5 ? '#f59e0b' : '#a0b0a0', flexShrink: 0,
                  }}>
                    {item.kg.toFixed(1)} kg
                  </span>
                </div>
              ))}
            </>
          )}

          {yesterday.length > 0 && (
            <>
              <div style={{
                fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#506050',
                textTransform: 'uppercase', letterSpacing: '0.12em', margin: '16px 0 12px',
              }}>
                Yesterday
              </div>
              {yesterday.map(item => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <span style={{
                    width: 32, height: 32, borderRadius: 9999,
                    background: 'rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, flexShrink: 0,
                  }}>
                    {item.icon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: '#f0ffe8' }}>
                      {item.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                      <span style={{
                        fontFamily: "'Space Mono', monospace", fontSize: 10,
                        textTransform: 'uppercase',
                        color: catColors[item.category] || '#506050',
                        background: `${catColors[item.category] || '#506050'}18`,
                        padding: '1px 6px', borderRadius: 4,
                      }}>
                        {item.category}
                      </span>
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: '#506050' }}>
                        {item.time}
                      </span>
                    </div>
                  </div>
                  <span style={{
                    fontFamily: "'Space Mono', monospace", fontSize: 13,
                    color: item.kg > 5 ? '#f59e0b' : '#a0b0a0', flexShrink: 0,
                  }}>
                    {item.kg.toFixed(1)} kg
                  </span>
                </div>
              ))}
            </>
          )}

          {activity.length === 0 && (
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 14,
              color: '#506050', textAlign: 'center', padding: '24px 0',
            }}>
              No activity yet. Scan a receipt or log manually.
            </div>
          )}
        </motion.div>

      </div>
    </InnerLayout>
  );
}
