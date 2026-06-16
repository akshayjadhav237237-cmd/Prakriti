'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, Cell as BarCell
} from 'recharts';
import InnerLayout from '@/components/InnerLayout';
import confetti from 'canvas-confetti';

// State interface for state management
export interface CalculatorState {
  step: 1 | 2 | 3 | 4 | 'results';
  transport: {
    commuteMode: string; commuteKm: number; commuteDays: number;
    weekendMode: string; weekendKm: number;
    domesticFlights: number; intlFlights: number;
  };
  food: {
    dietType: string; deliveryOrders: number; wasteLevel: string;
  };
  energy: {
    monthlyBill: number; monthlyKwh: number; provider: string;
    hasAC: boolean; acHours: number; lpgCylinders: number;
  };
  lifestyle: {
    shoppingOrders: number; shoppingCategory: string;
    screenHours: number; devices: string[];
    gymMembership: boolean; hotelStays: number; liveEvents: number;
  };
}

// ── PURE CALCULATION FUNCTIONS (Exported for Vitest tests) ──

export function calcTransport(t: CalculatorState['transport']): number {
  const modeFactors: Record<string, number> = {
    'Petrol Scooter': 0.0334, 'Car': 0.1710, 'Bus': 0.0089,
    'Metro': 0.0041, 'Cycle': 0, 'Walk': 0,
  };
  const commute = (modeFactors[t.commuteMode] || 0) * t.commuteKm * t.commuteDays;
  const weekend = (modeFactors[t.weekendMode] || 0) * t.weekendKm;
  const flights = (t.domesticFlights * 90 + t.intlFlights * 500) / 52;
  return +(commute + weekend + flights).toFixed(2);
}

export function calcFood(f: CalculatorState['food']): number {
  const dietFactors: Record<string, number> = {
    'Vegan': 0.8, 'Vegetarian': 1.2, 'Meat a few days': 1.8,
    'Daily meat': 2.5, 'Heavy meat': 3.5,
  };
  const wasteMultipliers: Record<string, number> = {
    'Never': 1.0, 'Rarely': 1.05, 'Sometimes': 1.15, 'Often': 1.30,
  };
  const diet = (dietFactors[f.dietType] || 1.2) * 7;
  const delivery = f.deliveryOrders * 1.18;
  const waste = wasteMultipliers[f.wasteLevel] || 1.0;
  return +((diet + delivery) * waste).toFixed(2);
}

export function calcEnergy(e: CalculatorState['energy']): number {
  const CEA_FACTOR = 0.71;
  const kwh = e.monthlyKwh || (e.monthlyBill / 6);
  const grid = (kwh / 4.33) * CEA_FACTOR;
  const ac = e.hasAC ? (e.acHours * 1.5 * CEA_FACTOR * 7) : 0;
  const lpg = (e.lpgCylinders * 14.2) / 4.33;
  return +(grid + ac + lpg).toFixed(2);
}

export function calcLifestyle(l: CalculatorState['lifestyle']): number {
  const shopFactors: Record<string, number> = {
    'Clothing': 8, 'Electronics': 30, 'Grocery': 2, 'Mixed': 5,
  };
  const deviceFactor = l.devices.length * 0.036 * l.screenHours * 7;
  const shopping = (l.shoppingOrders * (shopFactors[l.shoppingCategory] || 5)) / 4.33;
  const gym = l.gymMembership ? 0.5 : 0;
  const hotel = (l.hotelStays * 15) / 4.33;
  const events = (l.liveEvents * 2) / 4.33;
  return +(deviceFactor + shopping + gym + hotel + events).toFixed(2);
}

// ── COUNT UP ANIMATION COMPONENT ──
function CountUp({ end, duration = 1.2 }: { end: number; duration?: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      setValue(progress * end);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <>{value.toFixed(1)}</>;
}

export default function CalculatePage() {
  const prefersReduced = useReducedMotion();
  const [userName, setUserName] = useState('Arjun');
  const [userCity, setUserCity] = useState('Mumbai');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('prakriti_username');
      const storedCity = localStorage.getItem('prakriti_city');
      if (storedName) setUserName(storedName);
      if (storedCity) setUserCity(storedCity);
    }
  }, []);

  // Wizard state initial values
  const [state, setState] = useState<CalculatorState>({
    step: 1,
    transport: {
      commuteMode: 'Walk', commuteKm: 0, commuteDays: 5,
      weekendMode: 'Walk', weekendKm: 0,
      domesticFlights: 0, intlFlights: 0,
    },
    food: {
      dietType: 'Vegetarian', deliveryOrders: 0, wasteLevel: 'Never',
    },
    energy: {
      monthlyBill: 0, monthlyKwh: 0, provider: 'Other',
      hasAC: false, acHours: 0, lpgCylinders: 0,
    },
    lifestyle: {
      shoppingOrders: 0, shoppingCategory: 'Mixed',
      screenHours: 0, devices: [],
      gymMembership: false, hotelStays: 0, liveEvents: 0,
    },
  });

  // Local helper UI state for weekend inputs
  const [weekendDistance, setWeekendDistance] = useState(0);
  const [weekendTimes, setWeekendTimes] = useState(0);

  // Synchronize local weekend trip inputs to parent state weekendKm
  useEffect(() => {
    const weeklyKm = (weekendDistance * weekendTimes) / 4.33;
    setState(prev => ({
      ...prev,
      transport: {
        ...prev.transport,
        weekendKm: parseFloat(weeklyKm.toFixed(2)),
      }
    }));
  }, [weekendDistance, weekendTimes]);

  // Insights tips state
  const [tips, setTips] = useState<Array<{ tip: string; saving: string; category: string }>>([]);
  const [loadingTips, setLoadingTips] = useState(false);
  const [tipsError, setTipsError] = useState<string | null>(null);

  // Computations
  const transportVal = calcTransport(state.transport);
  const foodVal = calcFood(state.food);
  const energyVal = calcEnergy(state.energy);
  const lifestyleVal = calcLifestyle(state.lifestyle);
  const totalVal = +(transportVal + foodVal + energyVal + lifestyleVal).toFixed(2);

  // Get live total for bottom display based on current active step
  const getStepLiveTotal = () => {
    switch (state.step) {
      case 1: return `Transport emissions this week: ${transportVal.toFixed(1)} kg CO₂e`;
      case 2: return `Food emissions this week: ${foodVal.toFixed(1)} kg CO₂e`;
      case 3: return `Energy emissions this week: ${energyVal.toFixed(1)} kg CO₂e`;
      case 4: return `Lifestyle emissions this week: ${lifestyleVal.toFixed(1)} kg CO₂e`;
      default: return '';
    }
  };

  // Keyboard shortcut listeners (Enter to proceed, ArrowLeft to go back)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing inside number inputs
      if (document.activeElement?.tagName === 'INPUT') return;

      if (e.key === 'Enter') {
        if (state.step === 4) {
          handleCalculate();
        } else if (state.step !== 'results') {
          handleNext();
        }
      } else if (e.key === 'ArrowLeft' && state.step !== 1 && state.step !== 'results') {
        handleBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.step, state.transport, state.food, state.energy, state.lifestyle]);

  const handleNext = () => {
    if (state.step !== 'results' && state.step < 4) {
      setState(prev => ({ ...prev, step: (prev.step + 1) as any }));
    }
  };

  const handleBack = () => {
    if (state.step !== 'results' && state.step > 1) {
      setState(prev => ({ ...prev, step: (prev.step - 1) as any }));
    }
  };

  const handleCalculate = async () => {
    setState(prev => ({ ...prev, step: 'results' }));
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4ade80', '#d4af37', '#f0ffe8'],
    });

    // Request Gemini AI insight
    setLoadingTips(true);
    setTipsError(null);
    try {
      const promptText = `
You are Prakriti, India's carbon budgeting companion.
User's weekly carbon breakdown:
- Transport: ${transportVal.toFixed(1)} kg CO₂e (${state.transport.commuteMode}, ${state.transport.commuteKm} km/day)
- Food: ${foodVal.toFixed(1)} kg CO₂e (${state.food.dietType}, ${state.food.deliveryOrders} Swiggy orders/week)
- Energy: ${energyVal.toFixed(1)} kg CO₂e (${state.energy.monthlyKwh || Math.round(state.energy.monthlyBill / 6)} kWh/month, ${state.energy.hasAC ? state.energy.acHours : 0}hr AC/day)
- Lifestyle: ${lifestyleVal.toFixed(1)} kg CO₂e
- Total: ${totalVal.toFixed(1)} kg CO₂e/week
- India average: 52.1 kg CO₂e/week
- Paris 1.5°C budget: 38.46 kg CO₂e/week

Give 3 specific, actionable, India-context-aware tips to reduce their footprint.
Be specific to their actual data. Mention real Indian solutions (BEST bus, metro, induction cooking, CEA grid etc).
Keep each tip under 25 words. Format as JSON array: [{"tip": "...", "saving": "~X kg/wk", "category": "transport|food|energy|lifestyle"}]
Respond ONLY with the JSON array, no markdown.
`;

      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });
      const resJson = await res.json();
      if (resJson.success && Array.isArray(resJson.data)) {
        setTips(resJson.data);
      } else {
        throw new Error(resJson.error || 'Failed to fetch suggestions');
      }
    } catch (e: any) {
      console.error(e);
      setTipsError('Failed to fetch AI insights. Showing offline tips.');
      setTips([
        { tip: "Use Mumbai Metro or local trains instead of private cabs to bypass Western Express Highway traffic.", saving: "~5.2 kg/wk", category: "transport" },
        { tip: "Opt for home-cooked meals or order non-vegetarian items less frequently on Swiggy.", saving: "~2.4 kg/wk", category: "food" },
        { tip: "Set your bedroom AC to 26°C with fan assist instead of 22°C to optimize compressor cycles.", saving: "~3.8 kg/wk", category: "energy" }
      ]);
    } finally {
      setLoadingTips(false);
    }
  };

  const handleImport = () => {
    if (typeof window === 'undefined') return;
    const SEED = {
      name: userName,
      city: userCity,
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
      lastInsight: 'AC optimization is recommended.'
    };

    let baseData = SEED;
    try {
      const stored = localStorage.getItem('prakriti_user');
      if (stored) {
        baseData = JSON.parse(stored);
      }
    } catch {
      // Keep SEED
    }

    const updated = {
      ...baseData,
      weeklyBudget: 38.46,
      envelopes: {
        transport: { allocated: parseFloat(transportVal.toFixed(2)), spent: parseFloat(transportVal.toFixed(2)) },
        food: { allocated: parseFloat(foodVal.toFixed(2)), spent: parseFloat(foodVal.toFixed(2)) },
        energy: { allocated: parseFloat(energyVal.toFixed(2)), spent: parseFloat(energyVal.toFixed(2)) },
        lifestyle: { allocated: parseFloat(lifestyleVal.toFixed(2)), spent: parseFloat(lifestyleVal.toFixed(2)) },
      }
    };

    localStorage.setItem('prakriti_user', JSON.stringify(updated));
    window.location.href = '/dashboard';
  };

  const handleRecalculate = () => {
    setState({
      step: 1,
      transport: {
        commuteMode: 'Walk', commuteKm: 0, commuteDays: 5,
        weekendMode: 'Walk', weekendKm: 0,
        domesticFlights: 0, intlFlights: 0,
      },
      food: {
        dietType: 'Vegetarian', deliveryOrders: 0, wasteLevel: 'Never',
      },
      energy: {
        monthlyBill: 0, monthlyKwh: 0, provider: 'Other',
        hasAC: false, acHours: 0, lpgCylinders: 0,
      },
      lifestyle: {
        shoppingOrders: 0, shoppingCategory: 'Mixed',
        screenHours: 0, devices: [],
        gymMembership: false, hotelStays: 0, liveEvents: 0,
      },
    });
    setWeekendDistance(0);
    setWeekendTimes(0);
    setTips([]);
    setTipsError(null);
  };

  // Step Indicators Dot/Line Config
  const steps = [
    { num: 1, label: 'Transport' },
    { num: 2, label: 'Food' },
    { num: 3, label: 'Energy' },
    { num: 4, label: 'Lifestyle' }
  ];

  // Motion variants for Step Transitions
  const stepVariants = {
    enter: { x: prefersReduced ? 0 : 60, opacity: 0 },
    center: { x: 0, opacity: 1, transition: { duration: prefersReduced ? 0 : 0.3, ease: 'easeOut' } },
    exit: { x: prefersReduced ? 0 : -60, opacity: 0, transition: { duration: prefersReduced ? 0 : 0.3, ease: 'easeOut' } }
  };

  // Results colors
  const heroColor = totalVal < 38.46 ? '#4ade80' : totalVal <= 52.1 ? '#f59e0b' : '#ef4444';

  return (
    <InnerLayout pageName="Calculate">
      <div style={{ maxWidth: 780, margin: '0 auto', paddingBottom: 60 }} className="inner-page">
        <a href="#wizard-container" className="skip-link">Skip to calculator form</a>

        {/* ── STEP INDICATOR ── */}
        {state.step !== 'results' && (
          <div style={{ marginBottom: 40, width: '100%' }} aria-label="Calculator Progress">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', padding: '0 20px', marginBottom: 12 }}>
              {/* Progress bar line */}
              <div style={{ position: 'absolute', top: '6px', left: '40px', right: '40px', height: '2px', background: 'rgba(255,255,255,0.06)', zIndex: 1 }} />
              {/* Filled progress bar line */}
              <div
                style={{
                  position: 'absolute',
                  top: '6px',
                  left: '40px',
                  right: '40px',
                  height: '2px',
                  background: '#4ade80',
                  zIndex: 2,
                  width: `${((state.step - 1) / 3) * 100}%`,
                  transition: 'width 0.3s ease-out'
                }}
              />

              {steps.map(s => {
                const isActive = state.step === s.num;
                const isCompleted = state.step > s.num;
                return (
                  <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, position: 'relative' }}>
                    <button
                      onClick={() => setState(prev => ({ ...prev, step: s.num as any }))}
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: isCompleted ? '#22c55e' : isActive ? '#4ade80' : 'rgba(255,255,255,0.1)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        outline: 'none',
                        padding: 0,
                        transition: 'background 0.2s'
                      }}
                      aria-label={`${s.label}: Step ${s.num}`}
                      aria-current={isActive ? 'step' : undefined}
                    >
                      {isCompleted && (
                        <span style={{ fontSize: '7px', fontWeight: 'bold', color: '#080808' }}>✓</span>
                      )}
                    </button>
                    <span style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '11px',
                      color: isActive ? '#4ade80' : isCompleted ? '#22c55e' : '#708070',
                      marginTop: '6px',
                      fontWeight: isActive ? 600 : 400
                    }}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#708070', textAlign: 'center' }}>
              Step {state.step} of 4
            </div>
          </div>
        )}

        {/* ── DIAGNOSTIC FORM WIZARD ── */}
        <div id="wizard-container">
          <AnimatePresence mode="wait">
            {state.step === 1 && (
              <motion.fieldset
                key="step1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 24 }}
              >
                <legend className="sr-only">Step 1: Transport footprint</legend>
                <div>
                  <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 28, color: '#f0ffe8', margin: 0 }}>
                    How do you get around?
                  </h1>
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: '#a0b0a0', marginTop: 6 }}>
                    A typical week in {userCity}.
                  </p>
                </div>

                {/* Card 1: Daily Commute */}
                <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: '#f0ffe8', marginBottom: 16 }}>
                    How do you commute to work / college?
                  </h2>
                  
                  {/* Mode Selector */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }} role="radiogroup" aria-label="Commute vehicle mode">
                    {['🛵 Petrol Scooter', '🚗 Car', '🚌 Bus', '🚇 Metro', '🚲 Cycle', '🚶 Walk'].map(mode => {
                      const modeName = mode.split(' ').slice(1).join(' ');
                      const isSel = state.transport.commuteMode === modeName;
                      return (
                        <button
                          key={mode}
                          type="button"
                          role="radio"
                          aria-checked={isSel}
                          onClick={() => setState(prev => ({
                            ...prev,
                            transport: { ...prev.transport, commuteMode: modeName }
                          }))}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '9999px',
                            fontSize: '13px',
                            fontFamily: "'Space Grotesk', sans-serif",
                            background: isSel ? 'rgba(74,222,128,0.1)' : 'transparent',
                            border: isSel ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(255,255,255,0.08)',
                            color: isSel ? '#4ade80' : '#a0b0a0',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {mode}
                        </button>
                      );
                    })}
                  </div>

                  {/* Distance Slider */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <label htmlFor="commute-km" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', color: '#a0b0a0' }}>
                        Round trip distance (km):
                      </label>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', color: '#4ade80' }}>
                        {state.transport.commuteKm} km
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <input
                        id="commute-km"
                        type="range"
                        min="0"
                        max="80"
                        value={state.transport.commuteKm}
                        onChange={e => setState(prev => ({
                          ...prev,
                          transport: { ...prev.transport, commuteKm: parseInt(e.target.value) || 0 }
                        }))}
                        style={{ flex: 1, accentColor: '#4ade80' }}
                        aria-valuemin={0}
                        aria-valuemax={80}
                        aria-valuenow={state.transport.commuteKm}
                      />
                      <input
                        type="number"
                        min="0"
                        max="80"
                        value={state.transport.commuteKm}
                        onChange={e => setState(prev => ({
                          ...prev,
                          transport: { ...prev.transport, commuteKm: Math.min(80, Math.max(0, parseInt(e.target.value) || 0)) }
                        }))}
                        style={{
                          width: '60px',
                          background: '#161616',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          color: '#f0ffe8',
                          fontSize: '13px',
                          fontFamily: "'Space Mono', monospace",
                          textAlign: 'center'
                        }}
                        aria-label="Commute distance value input"
                      />
                    </div>
                  </div>

                  {/* Stepper Days */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label id="commute-days-label" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', color: '#a0b0a0' }}>
                      Days per week:
                    </label>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                      <button
                        type="button"
                        onClick={() => setState(prev => ({
                          ...prev,
                          transport: { ...prev.transport, commuteDays: Math.max(1, prev.transport.commuteDays - 1) }
                        }))}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: '#161616', border: '1px solid rgba(255,255,255,0.08)', color: '#f0ffe8', cursor: 'pointer' }}
                        aria-label="Decrease commute days per week"
                      >
                        -
                      </button>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', color: '#f0ffe8', minWidth: 16, textAlign: 'center' }} aria-labelledby="commute-days-label">
                        {state.transport.commuteDays}
                      </span>
                      <button
                        type="button"
                        onClick={() => setState(prev => ({
                          ...prev,
                          transport: { ...prev.transport, commuteDays: Math.min(7, prev.transport.commuteDays + 1) }
                        }))}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: '#161616', border: '1px solid rgba(255,255,255,0.08)', color: '#f0ffe8', cursor: 'pointer' }}
                        aria-label="Increase commute days per week"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Factor footnote */}
                  <div style={{ marginTop: 20, fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#708070' }}>
                    Factor: {state.transport.commuteMode === 'Petrol Scooter' ? '0.0334' : state.transport.commuteMode === 'Car' ? '0.1710' : state.transport.commuteMode === 'Bus' ? '0.0089' : state.transport.commuteMode === 'Metro' ? '0.0041' : '0.0000'} kg/km · CEA 2023
                  </div>
                </div>

                {/* Card 2: Weekend Travel */}
                <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: '#f0ffe8', marginBottom: 16 }}>
                    Weekend Travel
                  </h2>

                  {/* Mode Selector */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }} role="radiogroup" aria-label="Weekend travel mode">
                    {['🛵 Petrol Scooter', '🚗 Car', '🚌 Bus', '🚇 Metro', '🚲 Cycle', '🚶 Walk'].map(mode => {
                      const modeName = mode.split(' ').slice(1).join(' ');
                      const isSel = state.transport.weekendMode === modeName;
                      return (
                        <button
                          key={mode + '-weekend'}
                          type="button"
                          role="radio"
                          aria-checked={isSel}
                          onClick={() => setState(prev => ({
                            ...prev,
                            transport: { ...prev.transport, weekendMode: modeName }
                          }))}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '9999px',
                            fontSize: '13px',
                            fontFamily: "'Space Grotesk', sans-serif",
                            background: isSel ? 'rgba(74,222,128,0.1)' : 'transparent',
                            border: isSel ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(255,255,255,0.08)',
                            color: isSel ? '#4ade80' : '#a0b0a0',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {mode}
                        </button>
                      );
                    })}
                  </div>

                  {/* Trip Distance input */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <label htmlFor="weekend-trip-distance" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', color: '#a0b0a0' }}>
                        Typical trip distance (km):
                      </label>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', color: '#4ade80' }}>
                        {weekendDistance} km
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <input
                        id="weekend-trip-distance"
                        type="range"
                        min="0"
                        max="80"
                        value={weekendDistance}
                        onChange={e => setWeekendDistance(parseInt(e.target.value) || 0)}
                        style={{ flex: 1, accentColor: '#4ade80' }}
                        aria-valuemin={0}
                        aria-valuemax={80}
                        aria-valuenow={weekendDistance}
                      />
                      <input
                        type="number"
                        min="0"
                        max="80"
                        value={weekendDistance}
                        onChange={e => setWeekendDistance(Math.min(80, Math.max(0, parseInt(e.target.value) || 0)))}
                        style={{
                          width: '60px',
                          background: '#161616',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          color: '#f0ffe8',
                          fontSize: '13px',
                          fontFamily: "'Space Mono', monospace",
                          textAlign: 'center'
                        }}
                        aria-label="Weekend trip distance input"
                      />
                    </div>
                  </div>

                  {/* Stepper Times Per Month */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label id="weekend-times-label" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', color: '#a0b0a0' }}>
                      Times per month:
                    </label>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                      <button
                        type="button"
                        onClick={() => setWeekendTimes(t => Math.max(0, t - 1))}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: '#161616', border: '1px solid rgba(255,255,255,0.08)', color: '#f0ffe8', cursor: 'pointer' }}
                        aria-label="Decrease weekend times per month"
                      >
                        -
                      </button>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', color: '#f0ffe8', minWidth: 16, textAlign: 'center' }} aria-labelledby="weekend-times-label">
                        {weekendTimes}
                      </span>
                      <button
                        type="button"
                        onClick={() => setWeekendTimes(t => Math.min(20, t + 1))}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: '#161616', border: '1px solid rgba(255,255,255,0.08)', color: '#f0ffe8', cursor: 'pointer' }}
                        aria-label="Increase weekend times per month"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card 3: Air Travel */}
                <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: '#f0ffe8', marginBottom: 20 }}>
                    Air Travel
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Domestic */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div id="domestic-flights-label" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', color: '#f0ffe8' }}>
                          Domestic flights this year:
                        </div>
                        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#708070', marginTop: 2 }}>
                          ~90 kg CO₂e per flight · ICAO
                        </div>
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                        <button
                          type="button"
                          onClick={() => setState(prev => ({
                            ...prev,
                            transport: { ...prev.transport, domesticFlights: Math.max(0, prev.transport.domesticFlights - 1) }
                          }))}
                          style={{ width: 28, height: 28, borderRadius: '50%', background: '#161616', border: '1px solid rgba(255,255,255,0.08)', color: '#f0ffe8', cursor: 'pointer' }}
                          aria-label="Decrease domestic flights count"
                        >
                          -
                        </button>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', color: '#f0ffe8', minWidth: 16, textAlign: 'center' }} aria-labelledby="domestic-flights-label">
                          {state.transport.domesticFlights}
                        </span>
                        <button
                          type="button"
                          onClick={() => setState(prev => ({
                            ...prev,
                            transport: { ...prev.transport, domesticFlights: Math.min(20, prev.transport.domesticFlights + 1) }
                          }))}
                          style={{ width: 28, height: 28, borderRadius: '50%', background: '#161616', border: '1px solid rgba(255,255,255,0.08)', color: '#f0ffe8', cursor: 'pointer' }}
                          aria-label="Increase domestic flights count"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* International */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 16 }}>
                      <div>
                        <div id="intl-flights-label" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', color: '#f0ffe8' }}>
                          International flights:
                        </div>
                        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#708070', marginTop: 2 }}>
                          ~500 kg CO₂e per flight · ICAO
                        </div>
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                        <button
                          type="button"
                          onClick={() => setState(prev => ({
                            ...prev,
                            transport: { ...prev.transport, intlFlights: Math.max(0, prev.transport.intlFlights - 1) }
                          }))}
                          style={{ width: 28, height: 28, borderRadius: '50%', background: '#161616', border: '1px solid rgba(255,255,255,0.08)', color: '#f0ffe8', cursor: 'pointer' }}
                          aria-label="Decrease international flights count"
                        >
                          -
                        </button>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', color: '#f0ffe8', minWidth: 16, textAlign: 'center' }} aria-labelledby="intl-flights-label">
                          {state.transport.intlFlights}
                        </span>
                        <button
                          type="button"
                          onClick={() => setState(prev => ({
                            ...prev,
                            transport: { ...prev.transport, intlFlights: Math.min(10, prev.transport.intlFlights + 1) }
                          }))}
                          style={{ width: 28, height: 28, borderRadius: '50%', background: '#161616', border: '1px solid rgba(255,255,255,0.08)', color: '#f0ffe8', cursor: 'pointer' }}
                          aria-label="Increase international flights count"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.fieldset>
            )}

            {state.step === 2 && (
              <motion.fieldset
                key="step2"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 24 }}
              >
                <legend className="sr-only">Step 2: Food footprint</legend>
                <div>
                  <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 28, color: '#f0ffe8', margin: 0 }}>
                    What do you eat?
                  </h1>
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: '#a0b0a0', marginTop: 6 }}>
                    Food is often the second-largest slice.
                  </p>
                </div>

                {/* Card 1: Diet Type */}
                <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: '#f0ffe8', marginBottom: 16 }}>
                    Which best describes your diet?
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} role="radiogroup" aria-label="Diet preference option">
                    {[
                      { key: 'Vegan', co2: '0.8 kg CO₂e/day', desc: '🥬 Vegan' },
                      { key: 'Vegetarian', co2: '1.2 kg CO₂e/day', desc: '🥛 Vegetarian' },
                      { key: 'Meat a few days', co2: '1.8 kg CO₂e/day', desc: '🐔 Meat a few days' },
                      { key: 'Daily meat', co2: '2.5 kg CO₂e/day', desc: '🥩 Daily meat' },
                      { key: 'Heavy meat', co2: '3.5 kg CO₂e/day', desc: '🐄 Heavy meat' }
                    ].map(d => {
                      const isSel = state.food.dietType === d.key;
                      return (
                        <button
                          key={d.key}
                          type="button"
                          role="radio"
                          aria-checked={isSel}
                          onClick={() => setState(prev => ({
                            ...prev,
                            food: { ...prev.food, dietType: d.key }
                          }))}
                          style={{
                            width: '100%',
                            height: '72px',
                            padding: '0 20px',
                            borderRadius: '10px',
                            background: isSel ? 'rgba(74,222,128,0.05)' : 'transparent',
                            border: isSel ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(255,255,255,0.06)',
                            color: '#f0ffe8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s'
                          }}
                        >
                          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: isSel ? 600 : 400 }}>
                            {d.desc}
                          </span>
                          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', color: isSel ? '#4ade80' : '#708070' }}>
                            {d.co2}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Card 2: Food Delivery */}
                <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <h2 id="delivery-orders-label" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: '#f0ffe8', margin: 0 }}>
                        Swiggy / Zomato orders per week:
                      </h2>
                      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', color: '#a0b0a0', marginTop: 4 }}>
                        This includes packaging and last-mile delivery emissions.
                      </p>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                      <button
                        type="button"
                        onClick={() => setState(prev => ({
                          ...prev,
                          food: { ...prev.food, deliveryOrders: Math.max(0, prev.food.deliveryOrders - 1) }
                        }))}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: '#161616', border: '1px solid rgba(255,255,255,0.08)', color: '#f0ffe8', cursor: 'pointer' }}
                        aria-label="Decrease delivery orders"
                      >
                        -
                      </button>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', color: '#f0ffe8', minWidth: 16, textAlign: 'center' }} aria-labelledby="delivery-orders-label">
                        {state.food.deliveryOrders}
                      </span>
                      <button
                        type="button"
                        onClick={() => setState(prev => ({
                          ...prev,
                          food: { ...prev.food, deliveryOrders: Math.min(21, prev.food.deliveryOrders + 1) }
                        }))}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: '#161616', border: '1px solid rgba(255,255,255,0.08)', color: '#f0ffe8', cursor: 'pointer' }}
                        aria-label="Increase delivery orders"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#708070', marginTop: 16 }}>
                    Factor: 1.18 kg CO₂e per order (packaging + delivery + food)
                  </div>
                </div>

                {/* Card 3: Food Waste */}
                <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: '#f0ffe8', marginBottom: 16 }}>
                    How often do you throw away food?
                  </h2>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="radiogroup" aria-label="Food waste level">
                    {[
                      { level: 'Never', mult: 'x1.00' },
                      { level: 'Rarely', mult: 'x1.05' },
                      { level: 'Sometimes', mult: 'x1.15' },
                      { level: 'Often', mult: 'x1.30' }
                    ].map(w => {
                      const isSel = state.food.wasteLevel === w.level;
                      return (
                        <button
                          key={w.level}
                          type="button"
                          role="radio"
                          aria-checked={isSel}
                          onClick={() => setState(prev => ({
                            ...prev,
                            food: { ...prev.food, wasteLevel: w.level }
                          }))}
                          style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: '13px',
                            background: isSel ? 'rgba(74,222,128,0.1)' : 'transparent',
                            border: isSel ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(255,255,255,0.08)',
                            color: isSel ? '#4ade80' : '#a0b0a0',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            flex: 1,
                            minWidth: '80px',
                            transition: 'all 0.2s'
                          }}
                        >
                          <span>{w.level}</span>
                          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: isSel ? '#4ade80' : '#708070' }}>{w.mult}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.fieldset>
            )}

            {state.step === 3 && (
              <motion.fieldset
                key="step3"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 24 }}
              >
                <legend className="sr-only">Step 3: Energy footprint</legend>
                <div>
                  <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 28, color: '#f0ffe8', margin: 0 }}>
                    Your home energy use.
                  </h1>
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: '#4ade80', marginTop: 6, fontWeight: 500 }}>
                    India's grid factor: 0.71 kg CO₂e per kWh (CEA 2023).
                  </p>
                </div>

                {/* Card 1: Electricity Bill */}
                <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: '#f0ffe8', marginBottom: 16 }}>
                    Electricity Consumption
                  </h2>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label htmlFor="elec-bill" style={{ display: 'block', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', color: '#a0b0a0', marginBottom: 8 }}>
                        Monthly electricity bill (₹):
                      </label>
                      <input
                        id="elec-bill"
                        type="number"
                        min="0"
                        value={state.energy.monthlyBill || ''}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 0;
                          setState(prev => ({
                            ...prev,
                            energy: {
                              ...prev.energy,
                              monthlyBill: val,
                              monthlyKwh: val ? Math.round(val / 6) : prev.energy.monthlyKwh
                            }
                          }));
                        }}
                        placeholder="e.g. ₹1200"
                        style={{
                          width: '100%',
                          background: '#161616',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: '#f0ffe8',
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label htmlFor="elec-kwh" style={{ display: 'block', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', color: '#a0b0a0', marginBottom: 8 }}>
                        Or monthly units (kWh):
                      </label>
                      <input
                        id="elec-kwh"
                        type="number"
                        min="0"
                        value={state.energy.monthlyKwh || ''}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 0;
                          setState(prev => ({
                            ...prev,
                            energy: {
                              ...prev.energy,
                              monthlyKwh: val,
                              monthlyBill: val ? val * 6 : prev.energy.monthlyBill
                            }
                          }));
                        }}
                        placeholder="e.g. 200 units"
                        style={{
                          width: '100%',
                          background: '#161616',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: '#f0ffe8',
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <label htmlFor="provider-select" style={{ display: 'block', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', color: '#a0b0a0', marginBottom: 8 }}>
                      Your electricity provider:
                    </label>
                    <select
                      id="provider-select"
                      value={state.energy.provider}
                      onChange={e => setState(prev => ({
                        ...prev,
                        energy: { ...prev.energy, provider: e.target.value }
                      }))}
                      style={{
                        width: '100%',
                        background: '#161616',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        color: '#f0ffe8',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: '14px'
                      }}
                    >
                      {['MSEB', 'BESCOM', 'Tata Power', 'KSEB', 'CESC', 'Other'].map(prov => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#708070', marginTop: 12 }}>
                    Conversion: ₹ → kWh uses approx ₹6/kWh.
                  </div>
                </div>

                {/* Card 2: Cooling */}
                <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: '#f0ffe8', margin: 0 }}>
                        Do you use AC?
                      </h2>
                      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', color: '#a0b0a0', marginTop: 4 }}>
                        Air conditioners are high carbon loads.
                      </p>
                    </div>
                    {/* Yes / No toggle */}
                    <div style={{ display: 'inline-flex', background: '#161616', padding: '4px', borderRadius: '8px' }}>
                      {[
                        { label: 'No', val: false },
                        { label: 'Yes', val: true }
                      ].map(opt => {
                        const active = state.energy.hasAC === opt.val;
                        return (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => setState(prev => ({
                              ...prev,
                              energy: { ...prev.energy, hasAC: opt.val, acHours: opt.val ? 4 : 0 }
                            }))}
                            style={{
                              padding: '6px 16px',
                              borderRadius: '6px',
                              border: 'none',
                              background: active ? '#4ade80' : 'transparent',
                              color: active ? '#080808' : '#a0b0a0',
                              fontSize: '13px',
                              fontFamily: "'Space Grotesk', sans-serif",
                              fontWeight: active ? 600 : 400,
                              cursor: 'pointer'
                            }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {state.energy.hasAC && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, marginTop: 12 }}>
                        <label htmlFor="ac-hours" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', color: '#a0b0a0' }}>
                          Typical daily hours in summer:
                        </label>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', color: '#4ade80' }}>
                          {state.energy.acHours} hrs/day
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <input
                          id="ac-hours"
                          type="range"
                          min="0"
                          max="18"
                          value={state.energy.acHours}
                          onChange={e => setState(prev => ({
                            ...prev,
                            energy: { ...prev.energy, acHours: parseInt(e.target.value) || 0 }
                          }))}
                          style={{ flex: 1, accentColor: '#4ade80' }}
                          aria-valuemin={0}
                          aria-valuemax={18}
                          aria-valuenow={state.energy.acHours}
                        />
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#708070' }}>
                          1.5 kWh/hr → 1.065 kg CO₂e/hr
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Card 3: LPG Cooking */}
                <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h2 id="lpg-cylinders-label" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: '#f0ffe8', margin: 0 }}>
                        LPG cylinders per month:
                      </h2>
                      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', color: '#a0b0a0', marginTop: 4 }}>
                        Standard 14.2 kg LPG cylinder.
                      </p>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                      <button
                        type="button"
                        onClick={() => setState(prev => ({
                          ...prev,
                          energy: { ...prev.energy, lpgCylinders: Math.max(0, prev.energy.lpgCylinders - 1) }
                        }))}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: '#161616', border: '1px solid rgba(255,255,255,0.08)', color: '#f0ffe8', cursor: 'pointer' }}
                        aria-label="Decrease cylinders quantity"
                      >
                        -
                      </button>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', color: '#f0ffe8', minWidth: 16, textAlign: 'center' }} aria-labelledby="lpg-cylinders-label">
                        {state.energy.lpgCylinders}
                      </span>
                      <button
                        type="button"
                        onClick={() => setState(prev => ({
                          ...prev,
                          energy: { ...prev.energy, lpgCylinders: Math.min(4, prev.energy.lpgCylinders + 1) }
                        }))}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: '#161616', border: '1px solid rgba(255,255,255,0.08)', color: '#f0ffe8', cursor: 'pointer' }}
                        aria-label="Increase cylinders quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#708070', marginTop: 16 }}>
                    Factor: 14.2 kg CO₂e per cylinder · CPCB
                  </div>
                </div>
              </motion.fieldset>
            )}

            {state.step === 4 && (
              <motion.fieldset
                key="step4"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 24 }}
              >
                <legend className="sr-only">Step 4: Lifestyle footprint</legend>
                <div>
                  <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 28, color: '#f0ffe8', margin: 0 }}>
                    Everything else.
                  </h1>
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: '#a0b0a0', marginTop: 6 }}>
                    Shopping, services, and digital life.
                  </p>
                </div>

                {/* Card 1: Shopping */}
                <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: '#f0ffe8', marginBottom: 16 }}>
                    Online Shopping
                  </h2>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <label id="shopping-orders-label" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', color: '#a0b0a0' }}>
                      Online shopping orders per month:
                    </label>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                      <button
                        type="button"
                        onClick={() => setState(prev => ({
                          ...prev,
                          lifestyle: { ...prev.lifestyle, shoppingOrders: Math.max(0, prev.lifestyle.shoppingOrders - 1) }
                        }))}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: '#161616', border: '1px solid rgba(255,255,255,0.08)', color: '#f0ffe8', cursor: 'pointer' }}
                        aria-label="Decrease shopping orders"
                      >
                        -
                      </button>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', color: '#f0ffe8', minWidth: 16, textAlign: 'center' }} aria-labelledby="shopping-orders-label">
                        {state.lifestyle.shoppingOrders}
                      </span>
                      <button
                        type="button"
                        onClick={() => setState(prev => ({
                          ...prev,
                          lifestyle: { ...prev.lifestyle, shoppingOrders: Math.min(30, prev.lifestyle.shoppingOrders + 1) }
                        }))}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: '#161616', border: '1px solid rgba(255,255,255,0.08)', color: '#f0ffe8', cursor: 'pointer' }}
                        aria-label="Increase shopping orders"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="shopping-cat-select" style={{ display: 'block', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', color: '#a0b0a0', marginBottom: 8 }}>
                      Primary shopping category:
                    </label>
                    <select
                      id="shopping-cat-select"
                      value={state.lifestyle.shoppingCategory}
                      onChange={e => setState(prev => ({
                        ...prev,
                        lifestyle: { ...prev.lifestyle, shoppingCategory: e.target.value }
                      }))}
                      style={{
                        width: '100%',
                        background: '#161616',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        color: '#f0ffe8',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: '14px'
                      }}
                    >
                      {['Mixed', 'Clothing', 'Electronics', 'Grocery'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Card 2: Streaming & Devices */}
                <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: '#f0ffe8', marginBottom: 16 }}>
                    Streaming & Digital Life
                  </h2>

                  {/* Screen Time Slider */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <label htmlFor="screen-hours" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', color: '#a0b0a0' }}>
                        Daily screen time (hours):
                      </label>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', color: '#4ade80' }}>
                        {state.lifestyle.screenHours} hrs
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <input
                        id="screen-hours"
                        type="range"
                        min="0"
                        max="16"
                        value={state.lifestyle.screenHours}
                        onChange={e => setState(prev => ({
                          ...prev,
                          lifestyle: { ...prev.lifestyle, screenHours: parseInt(e.target.value) || 0 }
                        }))}
                        style={{ flex: 1, accentColor: '#4ade80' }}
                        aria-valuemin={0}
                        aria-valuemax={16}
                        aria-valuenow={state.lifestyle.screenHours}
                      />
                    </div>
                  </div>

                  {/* Devices Pill select */}
                  <div>
                    <span style={{ display: 'block', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', color: '#a0b0a0', marginBottom: 8 }}>
                      Devices used:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {['Phone', 'Laptop', 'TV', 'Gaming console'].map(dev => {
                        const isSel = state.lifestyle.devices.includes(dev);
                        return (
                          <button
                            key={dev}
                            type="button"
                            onClick={() => {
                              setState(prev => {
                                const exist = prev.lifestyle.devices.includes(dev);
                                const nextDevices = exist
                                  ? prev.lifestyle.devices.filter(x => x !== dev)
                                  : [...prev.lifestyle.devices, dev];
                                return {
                                  ...prev,
                                  lifestyle: { ...prev.lifestyle, devices: nextDevices }
                                };
                              });
                            }}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '9999px',
                              fontSize: '13px',
                              fontFamily: "'Space Grotesk', sans-serif",
                              background: isSel ? 'rgba(74,222,128,0.1)' : 'transparent',
                              border: isSel ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(255,255,255,0.08)',
                              color: isSel ? '#4ade80' : '#a0b0a0',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            {dev}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Card 3: Subscriptions / Services */}
                <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: '#f0ffe8', marginBottom: 16 }}>
                    Services & Travel
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      {
                        key: 'gymMembership',
                        label: 'Active Gym membership',
                        desc: '+0.5 kg/wk'
                      },
                      {
                        key: 'hotelStays',
                        label: 'Hotel stays (2+ per month)',
                        desc: '+15.0 kg/wk equivalent'
                      },
                      {
                        key: 'liveEvents',
                        label: 'Live events (2+ per month)',
                        desc: '+2.0 kg/wk equivalent'
                      }
                    ].map(sub => {
                      const isSel = typeof state.lifestyle[sub.key as keyof CalculatorState['lifestyle']] === 'boolean'
                        ? !!state.lifestyle[sub.key as keyof CalculatorState['lifestyle']]
                        : (state.lifestyle[sub.key as keyof CalculatorState['lifestyle']] as number) > 0;

                      return (
                        <button
                          key={sub.key}
                          type="button"
                          onClick={() => {
                            setState(prev => {
                              const currentVal = prev.lifestyle[sub.key as keyof CalculatorState['lifestyle']];
                              let newVal: any;
                              if (typeof currentVal === 'boolean') {
                                newVal = !currentVal;
                              } else {
                                newVal = currentVal > 0 ? 0 : 2; // Sets it to 2 stays/events to qualify
                              }
                              return {
                                ...prev,
                                lifestyle: { ...prev.lifestyle, [sub.key]: newVal }
                              };
                            });
                          }}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            background: isSel ? 'rgba(74,222,128,0.04)' : 'transparent',
                            border: isSel ? '1px solid rgba(74,222,128,0.25)' : '1px solid rgba(255,255,255,0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            color: '#f0ffe8',
                            textAlign: 'left',
                            transition: 'all 0.2s'
                          }}
                        >
                          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px' }}>
                            {sub.label}
                          </span>
                          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: isSel ? '#4ade80' : '#708070' }}>
                            {sub.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.fieldset>
            )}

            {/* results view */}
            {state.step === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 32 }}
              >
                {/* HERO RESULT CARD */}
                <div
                  style={{
                    background: '#0f0f0f',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 16,
                    padding: '40px 24px',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', color: '#a0b0a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                    Your weekly carbon footprint
                  </div>

                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '56px', fontWeight: 700, color: heroColor, marginBottom: 16 }}>
                    <CountUp end={totalVal} /> kg CO₂e
                  </div>

                  {/* Horizontal bar representation of Paris budget comparison */}
                  <div style={{ maxWidth: '400px', margin: '0 auto 20px auto' }}>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden', marginBottom: 12 }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min((totalVal / 52.1) * 100, 100)}%`,
                          background: heroColor,
                          borderRadius: '9999px',
                          transition: 'width 1.2s ease-out'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', color: '#a0b0a0' }}>
                      <span>You</span>
                      <span>India Avg: 52.1 kg</span>
                    </div>
                  </div>

                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', color: '#f0ffe8', fontWeight: 500 }}>
                    {totalVal < 52.1 ? (
                      <span>You're {Math.round(((52.1 - totalVal) / 52.1) * 100)}% below the Indian average. ✓</span>
                    ) : (
                      <span>You're {Math.round(((totalVal - 52.1) / 52.1) * 100)}% above the Indian average.</span>
                    )}
                  </div>

                  {totalVal <= 38.46 && (
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', color: '#4ade80', marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span>✓ You're within the Paris 1.5°C budget of 38.46 kg/week.</span>
                    </div>
                  )}
                </div>

                {/* BREAKDOWN DONUT + TABLE (side by side) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }} className="chart-grid">
                  <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#708070', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                      Category Breakdown
                    </h3>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                      <ResponsiveContainer width={170} height={170}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Transport', value: transportVal, color: '#4ade80' },
                              { name: 'Food', value: foodVal, color: '#f59e0b' },
                              { name: 'Energy', value: energyVal, color: '#60a5fa' },
                              { name: 'Lifestyle', value: lifestyleVal, color: '#a78bfa' }
                            ]}
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell fill="#4ade80" />
                            <Cell fill="#f59e0b" />
                            <Cell fill="#60a5fa" />
                            <Cell fill="#a78bfa" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: '120px' }}>
                        {[
                          { name: 'Transport', val: transportVal, color: '#4ade80' },
                          { name: 'Food', val: foodVal, color: '#f59e0b' },
                          { name: 'Energy', val: energyVal, color: '#60a5fa' },
                          { name: 'Lifestyle', val: lifestyleVal, color: '#a78bfa' }
                        ].map(c => (
                          <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} />
                            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', color: '#f0ffe8', flex: 1 }}>
                              {c.name}
                            </span>
                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', color: '#a0b0a0' }}>
                              {c.val.toFixed(1)} kg
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <th style={{ paddingBottom: 8, fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', color: '#708070' }}>Category</th>
                          <th style={{ paddingBottom: 8, fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', color: '#708070', textAlign: 'right' }}>kg CO₂e/wk</th>
                          <th style={{ paddingBottom: 8, fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', color: '#708070', textAlign: 'right' }}>%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'Transport', val: transportVal, ind: 12.0 },
                          { name: 'Food', val: foodVal, ind: 8.0 },
                          { name: 'Energy', val: energyVal, ind: 14.0 },
                          { name: 'Lifestyle', val: lifestyleVal, ind: 4.46 }
                        ].map(row => {
                          const pctTotal = totalVal > 0 ? Math.round((row.val / totalVal) * 100) : 0;
                          const diffPct = Math.round(((row.val - row.ind) / row.ind) * 100);
                          return (
                            <tr key={row.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              <td style={{ padding: '10px 0', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', color: '#f0ffe8' }}>
                                {row.name}
                              </td>
                              <td style={{ padding: '10px 0', fontFamily: "'Space Mono', monospace", fontSize: '12px', color: '#f0ffe8', textAlign: 'right' }}>
                                {row.val.toFixed(1)}
                              </td>
                              <td style={{ padding: '10px 0', fontFamily: "'Space Mono', monospace", fontSize: '12px', color: '#a0b0a0', textAlign: 'right' }}>
                                {pctTotal}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* BENCHMARKS BAR */}
                <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px' }}>
                  <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#708070', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 20 }}>
                    Global and National Benchmarks
                  </h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart
                      data={[
                        { name: 'You', kg: totalVal, isUser: true },
                        { name: `${userCity} avg`, kg: 45.2, isUser: false },
                        { name: 'India avg', kg: 52.1, isUser: false },
                        { name: 'Global avg', kg: 65.4, isUser: false },
                        { name: 'Paris Budget', kg: 38.46, isUser: false }
                      ]}
                      layout="vertical"
                      margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fill: '#f0ffe8' }}
                      />
                      <Bar dataKey="kg" radius={[0, 4, 4, 0]} barSize={12}>
                        {[
                          { isUser: true },
                          { isUser: false },
                          { isUser: false },
                          { isUser: false },
                          { isUser: false }
                        ].map((entry, index) => (
                          <BarCell
                            key={`cell-${index}`}
                            fill={index === 0 ? '#4ade80' : '#708070'}
                            opacity={index === 0 ? 1 : 0.5}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* GEMINI AI INSIGHT */}
                <div>
                  <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#708070', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>
                    Gemini AI Diagnostic Action Plan
                  </h3>

                  {loadingTips && (
                    <div style={{ padding: '24px 0', textAlign: 'center', color: '#a0b0a0' }} aria-live="polite">
                      <div className="sr-only">Analyzing diagnostic emissions data...</div>
                      <div style={{ display: 'inline-block', width: 24, height: 24, border: '2px solid rgba(74,222,128,0.2)', borderTopColor: '#4ade80', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, marginTop: 8 }}>Consulting Prakriti Companion...</p>
                    </div>
                  )}

                  {tipsError && (
                    <div role="alert" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '12px 16px', color: '#ff6b6b', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', marginBottom: 16 }}>
                      {tipsError}
                    </div>
                  )}

                  {!loadingTips && tips.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="kpi-grid">
                      {tips.map((item, idx) => {
                        const colors: Record<string, string> = {
                          transport: '#4ade80',
                          food: '#f59e0b',
                          energy: '#60a5fa',
                          lifestyle: '#a78bfa'
                        };
                        const catColor = colors[item.category.toLowerCase()] || '#708070';
                        return (
                          <div
                            key={idx}
                            style={{
                              background: '#0f0f0f',
                              border: '1px solid rgba(255,255,255,0.06)',
                              borderLeft: `4px solid ${catColor}`,
                              borderRadius: 8,
                              padding: 16,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              gap: 12
                            }}
                          >
                            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: '#f0ffe8', lineHeight: 1.4 }}>
                              {item.tip}
                            </span>
                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#4ade80', fontWeight: 600 }}>
                              {item.saving}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* IMPORT TO BUDGET CTA */}
                <div
                  style={{
                    background: 'rgba(74,222,128,0.04)',
                    border: '1px solid rgba(74,222,128,0.15)',
                    borderRadius: 16,
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    alignItems: 'center',
                    textAlign: 'center'
                  }}
                >
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: 600, color: '#4ade80', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    ✓ Import these results into your Prakriti budget
                  </h3>
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', color: '#a0b0a0', margin: 0, maxWidth: '520px', lineHeight: 1.5 }}>
                    We'll pre-fill your weekly envelopes with these values and set your budget at 38.46 kg CO₂e (Paris 1.5°C).
                  </p>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <button
                      onClick={handleImport}
                      style={{
                        padding: '12px 24px',
                        background: 'rgba(74,222,128,0.1)',
                        border: '1px solid rgba(74,222,128,0.3)',
                        borderRadius: '9999px',
                        color: '#4ade80',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600,
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      Import to My Budget →
                    </button>
                    <button
                      onClick={handleRecalculate}
                      style={{
                        padding: '12px 24px',
                        background: 'transparent',
                        border: 'none',
                        color: '#a0b0a0',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Recalculate
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── LIVE TOTAL AT BOTTOM (Wizard only) ── */}
        {state.step !== 'results' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24 }}>
            <button
              type="button"
              onClick={handleBack}
              disabled={state.step === 1}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#a0b0a0',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '14px',
                cursor: state.step === 1 ? 'not-allowed' : 'pointer',
                opacity: state.step === 1 ? 0.4 : 1
              }}
            >
              ← Back
            </button>

            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', color: '#4ade80', fontWeight: 600 }}>
              {getStepLiveTotal()}
            </span>

            {state.step === 4 ? (
              <button
                type="button"
                onClick={handleCalculate}
                style={{
                  padding: '10px 24px',
                  background: '#4ade80',
                  border: 'none',
                  borderRadius: '9999px',
                  color: '#080808',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Calculate my footprint
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                style={{
                  padding: '10px 24px',
                  background: 'rgba(74,222,128,0.1)',
                  border: '1px solid rgba(74,222,128,0.3)',
                  borderRadius: '9999px',
                  color: '#4ade80',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Next: {steps[state.step].label} →
              </button>
            )}
          </div>
        )}

        {/* CSS Spin utility */}
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </InnerLayout>
  );
}
