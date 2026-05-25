"use client";

import { motion } from "framer-motion";

export function ArenaSkeleton({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{
        opacity: [0.3, 0.5, 0.3],
        backgroundColor: ["rgba(255, 255, 255, 0.02)", "rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`rounded-xl border border-white/5 ${className}`}
    />
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <ArenaSkeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2">
            <ArenaSkeleton className="w-20 h-6" />
            <ArenaSkeleton className="w-16 h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function VaultListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-8 rounded-2xl bg-[#0a0a1a]/60 border border-white/5 space-y-6">
          <div className="flex justify-between items-start">
            <ArenaSkeleton className="w-14 h-14 rounded-xl" />
            <ArenaSkeleton className="w-20 h-6 rounded-full" />
          </div>
          <div className="space-y-3">
            <ArenaSkeleton className="w-3/4 h-5" />
            <ArenaSkeleton className="w-full h-10" />
          </div>
          <div className="pt-4 flex justify-between">
            <ArenaSkeleton className="w-24 h-4" />
            <ArenaSkeleton className="w-24 h-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
