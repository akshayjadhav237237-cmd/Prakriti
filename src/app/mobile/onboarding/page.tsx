'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, MapPin, Train, Utensils, User } from 'lucide-react';
import { dbService } from '@/core/supabase';
import { OnboardingInputSchema } from '@/core/schemas';
import { saveUserProfile } from '@/lib/db';

const cities = ["Mumbai", "Pune", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Other"];

const transportOptions = [
  { id: "Petrol Scooter", label: "Petrol Scooter", icon: '🛵', desc: "Standard 2-wheeler commute" },
  { id: "Metro/Train", label: "Metro/Train", icon: '🚇', desc: "High efficiency transit" },
  { id: "Cab", label: "Cab", icon: '🚗', desc: "Single occupant car ride" },
  { id: "Walk/Cycle", label: "Walk/Cycle", icon: '🚲', desc: "Zero carbon transportation" },
  { id: "Bus", label: "Bus", icon: '🚌', desc: "Public bus transit" },
  { id: "Electric Scooter", label: "Electric Scooter", icon: '⚡', desc: "Low carbon 2-wheeler" },
];

const dietOptions = [
  { id: "Non-veg", label: "Non-veg", icon: '🍗', desc: "Regular poultry, fish, or red meat" },
  { id: "Occasional meat", label: "Occasional Meat", icon: '🍳', desc: "Mostly veg, meat a few times a week" },
  { id: "Vegetarian", label: "Vegetarian", icon: '🥦', desc: "No meat, includes dairy products" },
  { id: "Vegan", label: "Vegan", icon: '🌱', desc: "100% plant-based lifestyle" },
];

export default function MobileOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [city, setCity] = useState('');
  const [transport, setTransport] = useState('');
  const [diet, setDiet] = useState('');
  const [userName, setUserName] = useState('');
  
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [wakingUpProgress, setWakingUpProgress] = useState(0);
  const [validationError, setValidationError] = useState('');

  // Loading bar animation for transition
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWakingUp) {
      interval = setInterval(() => {
        setWakingUpProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 40);
    }
    return () => clearInterval(interval);
  }, [isWakingUp]);

  const handleNext = () => {
    setValidationError('');
    if (step === 1) {
      const res = OnboardingInputSchema.shape.city.safeParse(city);
      if (!res.success) {
        setValidationError(res.error.errors[0].message);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const res = OnboardingInputSchema.shape.transport.safeParse(transport);
      if (!res.success) {
        setValidationError(res.error.errors[0].message);
        return;
      }
      setStep(3);
    } else if (step === 3) {
      const res = OnboardingInputSchema.safeParse({ city, transport, diet });
      if (!res.success) {
        setValidationError(res.error.errors[0].message);
        return;
      }
      setStep(4);
    } else {
      const trimmed = userName.trim();
      if (!trimmed) {
        setValidationError("Please enter your name.");
        return;
      }
      handleSubmit(trimmed);
    }
  };

  const handleBack = () => {
    setValidationError('');
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (name: string) => {
    setIsWakingUp(true);
    localStorage.setItem('prakriti_username', name);

    await saveUserProfile({
      city,
      transport,
      diet,
    });

    try {
      const transportModeMap: Record<string, string> = {
        "Petrol Scooter": "petrol_scooter",
        "Electric Scooter": "electric_scooter",
        "Cab": "cab",
        "Metro/Train": "mumbai_local",
        "Walk/Cycle": "walk_cycle",
        "Bus": "cng_auto"
      };
      const mappedTransport = transportModeMap[transport] || "electric_scooter";
      
      const dietMap: Record<string, string> = {
        "Non-veg": "non_vegetarian",
        "Occasional meat": "occasional_meat",
        "Vegetarian": "vegetarian",
        "Vegan": "vegan"
      };
      const mappedDiet = dietMap[diet] || "vegetarian";

      const user = await dbService.createFreshUser(
        name,
        city,
        mappedTransport,
        mappedDiet
      );

      localStorage.setItem("prakriti_user_id", user.id);
      localStorage.setItem("prakriti_city", user.city);
      localStorage.setItem("prakriti_pebbles", user.pebbles_balance.toString());
      
      // Seed dynamically created user envelope to prakriti_user object in localStorage
      const userObj = {
        name,
        city,
        weeklyBudget: 38.46,
        pebbles: 0,
        phase: 2,
        week: 1,
        envelopes: {
          transport: { allocated: 15.0, spent: 0 },
          food: { allocated: 10.0, spent: 0 },
          energy: { allocated: 8.0, spent: 0 },
          lifestyle: { allocated: 5.46, spent: 0 },
        },
        companion: { name: 'Chiku', species: 'Lion-Tailed Macaque', stage: 1, energy: 100 },
        history: [0.0],
        lastInsight: 'Setup completed. Your carbon budgeting journey begins!'
      };
      localStorage.setItem("prakriti_user", JSON.stringify(userObj));

      window.dispatchEvent(new Event("prakriti_state_changed"));
    } catch (err) {
      console.error("Error creating user:", err);
    }

    setTimeout(() => {
      router.push("/mobile/dashboard");
    }, 2500);
  };

  if (isWakingUp) {
    return (
      <div
        style={{
          background: '#080808',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '320px' }}>
          <div
            style={{
              fontSize: '48px',
              animation: 'pulse 1.5s infinite',
              marginBottom: '24px',
            }}
          >
            🌱
          </div>
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '22px',
              fontWeight: 800,
              color: '#f0ffe8',
              margin: '0 0 12px 0',
            }}
          >
            Your Prakriti is waking up...
          </h2>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '14px',
              color: '#a0b0a0',
              margin: '0 0 32px 0',
              lineHeight: 1.5,
            }}
          >
            Setting up your weekly carbon budget envelopes and companions.
          </p>

          <div
            style={{
              width: '100%',
              height: '6px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${wakingUpProgress}%`,
                height: '100%',
                background: '#4ade80',
                transition: 'width 0.2s ease-out',
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#080808',
        color: '#f0ffe8',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 20px',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      {/* TOP BAR */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}
      >
        {step > 1 ? (
          <button
            onClick={handleBack}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#a0b0a0',
              fontSize: '14px',
              fontFamily: "'Space Grotesk', sans-serif",
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ← Back
          </button>
        ) : (
          <div />
        )}
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            color: '#506050',
          }}
        >
          STEP {step} OF 4
        </span>
      </div>

      {/* ERROR MESSAGE */}
      {validationError && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            padding: '12px',
            color: '#ef4444',
            fontSize: '13px',
            marginBottom: '20px',
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {validationError}
        </div>
      )}

      {/* STEP CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            <div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '26px', fontWeight: 800, margin: '0 0 8px 0' }}>
                Where do you live?
              </h1>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', color: '#a0b0a0', margin: 0 }}>
                We customize carbon factor models based on local Indian grids and public transits.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cities.map((c) => {
                const isSelected = city === c;
                return (
                  <button
                    key={c}
                    onClick={() => {
                      setCity(c);
                      setValidationError('');
                    }}
                    style={{
                      height: '52px',
                      borderRadius: '12px',
                      border: isSelected ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.06)',
                      background: isSelected ? 'rgba(74,222,128,0.08)' : '#0f0f0f',
                      color: isSelected ? '#4ade80' : '#f0ffe8',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '15px',
                      fontWeight: 600,
                      textAlign: 'left',
                      padding: '0 18px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <MapPin size={16} />
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            <div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '26px', fontWeight: 800, margin: '0 0 8px 0' }}>
                Primary commute?
              </h1>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', color: '#a0b0a0', margin: 0 }}>
                How do you Commute to work, college, or run daily errands?
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {transportOptions.map((opt) => {
                const isSelected = transport === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setTransport(opt.id);
                      setValidationError('');
                    }}
                    style={{
                      borderRadius: '12px',
                      border: isSelected ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.06)',
                      background: isSelected ? 'rgba(74,222,128,0.08)' : '#0f0f0f',
                      color: isSelected ? '#4ade80' : '#f0ffe8',
                      fontFamily: "'Space Grotesk', sans-serif",
                      textAlign: 'left',
                      padding: '14px 18px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{opt.icon}</span>
                      {opt.label}
                    </div>
                    <span style={{ fontSize: '12px', color: '#a0b0a0' }}>{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            <div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '26px', fontWeight: 800, margin: '0 0 8px 0' }}>
                Your diet profile?
              </h1>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', color: '#a0b0a0', margin: 0 }}>
                Food represents a massive portion of carbon envelope footprint.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {dietOptions.map((opt) => {
                const isSelected = diet === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setDiet(opt.id);
                      setValidationError('');
                    }}
                    style={{
                      borderRadius: '12px',
                      border: isSelected ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.06)',
                      background: isSelected ? 'rgba(74,222,128,0.08)' : '#0f0f0f',
                      color: isSelected ? '#4ade80' : '#f0ffe8',
                      fontFamily: "'Space Grotesk', sans-serif",
                      textAlign: 'left',
                      padding: '14px 18px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{opt.icon}</span>
                      {opt.label}
                    </div>
                    <span style={{ fontSize: '12px', color: '#a0b0a0' }}>{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
            <div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '26px', fontWeight: 800, margin: '0 0 8px 0' }}>
                What is your name?
              </h1>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', color: '#a0b0a0', margin: 0 }}>
                Finally, tell us your first name to personalize your budgeting cards.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value);
                  setValidationError('');
                }}
                style={{
                  height: '52px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: '#141414',
                  color: '#f0ffe8',
                  padding: '0 16px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '16px',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM ACTION BUTTON */}
      <div style={{ marginTop: '24px' }}>
        <button
          onClick={handleNext}
          style={{
            width: '100%',
            height: '52px',
            borderRadius: '12px',
            background: '#f5f0e8',
            color: '#080808',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '16px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {step === 4 ? 'Complete Setup' : 'Continue'} →
        </button>
      </div>
    </div>
  );
}
