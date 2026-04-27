"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sword, Ticket, Layers, Info, Settings, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

const menuItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Arena", href: "/arena", icon: Sword },
  { name: "Lottery", href: "/lottery", icon: Ticket },
  { name: "Assets", href: "/assets", icon: Layers },
];

const secondaryItems = [
  { name: "Documentation", href: "#", icon: Info },
  { name: "Settings", href: "#", icon: Settings },
  { name: "Support", href: "#", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

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

      <nav className="flex-1 px-4 space-y-1">
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] px-4 mb-4">Core Systems</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="relative group block">
              {isActive && (
                <motion.div layoutId="activeNav" className="absolute inset-0 bg-primary/5 rounded-xl border-l-2 border-primary" />
              )}
              <div className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive ? "text-primary bg-primary/5" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" : "opacity-70 group-hover:opacity-100"}`} />
                <span className="text-sm font-bold tracking-wide">{item.name}</span>
                {isActive && (
                   <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto w-1 h-4 rounded-full bg-primary" />
                )}
              </div>
            </Link>
          );
        })}

        <div className="pt-8 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] px-4 mb-4">Support</div>
        {secondaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group">
              <Icon className="w-5 h-5 opacity-50 group-hover:opacity-100" />
              <span className="text-sm font-bold tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6">
        <div className="rounded-2xl bg-white/[0.02] p-4 border border-white/5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 font-[var(--font-display)]">Identity</p>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
             <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Mainnet Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
