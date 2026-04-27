"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sword, Ticket, Layers, Info, Settings, HelpCircle, Trophy, LayoutDashboard, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useStacks } from "@/lib/hooks/use-stacks";

const menuItems = [
  { name: "Arena", href: "/arena", icon: Sword },
  { name: "Tournaments", href: "/arena#tournaments", icon: Trophy },
  { name: "Lottery", href: "/lottery", icon: Ticket },
  { name: "Assets", href: "/assets", icon: Layers },
  { name: "Dashboard", href: "/arena#dashboard", icon: LayoutDashboard },
  { name: "Profile", href: "/arena#profile", icon: UserIcon },
];

const secondaryItems = [
  { name: "Documentation", href: "#", icon: Info },
  { name: "Support", href: "#", icon: HelpCircle },
];

function formatAddress(address?: string | null) {
  if (!address) return "ST123...4567";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function Sidebar() {
  const pathname = usePathname();
  const { isConnected, stxAddress } = useStacks();

  return (
    <aside className="hidden lg:flex flex-col w-64 glass-panel border-r border-white/5 h-screen sticky top-0 z-40">
      <div className="p-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 flex-shrink-0">
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full group-hover:bg-primary/40 transition-colors" />
            <img src="/stacksarena-logo.png" alt="StacksArena" className="relative z-10 w-full h-full object-contain group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white font-[var(--font-display)]">
            STACKS<span className="text-primary italic">ARENA</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-0.5">
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] px-4 mb-4">Core Systems</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className="relative group block">
              {isActive && (
                <motion.div layoutId="activeNav" className="absolute inset-0 bg-companion/10 rounded-xl border-l-2 border-companion" />
              )}
              <div className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                isActive ? "text-companion bg-companion/5" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}>
                <Icon className={`w-4.5 h-4.5 ${isActive ? "drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]" : "opacity-70 group-hover:opacity-100"}`} />
                <span className="text-xs font-bold tracking-wide">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-4">
        {isConnected && (
           <div className="rounded-2xl bg-white/[0.03] p-3 border border-white/5 flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-companion to-primary/20 p-[1px]">
               <div className="w-full h-full rounded-xl bg-[#0a0a1a] flex items-center justify-center overflow-hidden">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=PlayerOne" alt="Avatar" className="w-full h-full object-cover" />
               </div>
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-[11px] font-black text-white truncate">PlayerOne</p>
               <p className="text-[9px] font-bold text-slate-500 truncate">{formatAddress(stxAddress)}</p>
               <div className="flex items-center gap-1 mt-0.5">
                 <div className="w-1 h-1 rounded-full bg-primary" />
                 <span className="text-[9px] font-black text-primary tracking-widest uppercase">12,463 STX</span>
               </div>
             </div>
           </div>
        )}

        <div className="rounded-2xl bg-white/[0.02] p-4 border border-white/5">
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Arena</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
