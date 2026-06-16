'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dbService, DailyLog, getWeekString } from '@/core/supabase';
import MobileLayout from '@/components/mobile/MobileLayout';

type ActiveTab = 'transport' | 'food' | 'energy' | 'lifestyle';

interface ActivityEntry {
  id: number;
  name: string;
  category: string;
  kg: number;
  time: string;
  date: string;
  icon: string;
}

const TABS: { key: ActiveTab; label: string }[] = [
  { key: 'transport', label: 'Transport' },
  { key: 'food',      label: 'Food'      },
  { key: 'energy',    label: 'Energy'    },
  { key: 'lifestyle', label: 'Lifestyle' },
];

const TRANSPORT_MODES = ['Scooter', 'Car', 'Bus', 'Metro', 'Bike', 'Walk'];

const DEMO_ACTIVITY: ActivityEntry[] = [
  { id: 1, name: 'Scooter to office',       category: 'transport', kg: 2.1, time: '14:32', date: 'today',     icon: '🚗' },
  { id: 2, name: 'Lunch at dhaba',          category: 'food',      kg: 0.8, time: '13:15', date: 'today',     icon: '🍽️' },
  { id: 3, name: 'Electricity bill (MSEB)', category: 'energy',    kg: 8.4, time: '09:00', date: 'yesterday', icon: '⚡' },
];

export default function MobileLogActivity() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('transport');
  const [showManual, setShowManual] = useState(false);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState<null | { merchant: string; category: string; items: { name: string; kg: number }[]; total: number }>(null);
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
    } catch {
      setActivity(DEMO_ACTIVITY);
    }
  }, []);

  useEffect(() => {
    const factor =
      transportMode === 'Scooter' ? 0.0334 :
      transportMode === 'Car'     ? 0.149  :
      transportMode === 'Bus'     ? 0.018  :
      transportMode === 'Metro'   ? 0.011  : 0;
    setLiveKg(factor * distance);
  }, [transportMode, distance]);

  const catColors: Record<string, string> = {
    transport: '#4ade80',
    food: '#f59e0b',
    energy: '#60a5fa',
    lifestyle: '#a78bfa',
  };

  const catIcons: Record<string, string> = {
    transport: '🚗',
    food: '🍽️',
    energy: '⚡',
    lifestyle: '🎯',
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setScanLoading(true);
    setScanError(null);
    setScanResult(null);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type || 'image/jpeg' }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Scan failed');
      }

      const d = json.data;
      setScanResult({
        merchant: d.merchant || '',
        category: d.category || 'lifestyle',
        total: d.co2eKg ?? 0,
        items: (d.items || []).map((item: { name: string; co2eKg: number }) => ({
          name: item.name,
          kg: item.co2eKg ?? 0,
        })),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setScanError(msg || 'Could not read receipt. Try another photo.');
    } finally {
      setScanLoading(false);
    }
  };

  const handleAddScanToEnvelope = async () => {
    if (!scanResult) return;
    try {
      const storedUserId = localStorage.getItem("prakriti_user_id") || "arjun-mumbai-uuid";
      const category = scanResult.category || "lifestyle";
      
      const logObj = {
        user_id: storedUserId,
        date: new Date().toISOString().split("T")[0],
        envelope: category as "transport" | "food" | "energy" | "lifestyle",
        activity: `${scanResult.merchant || "Receipt"} (Scanned Bill)`,
        co2_kg: scanResult.total,
        source: "scan" as const,
      };

      await dbService.addDailyLog(logObj);

      const storedUser = localStorage.getItem("prakriti_user");
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          if (!userObj.envelopes) {
            userObj.envelopes = {
              transport: { allocated: 15.0, spent: 0 },
              food: { allocated: 10.0, spent: 0 },
              energy: { allocated: 8.0, spent: 0 },
              lifestyle: { allocated: 5.46, spent: 0 },
            };
          }
          if (userObj.envelopes[category]) {
            userObj.envelopes[category].spent = Number((userObj.envelopes[category].spent + scanResult.total).toFixed(2));
          }
          localStorage.setItem("prakriti_user", JSON.stringify(userObj));
        } catch (e) {
          console.error("Local user envelope sync error:", e);
        }
      }

      const newEntry: ActivityEntry = {
        id: Date.now(),
        name: `${scanResult.merchant || "Receipt"} (Scanned)`,
        category,
        kg: scanResult.total,
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
        date: "today",
        icon: catIcons[category] || '🎯'
      };

      const updatedActivity = [newEntry, ...activity];
      setActivity(updatedActivity);
      localStorage.setItem("prakriti_activity", JSON.stringify(updatedActivity));

      window.dispatchEvent(new Event("prakriti_state_changed"));
      setScanResult(null);
    } catch (e) {
      console.error(e);
      alert("Failed to save scan result.");
    }
  };

  const handleManualLog = async () => {
    try {
      const storedUserId = localStorage.getItem("prakriti_user_id") || "arjun-mumbai-uuid";
      const activityName = `${transportMode} Commute (${distance} km)`;
      
      const logObj = {
        user_id: storedUserId,
        date: new Date().toISOString().split("T")[0],
        envelope: "transport" as const,
        activity: activityName,
        co2_kg: liveKg,
        source: "manual" as const,
      };

      await dbService.addDailyLog(logObj);

      const storedUser = localStorage.getItem("prakriti_user");
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          if (!userObj.envelopes) {
            userObj.envelopes = {
              transport: { allocated: 15.0, spent: 0 },
              food: { allocated: 10.0, spent: 0 },
              energy: { allocated: 8.0, spent: 0 },
              lifestyle: { allocated: 5.46, spent: 0 },
            };
          }
          if (userObj.envelopes.transport) {
            userObj.envelopes.transport.spent = Number((userObj.envelopes.transport.spent + liveKg).toFixed(2));
          }
          localStorage.setItem("prakriti_user", JSON.stringify(userObj));
        } catch (e) {
          console.error("Local user envelope sync error:", e);
        }
      }

      const newEntry: ActivityEntry = {
        id: Date.now(),
        name: activityName,
        category: "transport",
        kg: liveKg,
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
        date: "today",
        icon: "🚗"
      };

      const updatedActivity = [newEntry, ...activity];
      setActivity(updatedActivity);
      localStorage.setItem("prakriti_activity", JSON.stringify(updatedActivity));

      window.dispatchEvent(new Event("prakriti_state_changed"));
      setShowManual(false);
    } catch (e) {
      console.error(e);
      alert("Failed to save log.");
    }
  };

  const today = activity.filter(a => a.date === 'today');
  const yesterday = activity.filter(a => a.date === 'yesterday');

  return (
    <MobileLayout>
      <main style={{ padding: '20px 16px', boxSizing: 'border-box', width: '100%' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '24px', color: '#f0ffe8', margin: 0 }}>
              Log Activity
            </h1>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', color: '#a0b0a0', marginTop: '4px', margin: 0 }}>
              Add emissions to your budgets.
            </p>
          </div>
          <button
            onClick={() => setShowManual(!showManual)}
            style={{
              height: '36px',
              padding: '0 14px',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'transparent',
              color: '#a0b0a0',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {showManual ? 'Cancel' : '+ Manual'}
          </button>
        </div>

        {/* SCAN CARD */}
        {!showManual && (
          <div
            style={{
              background: '#0f0f0f',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              marginBottom: '20px',
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📷</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700, margin: '0 0 6px 0' }}>
              Scan a receipt
            </h2>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', color: '#a0b0a0', lineHeight: 1.4, margin: '0 0 16px 0' }}>
              Upload Swiggy, Zomato, electricity, or fuel receipts to auto-compute footprint.
            </p>
            
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '44px',
                padding: '0 24px',
                borderRadius: '999px',
                background: 'rgba(74,222,128,0.1)',
                border: '1px solid rgba(74,222,128,0.3)',
                color: '#4ade80',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
              Upload Receipt
            </label>
          </div>
        )}

        {/* SCANNING LOADING */}
        {scanLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px 0', background: '#0f0f0f', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '20px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid rgba(74,222,128,0.2)', borderTopColor: '#4ade80', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: '13px', color: '#a0b0a0', fontFamily: "'Space Grotesk', sans-serif" }}>Reading with Gemini...</span>
          </div>
        )}

        {/* SCAN ERROR */}
        {scanError && (
          <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', marginBottom: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#ef4444', margin: '0 0 12px 0' }}>{scanError}</p>
            <label style={{ display: 'inline-flex', height: '36px', padding: '0 16px', borderRadius: '999px', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', fontSize: '13px', alignItems: 'center', cursor: 'pointer' }}>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
              Try Again
            </label>
          </div>
        )}

        {/* SCAN RESULTS DISPLAY */}
        {scanResult && (
          <div style={{ background: '#161616', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', color: '#4ade80', fontFamily: "'Space Mono', monospace", marginBottom: '8px' }}>✓ Scan Complete</div>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>{scanResult.merchant}</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {scanResult.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '6px' }}>
                  <span style={{ color: '#f0ffe8' }}>{item.name}</span>
                  <span style={{ color: '#a0b0a0', fontFamily: "'Space Mono', monospace" }}>{item.kg.toFixed(1)} kg</span>
                </div>
              ))}
            </div>
            
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#4ade80', fontFamily: "'Space Mono', monospace", marginBottom: '16px' }}>
              TOTAL: {scanResult.total.toFixed(1)} kg CO2e
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleAddScanToEnvelope} style={{ flex: 1, height: '44px', borderRadius: '999px', background: '#4ade80', color: '#080808', border: 'none', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Add to Envelope
              </button>
              <button onClick={() => setScanResult(null)} style={{ height: '44px', padding: '0 16px', borderRadius: '999px', background: 'transparent', color: '#708070', border: 'none', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', cursor: 'pointer' }}>
                Discard
              </button>
            </div>
          </div>
        )}

        {/* MANUAL ENTRY MODAL/PANEL */}
        {showManual && (
          <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', color: '#708070', textTransform: 'uppercase', marginBottom: '16px' }}>
              Manual Log (Transport Only)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Transport mode selector */}
              <div>
                <span style={{ display: 'block', fontSize: '11px', color: '#708070', textTransform: 'uppercase', marginBottom: '8px', fontFamily: "'Space Mono', monospace" }}>Vehicle Mode</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {TRANSPORT_MODES.map(m => (
                    <button
                      key={m}
                      onClick={() => setTransportMode(m)}
                      style={{
                        height: '36px',
                        padding: '0 12px',
                        borderRadius: '999px',
                        border: transportMode === m ? '1px solid rgba(74,222,128,0.25)' : '1px solid rgba(255,255,255,0.06)',
                        background: transportMode === m ? 'rgba(74,222,128,0.08)' : 'transparent',
                        color: transportMode === m ? '#4ade80' : '#a0b0a0',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Distance slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                  <span style={{ color: '#708070' }}>Distance</span>
                  <span style={{ color: '#4ade80', fontWeight: 600 }}>{distance} km</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={distance}
                  onChange={e => setDistance(+e.target.value)}
                  style={{ width: '100%', accentColor: '#4ade80' }}
                />
              </div>

              {/* CO2 Preview */}
              <div style={{ padding: '12px', background: '#161616', borderRadius: '10px' }}>
                <span style={{ display: 'block', fontSize: '10px', color: '#708070', textTransform: 'uppercase', fontFamily: "'Space Mono', monospace" }}>ESTIMATED CO2</span>
                <span style={{ fontSize: '24px', fontWeight: 900, color: '#4ade80', fontFamily: "'Space Mono', monospace" }}>
                  {liveKg.toFixed(2)} kg
                </span>
              </div>

              <button
                onClick={handleManualLog}
                style={{
                  height: '44px',
                  borderRadius: '999px',
                  background: '#4ade80',
                  color: '#080808',
                  border: 'none',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Log {liveKg.toFixed(1)} kg to Transport
              </button>
            </div>
          </div>
        )}

        {/* LOG HISTORY */}
        <section>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>
            Recent Activities
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {today.length > 0 && (
              <>
                <span style={{ fontSize: '11px', color: '#708070', textTransform: 'uppercase', fontFamily: "'Space Mono', monospace" }}>Today</span>
                {today.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#0f0f0f', padding: '12px', borderRadius: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontSize: '14px', fontWeight: 600 }}>{item.name}</span>
                      <span style={{ fontSize: '11px', color: catColors[item.category] }}>{item.category}</span>
                    </div>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', fontWeight: 700 }}>
                      {item.kg.toFixed(1)} kg
                    </span>
                  </div>
                ))}
              </>
            )}

            {yesterday.length > 0 && (
              <>
                <span style={{ fontSize: '11px', color: '#708070', textTransform: 'uppercase', fontFamily: "'Space Mono', monospace", marginTop: '8px' }}>Yesterday</span>
                {yesterday.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#0f0f0f', padding: '12px', borderRadius: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontSize: '14px', fontWeight: 600 }}>{item.name}</span>
                      <span style={{ fontSize: '11px', color: catColors[item.category] }}>{item.category}</span>
                    </div>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', fontWeight: 700 }}>
                      {item.kg.toFixed(1)} kg
                    </span>
                  </div>
                ))}
              </>
            )}

            {activity.length === 0 && (
              <p style={{ textAlign: 'center', fontSize: '13px', color: '#708070', padding: '24px 0' }}>
                No recent activity logged.
              </p>
            )}
          </div>
        </section>

      </main>
      
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </MobileLayout>
  );
}
