"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useStacks } from "@/lib/hooks/use-stacks";
import { ThemeToggle } from "./ui/theme-toggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { ChevronDown, LogOut, User, Sword, Ticket, Layers, Home } from "lucide-react";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Arena", href: "/arena", icon: Sword },
  { name: "Lottery", href: "/lottery", icon: Ticket },
  { name: "Assets", href: "/assets", icon: Layers },
];

function formatAddress(address?: string | null) {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function Navbar() {
  const { isConnected, stxAddress, connect, disconnect } = useStacks();

  return (
    <header className="sticky top-0 z-30 w-full bg-transparent">
      <div className="flex items-center justify-between px-6 lg:px-10 h-20">
        <div className="lg:hidden">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <img src="/stacksarena-logo.png" alt="StacksArena" className="w-8 h-8 transition-transform group-hover:scale-110" />
            <span className="text-lg font-black tracking-tight text-white font-[var(--font-display)]">
              STACKS<span className="text-primary italic">ARENA</span>
            </span>
          </Link>
        </div>
        
        <div className="hidden lg:block">
           <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
             <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#F97316]" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{isConnected ? "Player Session Active" : "Waiting for Connection"}</span>
           </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <ThemeToggle />
          {isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 shadow-2xl group overflow-hidden relative">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center relative z-10">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="font-bold text-xs text-white/90 relative z-10">{formatAddress(stxAddress)}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-data-[state=open]:rotate-180 transition-transform relative z-10" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 glass-panel p-2 text-white border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <DropdownMenuItem onClick={disconnect} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10 transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase tracking-widest">Terminate Session</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button onClick={connect} className="group relative overflow-hidden rounded-xl bg-primary px-7 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 shadow-[0_15px_40px_rgba(249,115,22,0.35)]">
              <span className="relative z-10">Connect Arena</span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
