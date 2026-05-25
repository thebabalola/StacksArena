"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Lock, 
  Shield, 
  Zap, 
  BarChart3,
  Bitcoin,
  CheckCircle2,
  Swords
} from "lucide-react";

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    title: "Welcome to Stacks Arena",
    description: "The premier Bitcoin-native commitment protocol. Secure your future through programmable smart contract vaults.",
    icon: <Swords className="text-primary w-8 h-8" />,
  },
  {
    title: "Commitment Archetypes",
    description: "Choose between Time-Locked, Penalty-Based, or Multi-Sig vaults. Each is designed to enforce financial discipline.",
    icon: <Shield className="text-primary w-8 h-8" />,
  },
  {
    title: "Block-Anchored Security",
    description: "Your funds are locked until specific Stacks block heights. True decentralized enforcement, no human middleman.",
    icon: <Lock className="text-primary w-8 h-8" />,
  },
  {
    title: "Real-Time Stats",
    description: "Monitor Total Value Locked (TVL) and protocol growth directly on your dashboard.",
    icon: <BarChart3 className="text-primary w-8 h-8" />,
  },
  {
    title: "Manage Your Locks",
    description: "View and manage all your active commitments. Track your progress toward your financial goals.",
    icon: <Bitcoin className="text-primary w-8 h-8" />,
  },
  {
    title: "Enter the Arena",
    description: "Connect your wallet and establish your first Bitcoin-anchored commitment today.",
    icon: <CheckCircle2 className="text-primary w-8 h-8" />,
  }
];

export default function ArenaOnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenStacksArenaTour");
    if (!hasSeenTour) {
      setIsOpen(true);
    }
  }, []);

  const closeTour = () => {
    localStorage.setItem("hasSeenStacksArenaTour", "true");
    setIsOpen(false);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      closeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeTour}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#0a0a1a] border border-primary/20 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(249,115,22,0.1)]"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                className="h-full bg-primary"
              />
            </div>

            <button 
              onClick={closeTour}
              className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-10 pt-14 text-center">
              <motion.div 
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/20">
                  {steps[currentStep].icon}
                </div>
                
                <h3 className="text-2xl font-black text-white uppercase tracking-wider font-[var(--font-display)]">
                  {steps[currentStep].title}
                </h3>
                
                <p className="text-slate-400 text-sm leading-relaxed font-bold uppercase">
                  {steps[currentStep].description}
                </p>
              </motion.div>

              <div className="mt-12 flex items-center justify-between">
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <div 
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === currentStep ? "w-6 bg-primary" : "w-1.5 bg-white/10"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex gap-3">
                  {currentStep > 0 && (
                    <button 
                      onClick={prevStep}
                      className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all"
                    >
                      <ChevronLeft size={24} />
                    </button>
                  )}
                  <button 
                    onClick={nextStep}
                    className="px-6 py-3 bg-primary text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 uppercase text-xs tracking-widest border-glow"
                  >
                    {currentStep === steps.length - 1 ? "Start" : "Next"}
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
