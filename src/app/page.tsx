"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userId = localStorage.getItem("prakriti_user_id");
      if (userId) {
        router.replace("/dashboard");
      } else {
        router.replace("/onboarding");
      }
    }
  }, [router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] p-6 bg-background">
      <div className="flex flex-col items-center space-y-4 max-w-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary animate-bounce">
          <Leaf className="w-8 h-8 fill-current" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-green-300 bg-clip-text text-transparent">
          Waking up Prakriti...
        </h1>
        <p className="text-text/60 text-sm">
          Preparing your eco-budget dashboard.
        </p>
      </div>
    </div>
  );
}
