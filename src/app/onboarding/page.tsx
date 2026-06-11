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
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [wakingUpProgress, setWakingUpProgress] = useState(0);
  const [validationError, setValidationError] = useState("");

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
    } else {
      const res = OnboardingInputSchema.safeParse({ city, transport, diet });
      if (!res.success) {
        setValidationError(res.error.errors[0].message);
        return;
      }
      handleSubmit();
    }
  };

  const handleBack = () => {
    setValidationError("");
    if (step > 1) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsWakingUp(true);
    
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
        "Arjun",
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

  // State to track transition direction
  const [direction, setDirection] = useState(1);

  if (isWakingUp) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6 bg-gradient-to-b from-background to-surface relative overflow-hidden">
        {/* Shola Forest Mist Layer */}
        {!shouldReduceMotion && (
          <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
            <div className="absolute top-[20%] left-[-10%] w-[60%] h-[40%] bg-primary/20 blur-[120px] rounded-full mist-slow"></div>
            <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[100px] rounded-full mist-fast"></div>
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center space-y-8 px-4">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              delay: 0.1 
            }}
            className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary relative"
          >
            <Leaf className="w-12 h-12 fill-current animate-bounce" />
            {!shouldReduceMotion && (
              <motion.div 
                className="absolute inset-0 rounded-full border border-primary/50"
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              />
            )}
          </motion.div>

          <div className="space-y-3">
            <motion.h2 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`text-2xl font-bold bg-gradient-to-r from-primary via-accent to-green-300 bg-clip-text text-transparent ${shouldReduceMotion ? "" : "pulse-soft"}`}
            >
              Your Prakriti is waking up...
            </motion.h2>
            <motion.p 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-foreground/70 text-sm max-w-xs mx-auto"
            >
              Aligning your carbon budget envelopes and summoning your Western Ghats companion.
            </motion.p>
          </div>

          <div className="w-full bg-surface border border-border/80 h-2.5 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300 ease-out"
              style={{ width: `${wakingUpProgress}%` }}
            />
          </div>
          
          <span className="text-xs text-foreground/40 font-mono tracking-widest uppercase">
            Initializing virtual ecosystem • {Math.min(100, Math.floor(wakingUpProgress))}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 sm:p-8 bg-gradient-to-b from-background to-surface relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-xl relative z-10">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-widest text-foreground/40">Step</span>
            <span className="text-sm font-bold text-primary font-mono">{step} of 3</span>
          </div>
          <div className="flex space-x-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-8 bg-primary" : i < step ? "w-3 bg-accent/60" : "w-3 bg-surface border border-border"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card Frame */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
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
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                      Where are you based?
                    </h1>
                    <p className="text-foreground/60 text-sm">
                      We use this to customize energy grid calculations and regional transport averages.
                    </p>
                  </div>

                  <div className="relative">
                    <label id="city-select-label" htmlFor="city-select-button" className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">
                      Select City
                    </label>
                    <button
                      id="city-select-button"
                      type="button"
                      aria-haspopup="listbox"
                      aria-expanded={isOpenDropdown}
                      aria-labelledby="city-select-label"
                      aria-describedby={validationError ? "onboarding-error" : undefined}
                      onClick={() => setIsOpenDropdown(!isOpenDropdown)}
                      className="w-full bg-background border border-border hover:border-primary/50 focus:border-primary rounded-xl px-4 py-3.5 flex items-center justify-between text-left text-foreground focus:outline-none transition-all focus:ring-2 focus:ring-primary/20 min-h-[48px]"
                    >
                      <span className="flex items-center space-x-2.5">
                        <MapPin className="w-5 h-5 text-primary" />
                        <span className={city ? "text-foreground font-medium" : "text-foreground/40 font-normal"}>
                          {city || "Choose your primary location..."}
                        </span>
                      </span>
                      <ChevronDown className={`w-5 h-5 text-foreground/40 transition-transform ${isOpenDropdown ? "rotate-180" : ""}`} />
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
                          className="absolute z-20 w-full mt-2 bg-background border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto focus:outline-none"
                        >
                          {cities.map((item) => (
                            <li role="option" aria-selected={city === item} key={item}>
                              <button
                                type="button"
                                onClick={() => selectCityVal(item)}
                                className="w-full text-left px-4 py-3 hover:bg-surface/80 text-sm flex items-center justify-between transition-colors border-b border-border/30 last:border-0 min-h-[44px] focus-visible:bg-surface/80 focus:outline-none"
                              >
                                <span className={city === item ? "text-primary font-semibold" : "text-foreground"}>
                                  {item}
                                </span>
                                {city === item && <Check className="w-4 h-4 text-primary" />}
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
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                      How do you get around?
                    </h1>
                    <p className="text-foreground/60 text-sm">
                      Choose the primary vehicle or transit mode you use for daily commuting.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-describedby={validationError ? "onboarding-error" : undefined}>
                    {transportOptions.map((opt) => {
                      const IconComponent = opt.icon;
                      const isSelected = transport === opt.id;
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
                            className="sr-only"
                          />
                          <label
                            htmlFor={inputId}
                            className={`flex items-start space-x-3.5 p-4 rounded-xl border text-left transition-all cursor-pointer min-h-[48px] focus-within:ring-2 focus-within:ring-primary ${
                              isSelected 
                                ? "bg-primary/5 border-primary shadow-[0_0_15px_rgba(74,222,128,0.08)]" 
                                : "bg-background border-border hover:border-text/30"
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${isSelected ? "bg-primary/15 text-primary" : "bg-surface text-foreground/50"}`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div>
                              <div className={`font-semibold text-sm ${isSelected ? "text-primary" : "text-foreground"}`}>
                                {opt.label}
                              </div>
                              <div className="text-xs text-foreground/55 mt-0.5">
                                {opt.desc}
                              </div>
                            </div>
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
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                      What&apos;s your diet like?
                    </h1>
                    <p className="text-foreground/60 text-sm">
                      Food choices are responsible for up to 30% of individual carbon footprints in India.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-describedby={validationError ? "onboarding-error" : undefined}>
                    {dietOptions.map((opt) => {
                      const IconComponent = opt.icon;
                      const isSelected = diet === opt.id;
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
                            className="sr-only"
                          />
                          <label
                            htmlFor={inputId}
                            className={`flex items-start space-x-3.5 p-4 rounded-xl border text-left transition-all cursor-pointer min-h-[48px] focus-within:ring-2 focus-within:ring-primary ${
                              isSelected 
                                ? "bg-primary/5 border-primary shadow-[0_0_15px_rgba(74,222,128,0.08)]" 
                                : "bg-background border-border hover:border-text/30"
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${isSelected ? "bg-primary/15 text-primary" : "bg-surface text-foreground/50"}`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div>
                              <div className={`font-semibold text-sm ${isSelected ? "text-primary" : "text-foreground"}`}>
                                {opt.label}
                              </div>
                              <div className="text-xs text-foreground/55 mt-0.5">
                                {opt.desc}
                              </div>
                            </div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </fieldset>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Validation Error Alert Container */}
          {validationError && (
            <div 
              id="onboarding-error" 
              role="alert" 
              className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs flex items-center space-x-2 animate-shake"
            >
              <span className="font-bold uppercase tracking-wider">Error:</span>
              <span className="font-medium">{validationError}</span>
            </div>
          )}

          {/* Actions Footer */}
          <div className="mt-8 pt-6 border-t border-border/80 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              aria-label="Go back to previous step"
              className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ${
                step === 1 
                  ? "text-foreground/20 cursor-not-allowed" 
                  : "text-foreground/60 hover:text-foreground hover:bg-background"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid()}
              aria-label={step === 3 ? "Complete onboarding and wake up Prakriti" : "Continue to next step"}
              className={`flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ${
                isStepValid()
                  ? "bg-primary text-background hover:brightness-110 shadow-lg shadow-primary/10 active:scale-95 cursor-pointer"
                  : "bg-border text-foreground/30 cursor-not-allowed"
              }`}
            >
              <span>{step === 3 ? "Wake up Prakriti" : "Continue"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
