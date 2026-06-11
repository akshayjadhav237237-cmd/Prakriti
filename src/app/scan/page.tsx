"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { dbService, DailyLog } from "@/core/supabase";
import confetti from "canvas-confetti";

type ScanState = "idle" | "camera" | "preview" | "loading" | "results" | "success" | "fallback";
type CategoryType = "transport" | "food" | "energy" | "lifestyle";

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
  "Prakriti is reading your receipt...",
  "Scanning line items & amounts...",
  "Applying Indian carbon emission factors...",
  "Mapping footprint to envelope budgets..."
];

// Utility to compress image to a max dimension of 1024px and return a base64 data URL
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
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
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
      }
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.src = url;
  });
};

export default function ScanPage() {
  const router = useRouter();
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [selectedChip, setSelectedChip] = useState<string>("Electricity");
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("energy");
  
  // Camera & File Streams
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading indicator messages
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  // API Results
  const [scanResult, setScanResult] = useState<ScanResultData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>("arjun-mumbai-uuid");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  // Chips mapping to backend category hints
  const chips = [
    { name: "Electricity", category: "energy" as CategoryType, icon: Zap },
    { name: "Petrol / Fuel", category: "transport" as CategoryType, icon: Fuel },
    { name: "Swiggy / Zomato", category: "food" as CategoryType, icon: UtensilsCrossed },
    { name: "Cab / Uber", category: "transport" as CategoryType, icon: Car },
    { name: "Groceries", category: "lifestyle" as CategoryType, icon: ShoppingBag }
  ];

  // Get current user id on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("prakriti_user_id");
      if (stored) {
        setUserId(stored);
      }
    }
  }, []);

  // Cycle loading messages when in loading state
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (scanState === "loading") {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [scanState]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Camera handling
  const startCamera = async () => {
    setPreviewImage(null);
    setScanState("camera");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera capture access denied/failed:", err);
      // Fallback to file picker state
      setScanState("idle");
      alert("Could not access camera. Please upload an image instead.");
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
      const canvas = document.createElement("canvas");
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
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setPreviewImage(dataUrl);
        stopCamera();
        setScanState("preview");
        setStatus(null);
        setError(null);
      }
    }
  };

  // File Upload handling
  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScanState("loading");
      setStatus("Compressing image...");
      try {
        const compressed = await compressImage(file);
        setPreviewImage(compressed);
        setScanState("preview");
        setStatus(null);
        setError(null);
      } catch (err: any) {
        console.error("Compression error:", err);
        setError("Failed to process image: " + (err.message || "Unknown error"));
        setScanState("idle");
      }
    }
  };

  // Drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setScanState("loading");
      setStatus("Compressing image...");
      try {
        const compressed = await compressImage(file);
        setPreviewImage(compressed);
        setScanState("preview");
        setStatus(null);
        setError(null);
      } catch (err: any) {
        console.error("Compression error:", err);
        setError("Failed to process image: " + (err.message || "Unknown error"));
        setScanState("idle");
      }
    }
  };

  // API trigger
  const runScanOCR = async () => {
    if (!previewImage) return;

    setScanState("loading");
    setLoadingMsgIdx(0);
    setError(null);
    setStatus("Analyzing bill using Gemini AI...");

    try {
      let base64string = previewImage;
      let mimeType = "image/jpeg";
      if (previewImage.startsWith("data:")) {
        const match = previewImage.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          base64string = match[2];
        }
      }

      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          imageBase64: base64string,
          mimeType: mimeType
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "Server scan request failed");
      }

      const result = await response.json();
      if (result.success && result.data) {
        // If low confidence (< 0.6) or empty items array, trigger fallback UI state
        if (result.data.confidence < 0.6 || !result.data.items || result.data.items.length === 0) {
          setScanResult(result.data);
          setScanState("fallback");
          setError(null);
          setStatus(null);
        } else {
          setScanResult(result.data);
          setScanState("results");
          setError(null);
          setStatus(null);
        }
      } else {
        throw new Error(result.error || "OCR extraction failed");
      }
    } catch (error: any) {
      console.error("Scan error:", error);
      setError(error?.message || JSON.stringify(error) || "Unknown error");
      // Show the actual error message in the UI temporarily
      setScanResult(null);
      setStatus(`Error: ${error?.message || "Unknown"}`);
      setScanState("idle");
    }
  };

  // Save scan details to database envelopes
  const addLogToEnvelope = async () => {
    if (!scanResult) return;
    setIsSubmitting(true);

    try {
      const co2e = scanResult.co2eKg;
      const category = scanResult.category;
      
      const logObj: Omit<DailyLog, "id" | "created_at"> = {
        user_id: userId,
        date: scanResult.date,
        envelope: category,
        activity: `${scanResult.merchant} (Scanned Bill)`,
        co2_kg: co2e,
        source: "scan"
      };

      // 1. Save log via dbService
      await dbService.addDailyLog(logObj);

      // 2. Sync to local storage weekly budget spent totals (to update dashboard immediately)
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("prakriti_budget");
        if (stored) {
          try {
            const budgetObj = JSON.parse(stored);
            const spentKey = `${category}_spent`;
            if (spentKey in budgetObj) {
              budgetObj[spentKey] = Number((budgetObj[spentKey] + co2e).toFixed(2));
            }
            localStorage.setItem("prakriti_budget", JSON.stringify(budgetObj));
            
            // Sync pebbles
            const currentPebbles = parseInt(localStorage.getItem("prakriti_pebbles") || "150", 10);
            const awardPebbles = 15; // Award 15 pebbles for logging a digital scan
            const newPebbles = currentPebbles + awardPebbles;
            localStorage.setItem("prakriti_pebbles", newPebbles.toString());
            
            // Dispatch state change to sync navbar balance
            window.dispatchEvent(new Event("prakriti_state_changed"));
          } catch (e) {
            console.error("Local budget sync error:", e);
          }
        }
      }

      // Success confetti triggers
      confetti({
        particleCount: 140,
        spread: 70,
        origin: { y: 0.75 },
        colors: ["#10b981", "#34d399", "#fbbf24", "#60a5fa"]
      });

      setScanState("success");
    } catch (e) {
      console.error("Failed to add to database envelope:", e);
      alert("Failed to log activity. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset page
  const resetScanner = () => {
    setScanResult(null);
    setPreviewImage(null);
    stopCamera();
    setScanState("idle");
    setError(null);
    setStatus(null);
  };

  // Category Icon mapper for UI
  const getCategoryIcon = (cat: CategoryType) => {
    switch (cat) {
      case "energy": return Zap;
      case "transport": return Fuel;
      case "food": return UtensilsCrossed;
      default: return ShoppingBag;
    }
  };

  // Chip selection changes category hints
  const selectChip = (chipName: string, category: CategoryType) => {
    setSelectedChip(chipName);
    setSelectedCategory(category);
  };

  return (
    <div className="flex-1 flex flex-col items-center p-4 sm:p-6 bg-gradient-to-b from-background to-surface min-h-[calc(100vh-4rem)]">
      
      {/* Toast Alert / Success overlay */}
      <AnimatePresence>
        {scanState === "success" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4 backdrop-blur-md"
          >
            <div className="w-full max-w-md bg-surface border border-primary/20 rounded-2xl p-8 text-center space-y-6 shadow-2xl relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-emerald-400"></div>
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
                <CheckCircle2 className="w-8 h-8 animate-bounce" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-accent uppercase tracking-widest">Added to Envelope</span>
                <h2 className="text-2xl font-black text-white">{scanResult?.merchant}</h2>
                <p className="text-sm text-text/60">
                  Carbon transaction logged successfully to your <strong className="text-primary capitalize">{scanResult?.category}</strong> envelope.
                </p>
                <div className="flex items-center justify-center space-x-2 py-2">
                  <span className="text-2xl font-black text-warm">+{scanResult?.co2eKg.toFixed(2)} kg CO₂e</span>
                </div>
              </div>

              <div className="bg-background/60 border border-border p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-warm" />
                  <span className="text-xs text-text/70">Prakriti Scan Reward:</span>
                </div>
                <span className="text-xs font-bold text-warm">+15 Pebbles</span>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={resetScanner}
                  className="flex-1 py-3 px-4 rounded-xl bg-surface hover:bg-border border border-border text-sm font-bold text-white transition-all active:scale-95"
                >
                  Scan Another
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-background font-extrabold transition-all active:scale-95 shadow-md shadow-primary/10"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-xl space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              stopCamera();
              router.push("/dashboard");
            }}
            className="p-2.5 rounded-xl bg-surface border border-border text-text/75 hover:text-white hover:border-border/80 transition-all flex items-center space-x-2 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <div className="flex items-center space-x-2 text-primary font-bold text-sm">
            <span className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-xs font-mono">
              OCR Core v1.5
            </span>
          </div>
        </div>

        {/* TITLE */}
        <div className="text-center md:text-left space-y-1">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary via-accent to-emerald-300 bg-clip-text text-transparent tracking-tight flex items-center justify-center md:justify-start space-x-2">
            <ScanLine className="w-6 h-6 text-primary shrink-0 animate-pulse" />
            <span>Gemini Receipt Scanner</span>
          </h1>
          <p className="text-sm text-text/60 max-w-md">
            Snap a photo or drop utility bills, petrol receipts, and food delivery cards to dynamically parse carbon footprint.
          </p>
        </div>

        {/* CHIP SECTION */}
        {scanState !== "loading" && scanState !== "results" && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text/50 uppercase tracking-widest block">
              Select Receipt Type (Category Hint)
            </label>
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => {
                const Icon = chip.icon;
                const isSelected = selectedChip === chip.name;
                return (
                  <button
                    key={chip.name}
                    onClick={() => selectChip(chip.name, chip.category)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                      isSelected
                        ? "bg-primary/10 border-primary text-primary shadow-sm shadow-primary/5"
                        : "bg-surface border-border/80 text-text/60 hover:text-white hover:border-border hover:bg-border/20"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{chip.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Error / Status Alert */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm flex items-center space-x-2 animate-pulse">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
        {status && !error && (
          <div className="p-4 bg-primary/10 border border-primary/20 text-primary rounded-2xl text-sm flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{status}</span>
          </div>
        )}

        {/* MAIN VIEWFINDER CONTAINER */}
        <div className="relative bg-surface/40 border border-border/60 rounded-2xl overflow-hidden shadow-2xl min-h-[340px] flex flex-col items-center justify-center p-4">
          
          {/* Pure CSS corner brackets for Finder framing */}
          {scanState !== "loading" && scanState !== "results" && (
            <>
              <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg pointer-events-none" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg pointer-events-none" />
            </>
          )}

          {/* STATE 1: IDLE / PICKER */}
          {scanState === "idle" && (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="w-full flex flex-col items-center justify-center p-8 space-y-6 text-center border-2 border-dashed border-border/60 rounded-xl hover:border-primary/40 hover:bg-surface/10 transition-all cursor-pointer"
              onClick={triggerFileSelect}
            >
              <div className="w-16 h-16 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary/70">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Drag & drop receipt image here</p>
                <p className="text-xs text-text/40">or click to browse local files (PNG, JPEG, WebP)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* STATE 2: LIVE CAMERA */}
          {scanState === "camera" && (
            <div className="w-full h-full relative flex flex-col items-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-h-[300px] object-cover rounded-xl border border-border/60"
              />
              
              {/* Scanline Animation */}
              <motion.div
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_8px_#4ade80] pointer-events-none"
                animate={{ top: ["5%", "95%", "5%"] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
              />
            </div>
          )}

          {/* STATE 3: IMAGE PREVIEW (Captured or Uploaded) */}
          {scanState === "preview" && previewImage && (
            <div className="w-full h-full relative flex flex-col items-center space-y-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage}
                alt="Receipt Preview"
                className="w-full max-h-[300px] object-contain rounded-xl border border-border"
              />
              
              {/* Scanline Animation */}
              <motion.div
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_8px_#4ade80] pointer-events-none"
                animate={{ top: ["5%", "90%", "5%"] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
              />
            </div>
          )}

          {/* STATE 4: LOADING / OCR PROCESSING */}
          {scanState === "loading" && (
            <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center w-full">
              <div className="relative w-20 h-20">
                <Loader2 className="w-20 h-20 text-primary animate-spin" />
                <ScanLine className="w-8 h-8 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Prakriti is reading...</h3>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingMsgIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-xs text-primary font-mono"
                  >
                    {LOADING_MESSAGES[loadingMsgIdx]}
                  </motion.p>
                </AnimatePresence>
              </div>
              
              {/* Loading progress bar */}
              <div className="h-1.5 w-48 bg-background border border-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  animate={{ width: ["0%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 2.0, ease: "easeInOut" }}
                />
              </div>
            </div>
          )}

          {/* STATE 5: SCAN RESULTS CARD */}
          {scanState === "results" && scanResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-5"
            >
              {/* Prominent Total CO2 Card */}
              <div className="relative p-6 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border border-primary/35 shadow-lg flex flex-col items-center justify-center text-center space-y-2">
                <div className="absolute top-0 right-0 p-3 text-primary/10">
                  <ScanLine className="w-24 h-24 stroke-[1]" />
                </div>
                <span className="text-xs font-extrabold text-primary uppercase tracking-widest">
                  Total Carbon Footprint
                </span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-5xl font-black text-primary font-mono tracking-tight animate-pulse">
                    {scanResult.co2eKg.toFixed(2)}
                  </span>
                  <span className="text-sm font-bold text-text/80">kg CO₂e</span>
                </div>
                <p className="text-xs text-text/50 max-w-xs">
                  This transaction is calculated using the official emission factor guidelines for India.
                </p>
              </div>

              {/* Metadata Card */}
              <div className="p-4 bg-background/80 rounded-xl border border-border/80 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-extrabold text-white">{scanResult.merchant}</h3>
                    <div className="flex items-center space-x-1 text-xs text-text/50 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{scanResult.date}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-mono text-text/40 uppercase tracking-wider">Total Amount</span>
                    <span className="text-sm font-bold text-white flex items-center">
                      <IndianRupee className="w-3.5 h-3.5" />
                      <span>{scanResult.totalAmount.toFixed(2)}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-border/40">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-surface text-primary border border-border">
                      {(() => {
                        const Icon = getCategoryIcon(scanResult.category);
                        return <Icon className="w-4 h-4" />;
                      })()}
                    </div>
                    <span className="text-xs font-semibold text-text/75 uppercase tracking-wide">
                      {scanResult.category} Envelope
                    </span>
                  </div>
                  
                  {/* Confidence rating */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    scanResult.confidence >= 0.85 
                      ? "text-primary border-primary/20 bg-primary/5" 
                      : "text-warm border-warm/20 bg-warm/5"
                  }`}>
                    AI Confidence: {Math.round(scanResult.confidence * 100)}%
                  </span>
                </div>
              </div>

              {/* Items Breakdown Cards */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-text/50 uppercase tracking-widest block px-1">
                  Extracted Items Breakdown
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[240px] overflow-y-auto pr-1">
                  {scanResult.items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-surface/60 border border-border/60 hover:border-primary/40 rounded-xl transition-all flex flex-col justify-between space-y-2 shadow-sm">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-sm text-white truncate" title={item.name}>
                          {item.name}
                        </span>
                        <span className="text-xs font-mono font-bold text-warm bg-warm/10 border border-warm/20 px-2 py-0.5 rounded-full shrink-0">
                          {item.co2eKg.toFixed(2)} kg
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-text/50">
                        <span>Quantity: {item.quantity} {item.unit}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-background/80 rounded border border-border/40">
                          {scanResult.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STATE 6: FALLBACK VIEW (Low Confidence / Empty Items) */}
          {scanState === "fallback" && (
            <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center w-full">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto">
                <AlertTriangle className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-2 max-w-sm mx-auto">
                <h3 className="text-lg font-bold text-white">Couldn't read receipt clearly</h3>
                <p className="text-xs text-text/60">
                  Prakriti couldn't read this bill clearly. Try better lighting or a clearer photo.
                </p>
              </div>
              <div className="flex gap-4 w-full max-w-xs pt-2">
                <button
                  onClick={resetScanner}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-surface hover:bg-border border border-border text-xs font-bold text-white transition-all active:scale-95"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push("/log")}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/95 text-background text-xs font-black transition-all active:scale-95 shadow-md shadow-primary/10"
                >
                  Log Manually
                </button>
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM ACTION BUTTONS */}
        {scanState !== "loading" && scanState !== "fallback" && (
          <div className="flex gap-4">
            
            {/* IDLE state controls */}
            {scanState === "idle" && (
              <>
                <button
                  onClick={startCamera}
                  className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary/95 text-background font-extrabold flex items-center justify-center space-x-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/10"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Camera</span>
                </button>
                <button
                  onClick={triggerFileSelect}
                  className="flex-1 py-3 px-4 rounded-xl bg-surface hover:bg-border border border-border text-sm font-bold text-white transition-all active:scale-[0.98]"
                >
                  Choose Local File
                </button>
              </>
            )}

            {/* CAMERA state controls */}
            {scanState === "camera" && (
              <>
                <button
                  onClick={capturePhoto}
                  className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary/95 text-background font-extrabold flex items-center justify-center space-x-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/10"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Photo</span>
                </button>
                <button
                  onClick={resetScanner}
                  className="py-3 px-4 rounded-xl bg-surface hover:bg-border border border-border text-sm font-bold text-white transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
              </>
            )}

            {/* PREVIEW state controls */}
            {scanState === "preview" && (
              <>
                <button
                  onClick={runScanOCR}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-primary hover:bg-primary/95 text-background font-black flex items-center justify-center space-x-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/10"
                >
                  <ScanLine className="w-4 h-4" />
                  <span>Scan & Analyze Bill</span>
                </button>
                <button
                  onClick={resetScanner}
                  className="py-3 px-4 rounded-xl bg-surface hover:bg-border border border-border text-sm font-bold text-white transition-all active:scale-[0.98]"
                  title="Scan Different Image"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </>
            )}

            {/* RESULTS state controls */}
            {scanState === "results" && (
              <>
                <button
                  onClick={addLogToEnvelope}
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-primary hover:bg-primary/95 text-background font-black flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/10 text-base"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  <span>Add to Envelope</span>
                </button>
                
                <button
                  onClick={resetScanner}
                  disabled={isSubmitting}
                  className="py-3.5 px-4 rounded-xl bg-surface hover:bg-border border border-border text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Discard
                </button>
              </>
            )}

          </div>
        )}

        {/* OCR India Accounting Notes */}
        {scanState === "idle" && (
          <div className="bg-surface/30 border border-border/40 rounded-xl p-4 text-xs text-text/50 space-y-1.5">
            <span className="font-bold text-text/70 flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5 text-warm shrink-0" />
              <span>India-Specific Carbon Accounting Notes</span>
            </span>
            <p>
              Calculations are adjusted for local factors like Indian grid electrical intensity (0.710 kg CO₂e/kWh), packaging & courier delivery transport (0.18 kg CO₂e per order), and local meat/veg diet profiles.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
