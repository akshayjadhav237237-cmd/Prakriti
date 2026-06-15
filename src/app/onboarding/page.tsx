"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { 
  MapPin, 
  ChevronDown, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Zap, 
  Leaf, 
  Car, 
  Train, 
  Bus, 
  Flame,
  Footprints,
  Utensils,
  FlameKindling,
  Apple
} from "lucide-react";
import { saveUserProfile } from "@/lib/db";
import { dbService } from "@/core/supabase";
import { OnboardingInputSchema } from "@/core/schemas";

const cities = ["Mumbai", "Pune", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Other"];

const transportOptions = [
  { id: "Petrol Scooter", label: "Petrol Scooter", icon: Flame, desc: "Standard 2-wheeler commute" },
  { id: "Metro/Train", label: "Metro/Train", icon: Train, desc: "High efficiency transit" },
  { id: "Cab", label: "Cab", icon: Car, desc: "Single occupant car ride" },
  { id: "Walk/Cycle", label: "Walk/Cycle", icon: Footprints, desc: "Zero carbon transportation" },
  { id: "Bus", label: "Bus", icon: Bus, desc: "Public bus transit" },
  { id: "Electric Scooter", label: "Electric Scooter", icon: Zap, desc: "Low carbon 2-wheeler" },
];

const dietOptions = [
  { id: "Non-veg", label: "Non-veg", icon: Utensils, desc: "Regular poultry, fish, or red meat" },
  { id: "Occasional meat", label: "Occasional Meat", icon: FlameKindling, desc: "Mostly veg, meat a few times a week" },
  { id: "Vegetarian", label: "Vegetarian", icon: Apple, desc: "No meat, includes dairy products" },
  { id: "Vegan", label: "Vegan", icon: Leaf, desc: "100% plant-based lifestyle" },
];

export default function Onboarding() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [step, setStep] = useState(1);
  const [city, setCity] = useState("");
  const [transport, setTransport] = useState("");
  const [diet, setDiet] = useState("");
  const [userName, setUserName] = useState("");
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [wakingUpProgress, setWakingUpProgress] = useState(0);
  const [validationError, setValidationError] = useState("");
  const [direction, setDirection] = useState(1);

  // Focus and Hover States
  const [isCityFocused, setIsCityFocused] = useState(false);
  const [hoveredCityIndex, setHoveredCityIndex] = useState<number | null>(null);
  const [focusedTransportId, setFocusedTransportId] = useState<string | null>(null);
  const [focusedDietId, setFocusedDietId] = useState<string | null>(null);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  // Auto-scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

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
          return prev + 1.2;
        });
      }, 30);
    }
    return () => clearInterval(interval);
  }, [isWakingUp]);

  const selectCityVal = (val: string) => {
    setCity(val);
    setValidationError("");
    setIsOpenDropdown(false);
  };

  const selectTransportVal = (val: string) => {
    setTransport(val);
    setValidationError("");
  };

  const selectDietVal = (val: string) => {
    setDiet(val);
    setValidationError("");
  };

  const handleNext = () => {
    setValidationError("");
    if (step === 1) {
      const res = OnboardingInputSchema.shape.city.safeParse(city);
      if (!res.success) {
        setValidationError(res.error.errors[0].message);
        return;
      }
      setDirection(1);
      setStep(2);
    } else if (step === 2) {
      const res = OnboardingInputSchema.shape.transport.safeParse(transport);
      if (!res.success) {
        setValidationError(res.error.errors[0].message);
        return;
      }
      setDirection(1);
      setStep(3);
    } else if (step === 3) {
      const res = OnboardingInputSchema.safeParse({ city, transport, diet });
      if (!res.success) {
        setValidationError(res.error.errors[0].message);
        return;
      }
      setDirection(1);
      setStep(4);
    } else {
      // Step 4: name
      const trimmed = userName.trim();
      if (!trimmed) {
        setValidationError("Please enter your first name.");
        return;
      }
      handleSubmit(trimmed);
    }
  };

  const handleBack = () => {
    setValidationError("");
    if (step > 1) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const handleSubmit = async (name: string) => {
    setIsWakingUp(true);
    // Persist name for dashboard personalisation
    localStorage.setItem('prakriti_username', name);
    
    // Save details to LocalStorage / Supabase
    await saveUserProfile({
      city,
      transport,
      diet,
    });

    try {
      // Map onboarding selections to schema modes
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

      // Keep prakriti_user_id and keys in sync for the navbar/other modules
      localStorage.setItem("prakriti_user_id", user.id);
      localStorage.setItem("prakriti_city", user.city);
      localStorage.setItem("prakriti_pebbles", user.pebbles_balance.toString());
      
      // Dispatch event to sync components
      window.dispatchEvent(new Event("prakriti_state_changed"));
    } catch (err) {
      console.error("Error creating fresh user in dbService:", err);
    }

    // 3-second transition delay
    setTimeout(() => {
      router.push("/dashboard");
    }, 3000);
  };

  const isStepValid = () => {
    if (step === 1) return city !== "";
    if (step === 2) return transport !== "";
    if (step === 3) return diet !== "";
    if (step === 4) return userName.trim() !== "";
    return false;
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: shouldReduceMotion ? 0 : (direction > 0 ? 150 : -150),
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: shouldReduceMotion 
        ? { duration: 0.01 }
        : {
            x: { type: "spring" as const, stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }
    },
    exit: (direction: number) => ({
      x: shouldReduceMotion ? 0 : (direction < 0 ? 150 : -150),
      opacity: 0,
      transition: shouldReduceMotion 
        ? { duration: 0.01 }
        : {
            x: { type: "spring" as const, stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }
    })
  };

  const headingStyle = {
    fontFamily: "'Clash Display', sans-serif",
    fontSize: "32px",
    fontWeight: 700,
    color: "#f5f0e8",
    lineHeight: "1.2",
  };

  const subtextStyle = {
    fontSize: "16px",
    color: "rgba(255,255,255,0.6)",
    lineHeight: "1.6",
  };

  if (isWakingUp) {
    return (
      <div 
        className="w-full min-h-screen flex items-center justify-center p-6"
        style={{ backgroundColor: "#080808" }}
      >
        <div 
          className="w-full flex flex-col items-center text-center space-y-8 px-4"
          style={{ maxWidth: "480px" }}
        >
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              delay: 0.1 
            }}
            className="w-24 h-24 rounded-full flex items-center justify-center text-[#f5f0e8] relative animate-pulse"
            style={{ border: "2px solid rgba(255,255,255,0.2)" }}
          >
            <Leaf className="w-12 h-12 fill-current" />
          </motion.div>

          <div className="space-y-3">
            <motion.h2 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={headingStyle}
            >
              Your Prakriti is waking up...
            </motion.h2>
            <motion.p 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={subtextStyle}
            >
              Aligning your carbon budget envelopes and summoning your Western Ghats companion.
            </motion.p>
          </div>

          <div 
            className="w-full h-2.5 rounded-full overflow-hidden p-0.5"
            style={{ backgroundColor: "#141414", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <div 
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${wakingUpProgress}%`, backgroundColor: "#f5f0e8" }}
            />
          </div>
          
          <span className="text-xs font-mono tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
            Initializing virtual ecosystem • {Math.min(100, Math.floor(wakingUpProgress))}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full min-h-screen flex items-center justify-center p-4 sm:p-8"
      style={{ backgroundColor: "#080808" }}
    >
      <div 
        className="w-full flex flex-col relative"
        style={{ maxWidth: "480px" }}
      >
        {/* Progress Indicator */}
        <div className="flex space-x-1.5 w-full mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i === step ? "#f5f0e8" : "rgba(255,255,255,0.2)"
              }}
            />
          ))}
        </div>

        {/* Back Button (Top-Left of step area) */}
        <div className="h-6 flex items-center mb-6">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center space-x-1 hover:text-[#f5f0e8] transition-colors focus:outline-none"
              style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
        </div>

        {/* Step container */}
        <div className="w-full flex flex-col space-y-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              {/* STEP 1: City Selection */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h1 style={headingStyle}>
                      Where are you based?
                    </h1>
                    <p style={subtextStyle}>
                      We use this to customize energy grid calculations and regional transport averages.
                    </p>
                  </div>

                  <div className="relative">
                    <label 
                      id="city-select-label" 
                      htmlFor="city-select-button" 
                      className="block text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      Select City
                    </label>
                    <button
                      id="city-select-button"
                      type="button"
                      aria-haspopup="listbox"
                      aria-expanded={isOpenDropdown}
                      aria-labelledby="city-select-label"
                      aria-describedby={validationError ? "onboarding-error" : undefined}
                      onFocus={() => setIsCityFocused(true)}
                      onBlur={() => setIsCityFocused(false)}
                      onClick={() => setIsOpenDropdown(!isOpenDropdown)}
                      className="w-full flex items-center justify-between text-left transition-all"
                      style={{
                        backgroundColor: "#141414",
                        border: isCityFocused || isOpenDropdown ? "1px solid rgba(255,255,255,0.4)" : "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "12px",
                        padding: "14px 18px",
                        color: "#f5f0e8",
                        fontSize: "16px",
                        outline: "none",
                      }}
                    >
                      <span className="flex items-center space-x-2.5">
                        <MapPin className="w-5 h-5 text-[#f5f0e8]" />
                        <span style={{ color: city ? "#f5f0e8" : "rgba(255,255,255,0.3)" }}>
                          {city || "Choose your primary location..."}
                        </span>
                      </span>
                      <ChevronDown className="w-5 h-5 text-[rgba(255,255,255,0.4)]" />
                    </button>

                    <AnimatePresence>
                      {isOpenDropdown && (
                        <motion.ul
                          role="listbox"
                          aria-labelledby="city-select-label"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute z-20 w-full mt-2 max-h-60 overflow-y-auto focus:outline-none"
                          style={{
                            backgroundColor: "#141414",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                          }}
                        >
                          {cities.map((item, idx) => (
                            <li role="option" aria-selected={city === item} key={item}>
                              <button
                                type="button"
                                onClick={() => selectCityVal(item)}
                                onMouseEnter={() => setHoveredCityIndex(idx)}
                                onMouseLeave={() => setHoveredCityIndex(null)}
                                className="w-full text-left transition-colors focus:outline-none flex items-center justify-between"
                                style={{
                                  padding: "14px 18px",
                                  color: "#f5f0e8",
                                  backgroundColor: hoveredCityIndex === idx ? "rgba(255,255,255,0.06)" : "#141414",
                                  fontSize: "16px",
                                  borderBottom: idx === cities.length - 1 ? "none" : "1px solid rgba(255,255,255,0.08)",
                                }}
                              >
                                <span style={{ fontWeight: city === item ? "600" : "400" }}>
                                  {item}
                                </span>
                                {city === item && <Check className="w-4 h-4 text-[#f5f0e8]" />}
                              </button>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* STEP 2: Transportation */}
              {step === 2 && (
                <fieldset className="space-y-5 border-0 p-0 m-0">
                  <legend className="sr-only">Transportation Commuting Mode Selection</legend>
                  <div className="space-y-2">
                    <h1 style={headingStyle}>
                      How do you get around?
                    </h1>
                    <p style={subtextStyle}>
                      Choose the primary vehicle or transit mode you use for daily commuting.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3" aria-describedby={validationError ? "onboarding-error" : undefined}>
                    {transportOptions.map((opt) => {
                      const IconComponent = opt.icon;
                      const isSelected = transport === opt.id;
                      const isFocused = focusedTransportId === opt.id;
                      const inputId = `transport-${opt.id.replace(/\s+/g, '-').toLowerCase()}`;
                      return (
                        <div key={opt.id} className="relative">
                          <input
                            type="radio"
                            id={inputId}
                            name="transport_mode"
                            value={opt.id}
                            checked={isSelected}
                            onChange={() => selectTransportVal(opt.id)}
                            onFocus={() => setFocusedTransportId(opt.id)}
                            onBlur={() => setFocusedTransportId(null)}
                            className="sr-only"
                          />
                          <label
                            htmlFor={inputId}
                            className="flex items-center space-x-3.5 transition-all cursor-pointer select-none"
                            style={{
                              backgroundColor: "#141414",
                              border: isSelected || isFocused 
                                ? "1px solid rgba(255,255,255,0.4)" 
                                : "1px solid rgba(255,255,255,0.12)",
                              borderRadius: "12px",
                              padding: "14px 18px",
                              color: "#f5f0e8",
                              outline: "none",
                            }}
                          >
                            <div 
                              className="p-2 rounded-lg flex items-center justify-center" 
                              style={{ 
                                backgroundColor: isSelected ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
                                color: "#f5f0e8" 
                              }}
                            >
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div style={{ fontSize: "16px", fontWeight: isSelected ? "600" : "400" }}>
                                {opt.label}
                              </div>
                              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>
                                {opt.desc}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#f5f0e8] text-[#0a0a0a]">
                                <Check className="w-3.5 h-3.5 font-bold" />
                              </div>
                            )}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              {/* STEP 3: Diet Preference */}
              {step === 3 && (
                <fieldset className="space-y-5 border-0 p-0 m-0">
                  <legend className="sr-only">Diet preference selection</legend>
                  <div className="space-y-2">
                    <h1 style={headingStyle}>
                      What&apos;s your diet like?
                    </h1>
                    <p style={subtextStyle}>
                      Food choices are responsible for up to 30% of individual carbon footprints in India.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3" aria-describedby={validationError ? "onboarding-error" : undefined}>
                    {dietOptions.map((opt) => {
                      const IconComponent = opt.icon;
                      const isSelected = diet === opt.id;
                      const isFocused = focusedDietId === opt.id;
                      const inputId = `diet-${opt.id.replace(/\s+/g, '-').toLowerCase()}`;
                      return (
                        <div key={opt.id} className="relative">
                          <input
                            type="radio"
                            id={inputId}
                            name="diet_type"
                            value={opt.id}
                            checked={isSelected}
                            onChange={() => selectDietVal(opt.id)}
                            onFocus={() => setFocusedDietId(opt.id)}
                            onBlur={() => setFocusedDietId(null)}
                            className="sr-only"
                          />
                          <label
                            htmlFor={inputId}
                            className="flex items-center space-x-3.5 transition-all cursor-pointer select-none"
                            style={{
                              backgroundColor: "#141414",
                              border: isSelected || isFocused 
                                ? "1px solid rgba(255,255,255,0.4)" 
                                : "1px solid rgba(255,255,255,0.12)",
                              borderRadius: "12px",
                              padding: "14px 18px",
                              color: "#f5f0e8",
                              outline: "none",
                            }}
                          >
                            <div 
                              className="p-2 rounded-lg flex items-center justify-center" 
                              style={{ 
                                backgroundColor: isSelected ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
                                color: "#f5f0e8" 
                              }}
                            >
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div style={{ fontSize: "16px", fontWeight: isSelected ? "600" : "400" }}>
                                {opt.label}
                              </div>
                              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>
                                {opt.desc}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#f5f0e8] text-[#0a0a0a]">
                                <Check className="w-3.5 h-3.5 font-bold" />
                              </div>
                            )}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              {/* STEP 4: Name */}
              {step === 4 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h1 style={headingStyle}>
                      What should we call you?
                    </h1>
                    <p style={subtextStyle}>
                      We&apos;ll use your first name to personalise your dashboard.
                    </p>
                  </div>
                  <div>
                    <label 
                      htmlFor="user-name-input" 
                      className="block text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      First Name
                    </label>
                    <input
                      id="user-name-input"
                      type="text"
                      value={userName}
                      onChange={e => { setUserName(e.target.value); setValidationError(""); }}
                      onKeyDown={e => e.key === 'Enter' && isStepValid() && handleNext()}
                      placeholder="Your first name"
                      autoFocus
                      onFocus={() => setIsNameFocused(true)}
                      onBlur={() => setIsNameFocused(false)}
                      className="w-full transition-all placeholder:text-[rgba(255,255,255,0.3)]"
                      style={{
                        backgroundColor: "#141414",
                        border: isNameFocused ? "1px solid rgba(255,255,255,0.4)" : "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "12px",
                        padding: "14px 18px",
                        color: "#f5f0e8",
                        fontSize: "16px",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Validation Error Alert Container */}
          {validationError && (
            <div 
              id="onboarding-error" 
              role="alert" 
              className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs flex items-center space-x-2 animate-shake"
            >
              <span className="font-bold uppercase tracking-wider">Error:</span>
              <span className="font-medium">{validationError}</span>
            </div>
          )}

          {/* Actions Footer */}
          <div className="pt-4 flex justify-end w-full">
            <button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid()}
              onMouseEnter={() => setIsBtnHovered(true)}
              onMouseLeave={() => setIsBtnHovered(false)}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 transition-all focus:outline-none"
              style={{
                backgroundColor: isStepValid() 
                  ? (isBtnHovered ? "#e0dbd2" : "#f5f0e8") 
                  : "rgba(255, 255, 255, 0.2)",
                color: isStepValid() ? "#0a0a0a" : "rgba(255, 255, 255, 0.4)",
                borderRadius: "100px",
                padding: "14px 32px",
                fontWeight: "600",
                cursor: isStepValid() ? "pointer" : "not-allowed",
                opacity: isStepValid() ? 1 : 0.6,
              }}
            >
              <span>{step === 4 ? "Wake up Prakriti" : "Continue"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
