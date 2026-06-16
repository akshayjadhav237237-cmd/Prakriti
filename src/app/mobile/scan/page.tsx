'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanLine,
  ArrowLeft,
  Camera,
  UploadCloud,
  Zap,
  Fuel,
  UtensilsCrossed,
  Car,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Calendar,
  IndianRupee,
  Plus,
  RefreshCw,
  Coins
} from 'lucide-react';
import { dbService, DailyLog } from '@/core/supabase';
import confetti from 'canvas-confetti';
import MobileLayout from '@/components/mobile/MobileLayout';

type ScanState = 'idle' | 'camera' | 'preview' | 'loading' | 'results' | 'success' | 'fallback';
type CategoryType = 'transport' | 'food' | 'energy' | 'lifestyle';

interface ExtractedItem {
  name: string;
  quantity: number;
  unit: string;
  co2eKg: number;
}

interface ScanResultData {
  merchant: string;
  date: string;
  category: CategoryType;
  totalAmount: number;
  co2eKg: number;
  items: ExtractedItem[];
  confidence: number;
}

const LOADING_MESSAGES = [
  'Reading your receipt...',
  'Parsing items & amounts...',
  'Applying emission factors...',
  'Updating envelope budgets...'
];

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1024;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) {
          h = (h * MAX) / w;
          w = MAX;
        } else {
          w = (w * MAX) / h;
          h = MAX;
        }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
      }
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = url;
  });
};

export default function MobileScanPage() {
  const router = useRouter();
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [selectedChip, setSelectedChip] = useState<string>('Electricity');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('energy');
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [scanResult, setScanResult] = useState<ScanResultData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>('arjun-mumbai-uuid');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const chips = [
    { name: 'Electricity', category: 'energy' as CategoryType, icon: Zap },
    { name: 'Petrol / Fuel', category: 'transport' as CategoryType, icon: Fuel },
    { name: 'Swiggy / Zomato', category: 'food' as CategoryType, icon: UtensilsCrossed },
    { name: 'Cab / Uber', category: 'transport' as CategoryType, icon: Car },
    { name: 'Groceries', category: 'lifestyle' as CategoryType, icon: ShoppingBag }
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('prakriti_user_id');
      if (stored) {
        setUserId(stored);
      }
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (scanState === 'loading') {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [scanState]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setPreviewImage(null);
    setScanState('camera');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera capture access denied/failed:', err);
      setScanState('idle');
      alert('Could not access camera. Please upload an image instead.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      const MAX = 1024;
      let w = video.videoWidth;
      let h = video.videoHeight;
      if (w > MAX || h > MAX) {
        if (w > h) {
          h = (h * MAX) / w;
          w = MAX;
        } else {
          w = (w * MAX) / h;
          h = MAX;
        }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPreviewImage(dataUrl);
        stopCamera();
        setScanState('preview');
        setStatus(null);
        setError(null);
      }
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScanState('loading');
      setStatus('Compressing image...');
      try {
        const compressed = await compressImage(file);
        setPreviewImage(compressed);
        setScanState('preview');
        setStatus(null);
        setError(null);
      } catch (err: any) {
        console.error('Compression error:', err);
        setError('Failed to process image: ' + (err.message || 'Unknown error'));
        setScanState('idle');
      }
    }
  };

  const runScanOCR = async () => {
    if (!previewImage) return;

    setScanState('loading');
    setLoadingMsgIdx(0);
    setError(null);
    setStatus('Analyzing bill using Gemini AI...');

    try {
      let base64string = previewImage;
      let mimeType = 'image/jpeg';
      if (previewImage.startsWith('data:')) {
        const match = previewImage.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          base64string = match[2];
        }
      }

      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageBase64: base64string,
          mimeType: mimeType
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Server scan request failed');
      }

      const result = await response.json();
      if (result.success && result.data) {
        if (result.data.confidence < 0.6 || !result.data.items || result.data.items.length === 0) {
          setScanResult(result.data);
          setScanState('fallback');
          setError(null);
          setStatus(null);
        } else {
          setScanResult(result.data);
          setScanState('results');
          setError(null);
          setStatus(null);
        }
      } else {
        throw new Error(result.error || 'OCR extraction failed');
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      setError(error?.message || JSON.stringify(error) || 'Unknown error');
      setScanResult(null);
      setStatus(`Error: ${error?.message || 'Unknown'}`);
      setScanState('idle');
    }
  };

  const addLogToEnvelope = async () => {
    if (!scanResult) return;
    setIsSubmitting(true);

    try {
      const co2e = scanResult.co2eKg;
      const category = scanResult.category;
      
      const logObj: Omit<DailyLog, 'id' | 'created_at'> = {
        user_id: userId,
        date: scanResult.date,
        envelope: category,
        activity: `${scanResult.merchant} (Scanned Bill)`,
        co2_kg: co2e,
        source: 'scan'
      };

      await dbService.addDailyLog(logObj);

      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('prakriti_budget');
        if (stored) {
          try {
            const budgetObj = JSON.parse(stored);
            const spentKey = `${category}_spent`;
            if (spentKey in budgetObj) {
              budgetObj[spentKey] = Number((budgetObj[spentKey] + co2e).toFixed(2));
            }
            localStorage.setItem('prakriti_budget', JSON.stringify(budgetObj));
            
            // Also update prakriti_user envelopes spent
            const storedUser = localStorage.getItem('prakriti_user');
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
                  userObj.envelopes[category].spent = Number((userObj.envelopes[category].spent + co2e).toFixed(2));
                }
                localStorage.setItem('prakriti_user', JSON.stringify(userObj));
              } catch (err) {
                console.error('Local user envelope sync error in mobile/scan/page.tsx:', err);
              }
            }

            // Sync activities to prakriti_activity localStorage
            const storedActivity = localStorage.getItem('prakriti_activity');
            const newAct = {
              id: Date.now(),
              name: `${scanResult.merchant} (Scanned)`,
              category: category,
              kg: co2e,
              time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
              date: 'today',
              icon: category === 'energy' ? '⚡' : category === 'transport' ? '🚗' : category === 'food' ? '🍽️' : '🎯'
            };
            if (storedActivity) {
              try {
                const actArr = JSON.parse(storedActivity);
                actArr.unshift(newAct);
                localStorage.setItem('prakriti_activity', JSON.stringify(actArr));
              } catch (e) {
                localStorage.setItem('prakriti_activity', JSON.stringify([newAct]));
              }
            } else {
              localStorage.setItem('prakriti_activity', JSON.stringify([newAct]));
            }

            const currentPebbles = parseInt(localStorage.getItem('prakriti_pebbles') || '150', 10);
            const awardPebbles = 15; 
            const newPebbles = currentPebbles + awardPebbles;
            localStorage.setItem('prakriti_pebbles', newPebbles.toString());
            
            window.dispatchEvent(new Event('prakriti_state_changed'));
          } catch (e) {
            console.error('Local budget sync error:', e);
          }
        }
      }

      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#34d399', '#fbbf24', '#60a5fa']
      });

      setScanState('success');
    } catch (e) {
      console.error('Failed to add to database envelope:', e);
      alert('Failed to log activity. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setPreviewImage(null);
    stopCamera();
    setScanState('idle');
    setError(null);
    setStatus(null);
  };

  const getCategoryIcon = (cat: CategoryType) => {
    switch (cat) {
      case 'energy': return Zap;
      case 'transport': return Fuel;
      case 'food': return UtensilsCrossed;
      default: return ShoppingBag;
    }
  };

  const selectChip = (chipName: string, category: CategoryType) => {
    setSelectedChip(chipName);
    setSelectedCategory(category);
  };

  return (
    <MobileLayout>
      <div style={{ padding: '20px 16px', boxSizing: 'border-box', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* SUCCESS TRANSITION SCREEN */}
        <AnimatePresence>
          {scanState === 'success' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999,
                background: 'rgba(8, 8, 8, 0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                backdropFilter: 'blur(8px)'
              }}
            >
              <div style={{
                width: '100%',
                maxWidth: '340px',
                background: '#0f0f0f',
                border: '1px solid rgba(74, 222, 128, 0.2)',
                borderRadius: '24px',
                padding: '24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(74, 222, 128, 0.1)',
                  border: '1px solid rgba(74, 222, 128, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4ade80',
                  margin: '0 auto'
                }}>
                  <CheckCircle2 size={28} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#f59e0b', uppercase: 'true', tracking: '0.1em', letterSpacing: '0.1em' }}>
                    ADDED TO ENVELOPE
                  </span>
                  <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#white', margin: 0 }}>
                    {scanResult?.merchant}
                  </h2>
                  <p style={{ fontSize: '12px', color: '#a0b0a0', margin: 0, lineHeight: 1.4 }}>
                    Logged to <strong style={{ color: '#4ade80', textTransform: 'capitalize' }}>{scanResult?.category}</strong> envelope.
                  </p>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#f59e0b', marginTop: '8px' }}>
                    +{scanResult?.co2eKg.toFixed(2)} kg CO₂e
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  padding: '12px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Coins size={14} style={{ color: '#f59e0b' }} />
                    <span style={{ fontSize: '11px', color: '#a0b0a0' }}>Scan Reward:</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#f59e0b' }}>+15 Pebbles</span>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button
                    onClick={resetScanner}
                    style={{
                      flex: 1,
                      height: '44px',
                      borderRadius: '12px',
                      background: '#161616',
                      border: '1px solid rgba(255,255,255,0.06)',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#white',
                      cursor: 'pointer'
                    }}
                  >
                    Scan Again
                  </button>
                  <button
                    onClick={() => router.push('/mobile/dashboard')}
                    style={{
                      flex: 1,
                      height: '44px',
                      borderRadius: '12px',
                      background: '#4ade80',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#080808',
                      cursor: 'pointer'
                    }}
                  >
                    Dashboard
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOP BAR / NAVIGATION */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => {
              stopCamera();
              router.push('/mobile/dashboard');
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '12px',
              background: '#0f0f0f',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              color: '#a0b0a0',
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              minHeight: '36px'
            }}
          >
            <ArrowLeft size={14} />
            <span>Dashboard</span>
          </button>
          <span style={{ padding: '4px 10px', borderRadius: '99px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', fontSize: '10px', fontFamily: 'monospace', color: '#4ade80' }}>
            OCR Core v1.5
          </span>
        </div>

        {/* HEADER */}
        <div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: '20px',
            color: '#f0ffe8',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ScanLine size={20} style={{ color: '#4ade80', animation: 'pulse 2s infinite' }} />
            <span>Receipt Scanner</span>
          </h1>
          <p style={{ fontSize: '12px', color: '#a0b0a0', margin: '4px 0 0 0', lineHeight: 1.4 }}>
            Snap or upload electricity bills, petrol pump receipts, or food delivery summaries to parse carbon data.
          </p>
        </div>

        {/* CHIP SELECTOR */}
        {scanState !== 'loading' && scanState !== 'results' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#708070', uppercase: 'true', tracking: '0.1em', letterSpacing: '0.1em' }}>
              SELECT RECEIPT TYPE
            </span>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }} className="horizontal-scroll">
              {chips.map((chip) => {
                const Icon = chip.icon;
                const isSelected = selectedChip === chip.name;
                return (
                  <button
                    key={chip.name}
                    onClick={() => selectChip(chip.name, chip.category)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.04)',
                      background: isSelected ? 'rgba(74,222,128,0.1)' : '#161616',
                      color: isSelected ? '#4ade80' : '#a0b0a0',
                      fontSize: '11px',
                      fontWeight: 'semibold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      minHeight: '36px'
                    }}
                  >
                    <Icon size={12} />
                    <span>{chip.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <div style={{ padding: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#ff6b6b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}
        {status && !error && (
          <div style={{ padding: '12px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '12px', color: '#4ade80', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Loader2 size={14} className="animate-spin" />
            <span>{status}</span>
          </div>
        )}

        {/* VIEWFINDER CONTAINER */}
        <div style={{
          position: 'relative',
          background: '#0f0f0f',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '20px',
          minHeight: '260px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          {scanState !== 'loading' && scanState !== 'results' && (
            <>
              <div style={{ position: 'absolute', top: '12px', left: '12px', width: '20px', height: '20px', borderTop: '3px solid #4ade80', borderLeft: '3px solid #4ade80', borderRadius: '4px 0 0 0', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '12px', right: '12px', width: '20px', height: '20px', borderTop: '3px solid #4ade80', borderRight: '3px solid #4ade80', borderRadius: '0 4px 0 0', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '20px', height: '20px', borderBottom: '3px solid #4ade80', borderLeft: '3px solid #4ade80', borderRadius: '0 0 0 4px', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '20px', height: '20px', borderBottom: '3px solid #4ade80', borderRight: '3px solid #4ade80', borderRadius: '0 0 4px 0', pointerEvents: 'none' }} />
            </>
          )}

          {/* STATE 1: IDLE */}
          {scanState === 'idle' && (
            <div
              style={{ border: '1px dashed rgba(74,222,128,0.4)', borderRadius: '16px', width: '100%', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', boxSizing: 'border-box', textAlign: 'center', cursor: 'pointer' }}
              onClick={triggerFileSelect}
            >
              <UploadCloud size={32} style={{ color: '#4ade80', marginBottom: '10px' }} />
              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#white', margin: '0 0 4px 0' }}>Upload receipt image</p>
              <p style={{ fontSize: '10px', color: '#a0b0a0', margin: 0 }}>Tap to browse local files (PNG, JPEG, WebP)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* STATE 2: LIVE CAMERA */}
          {scanState === 'camera' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}
              />
              <motion.div
                style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, transparent, #4ade80, transparent)', pointerEvents: 'none' }}
                animate={{ top: ['5%', '95%', '5%'] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
              />
            </div>
          )}

          {/* STATE 3: IMAGE PREVIEW */}
          {scanState === 'preview' && previewImage && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', gap: '12px' }}>
              <img
                src={previewImage}
                alt="Receipt Preview"
                style={{ width: '100%', maxHeight: '240px', objectFit: 'contain', borderRadius: '12px' }}
              />
              <motion.div
                style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, transparent, #4ade80, transparent)', pointerEvents: 'none' }}
                animate={{ top: ['5%', '90%', '5%'] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
              />
            </div>
          )}

          {/* STATE 4: LOADING / OCR PROCESSING */}
          {scanState === 'loading' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', gap: '16px', textAlign: 'center', width: '100%' }}>
              <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                <Loader2 size={48} style={{ color: '#4ade80' }} className="animate-spin" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#white', margin: 0 }}>Processing bill...</h3>
                <AnimatePresence mode="wait">
                  <motion.p
                     key={loadingMsgIdx}
                     initial={{ opacity: 0, y: 5 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -5 }}
                     transition={{ duration: 0.3 }}
                     style={{ fontSize: '11px', color: '#4ade80', fontFamily: 'monospace', margin: 0 }}
                  >
                    {LOADING_MESSAGES[loadingMsgIdx]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* STATE 5: SCAN RESULTS */}
          {scanState === 'results' && scanResult && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {/* Total CO2 Card */}
              <div style={{
                position: 'relative',
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(74, 222, 128, 0.05)',
                border: '1px solid rgba(74, 222, 128, 0.2)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#4ade80', uppercase: 'true', letterSpacing: '0.1em' }}>
                  CARBON FOOTPRINT
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 900, color: '#4ade80', fontFamily: 'monospace' }}>
                    {scanResult.co2eKg.toFixed(2)}
                  </span>
                  <span style={{ fontSize: '12px', color: '#a0b0a0', fontWeight: 'bold' }}>kg CO₂e</span>
                </div>
              </div>

              {/* Metadata Card */}
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#white', margin: 0 }}>{scanResult.merchant}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#a0b0a0', marginTop: '2px' }}>
                      <Calendar size={12} />
                      <span>{scanResult.date}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '9px', fontFamily: 'monospace', color: '#708070' }}>Amount</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#white', display: 'flex', alignItems: 'center' }}>
                      <IndianRupee size={12} />
                      <span>{scanResult.totalAmount.toFixed(2)}</span>
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#4ade80', textTransform: 'capitalize' }}>
                      {scanResult.category} Envelope
                    </span>
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', color: '#a0b0a0' }}>
                    Match: {Math.round(scanResult.confidence * 100)}%
                  </span>
                </div>
              </div>

              {/* Items Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#708070', letterSpacing: '0.1em' }}>
                  ITEM BREAKDOWN
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                  {scanResult.items.map((item, idx) => (
                    <div key={idx} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#white', fontWeight: 'semibold' }}>{item.name}</span>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#f59e0b', fontWeight: 'bold' }}>{item.co2eKg.toFixed(2)} kg</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STATE 6: FALLBACK */}
          {scanState === 'fallback' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', gap: '16px', textAlign: 'center' }}>
              <AlertTriangle size={32} style={{ color: '#f59e0b' }} />
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#white', margin: 0 }}>Couldn't read clearly</h3>
                <p style={{ fontSize: '11px', color: '#a0b0a0', margin: '4px 0 0 0' }}>Try uploading a clearer, higher-resolution image with better lighting.</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '4px' }}>
                <button
                  onClick={resetScanner}
                  style={{
                    flex: 1,
                    height: '36px',
                    borderRadius: '8px',
                    background: '#161616',
                    border: '1px solid rgba(255,255,255,0.06)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#white',
                    cursor: 'pointer'
                  }}
                >
                  Retry
                </button>
                <button
                  onClick={() => router.push('/mobile/log')}
                  style={{
                    flex: 1,
                    height: '36px',
                    borderRadius: '8px',
                    background: '#4ade80',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#080808',
                    cursor: 'pointer'
                  }}
                >
                  Log Manually
                </button>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        {scanState !== 'loading' && scanState !== 'fallback' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            {scanState === 'idle' && (
              <>
                <button
                  onClick={startCamera}
                  style={{
                    flex: 1,
                    height: '44px',
                    borderRadius: '12px',
                    background: '#4ade80',
                    border: 'none',
                    color: '#080808',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Camera size={16} />
                  <span>Start Camera</span>
                </button>
                <button
                  onClick={triggerFileSelect}
                  style={{
                    flex: 1,
                    height: '44px',
                    borderRadius: '12px',
                    background: '#161616',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#white',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Choose File
                </button>
              </>
            )}

            {scanState === 'camera' && (
              <>
                <button
                  onClick={capturePhoto}
                  style={{
                    flex: 1,
                    height: '44px',
                    borderRadius: '12px',
                    background: '#4ade80',
                    border: 'none',
                    color: '#080808',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Camera size={16} />
                  <span>Capture Photo</span>
                </button>
                <button
                  onClick={resetScanner}
                  style={{
                    height: '44px',
                    padding: '0 16px',
                    borderRadius: '12px',
                    background: '#161616',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#white',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </>
            )}

            {scanState === 'preview' && (
              <>
                <button
                  onClick={runScanOCR}
                  style={{
                    flex: 1,
                    height: '44px',
                    borderRadius: '12px',
                    background: '#4ade80',
                    border: 'none',
                    color: '#080808',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <ScanLine size={16} />
                  <span>Scan & Analyze Bill</span>
                </button>
                <button
                  onClick={resetScanner}
                  style={{
                    height: '44px',
                    padding: '0 16px',
                    borderRadius: '12px',
                    background: '#161616',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={16} />
                </button>
              </>
            )}

            {scanState === 'results' && (
              <>
                <button
                  onClick={addLogToEnvelope}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    height: '48px',
                    borderRadius: '12px',
                    background: '#4ade80',
                    border: 'none',
                    color: '#080808',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    opacity: isSubmitting ? 0.5 : 1
                  }}
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  <span>Add to Envelope</span>
                </button>
                
                <button
                  onClick={resetScanner}
                  disabled={isSubmitting}
                  style={{
                    height: '48px',
                    padding: '0 16px',
                    borderRadius: '12px',
                    background: '#161616',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#white',
                    fontSize: '13px',
                    cursor: 'pointer',
                    opacity: isSubmitting ? 0.5 : 1
                  }}
                >
                  Discard
                </button>
              </>
            )}
          </div>
        )}

        {scanState === 'idle' && (
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px', fontSize: '11px', color: '#708070', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontWeight: 'bold', color: '#a0b0a0', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={12} style={{ color: '#f59e0b' }} />
              <span>India-Specific Carbon Accounting Notes</span>
            </span>
            <p style={{ margin: 0, lineHeight: 1.4 }}>
              Calculations are adjusted for local factors like Indian grid electrical intensity (0.710 kg CO₂e/kWh), packaging & courier delivery transport (0.18 kg CO₂e per order), and local meat/veg diet profiles.
            </p>
          </div>
        )}

      </div>
    </MobileLayout>
  );
}
