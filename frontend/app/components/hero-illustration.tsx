"use client";

import { motion } from "framer-motion";

export function HeroIllustration() {
  return (
    <div className="relative w-full h-[440px] flex items-center justify-center select-none">
      {/* Outer pulse rings */}
      <motion.div className="absolute w-80 h-80 rounded-full border border-primary/20"
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 4, repeat: Infinity }} />
      <motion.div className="absolute w-56 h-56 rounded-full border border-companion/20"
        animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.45, 0.15] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 0.7 }} />

      {/* Center shield */}
      <motion.div className="relative z-10 w-36 h-36"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-[0_0_28px_rgba(249,115,22,0.5)]">
          <path d="M32 4 L56 15 L56 36 C56 50 44 59 32 62 C20 59 8 50 8 36 L8 15 Z" fill="#1E1040" stroke="#F97316" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M32 10 L50 19 L50 36 C50 47 41 54 32 57 C23 54 14 47 14 36 L14 19 Z" fill="#7C3AED" opacity="0.22"/>
          <path d="M36 20 L27 35 L33 35 L28 46 L39 31 L33 31 L38 20 Z" fill="#F97316" strokeLinejoin="round"/>
        </svg>
      </motion.div>

      {/* Tournament card */}
      <motion.div className="absolute top-6 right-10 bg-card border border-border rounded-2xl p-4 shadow-xl w-40"
        animate={{ y: [0, -12, 0], rotate: [0, 1.5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase text-primary">Live Tournament</span>
          <motion.div className="w-2 h-2 rounded-full bg-green-400"
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
        </div>
        <p className="text-sm font-black text-foreground mb-1">Bitcoin Blitz #12</p>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Prize Pool</span>
          <span className="font-bold text-primary">750 STX</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full">
          <motion.div className="h-full bg-primary rounded-full"
            initial={{ width: "0%" }} animate={{ width: "75%" }}
            transition={{ duration: 2, delay: 0.5 }} />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">24/32 players</p>
      </motion.div>

      {/* Lottery card */}
      <motion.div className="absolute bottom-10 right-6 bg-card border border-border rounded-2xl p-4 shadow-xl w-32"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}>
        <div className="w-8 h-8 rounded-xl bg-companion/10 flex items-center justify-center mb-2">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#8B5CF6" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 7V5a2 2 0 00-4 0v2M12 12v4M10 14h4"/>
          </svg>
        </div>
        <p className="text-[10px] text-muted-foreground">Jackpot</p>
        <p className="text-base font-black text-foreground">1,847 STX</p>
      </motion.div>

      {/* Asset card */}
      <motion.div className="absolute top-12 left-6 bg-card border border-border rounded-2xl p-4 shadow-xl w-32"
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}>
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#F97316" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <p className="text-[10px] text-muted-foreground">Asset #0042</p>
        <p className="text-xs font-bold text-companion">LEGENDARY</p>
      </motion.div>

      {/* Floating particles */}
      {[{ top: "22%", left: "44%", d: 0 }, { top: "68%", left: "32%", d: 1.2 }, { top: "42%", right: "28%", d: 0.6 }].map((p, i) => (
        <motion.div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-primary/60"
          style={p as React.CSSProperties}
          animate={{ y: [0, -20, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: p.d }} />
      ))}
    </div>
  );
}
