"use client";

import Link from "next/link";
import { useStacks } from "@/lib/hooks/use-stacks";
import { ThemeToggle } from "./ui/theme-toggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { 
  ChevronDown, 
  User, 
  Lock, 
  PlusCircle, 
  LayoutDashboard, 
  BarChart3, 
  Menu, 
  X, 
  ShieldCheck,
  User as UserIcon,
  Settings,
  LogOut,
} from "lucide-react";
import { PLATFORM_CONFIG } from "@/lib/constants/contracts";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useBalance } from "@/lib/hooks/use-balance";

const menuItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Create Vault", href: "/create", icon: PlusCircle },
  { name: "Active Locks", href: "/vaults", icon: Lock },
  { name: "Global Stats", href: "/stats", icon: BarChart3 },
  { name: "Profile", href: "/profile", icon: UserIcon },
  {
    name: "Protocol",
    href: "https://explorer.hiro.so/txid/SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2.stacksarena-VaultFactory-fix?chain=mainnet",
    icon: ShieldCheck,
    external: true,
  },
];

function formatAddress(address?: string | null) {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function Navbar() {
  const pathname = usePathname();
  const { isConnected, stxAddress, connect, disconnect, profile } = useStacks();
  const { formattedSTX } = useBalance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = stxAddress === PLATFORM_CONFIG.deployer;

  return (
    <>
    <header className="sticky top-0 z-30 w-full bg-transparent">
      <div className="flex items-center justify-between px-6 lg:px-10 h-20 bg-background/5 backdrop-blur-md border-b border-border/10">
        
        {/* DESKTOP SESSION INDICATOR */}
        <div className="hidden lg:block">
           <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-secondary/10 border border-border/50 backdrop-blur-md">
             <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#F97316]" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
               {isConnected ? "Vault Session Active" : "Waiting for Commitment"}
             </span>
           </div>
        </div>

        {/* DESKTOP HEADER ACTIONS */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          <ThemeToggle />
          {isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/10 hover:bg-secondary/20 transition-all border border-border/50 shadow-2xl group overflow-hidden relative">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center relative z-10">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="font-bold text-xs text-foreground relative z-10">{formatAddress(stxAddress)}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform relative z-10" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 glass-panel p-2 text-foreground border-border/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                <DropdownMenuItem onClick={disconnect} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10 transition-colors">
                  <ChevronDown className="w-4 h-4 rotate-90" />
                  <span className="font-bold text-xs uppercase tracking-widest">Terminate Session</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button onClick={connect} className="group relative overflow-hidden rounded-xl bg-primary px-7 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 shadow-[0_15px_40px_rgba(249,115,22,0.35)]">
              <span className="relative z-10">Connect Wallet</span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>
          )}
        </div>

        {/* MOBILE LOGO */}
        <div className="flex lg:hidden items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <img src="/stacksarena-logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          </Link>
        </div>

        {/* MOBILE HEADER ACTIONS */}
        <div className="flex lg:hidden items-center gap-2 shrink-0">
          <ThemeToggle />
          {isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/10 hover:bg-secondary/20 transition-all border border-border/50 shadow-2xl group overflow-hidden relative">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center relative z-10">
                    <User className="w-3 h-3 text-primary" />
                  </div>
                  <span className="font-bold text-[10px] text-foreground relative z-10">{formatAddress(stxAddress)}</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform relative z-10" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 glass-panel p-1.5 text-foreground border-border/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                <div className="px-2.5 py-2 border-b border-border/50 mb-1 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${stxAddress || "Player"}`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black truncate text-foreground">{profile?.username || "Committer"}</p>
                    <p className="text-[9px] font-black text-primary truncate">{formattedSTX || "0"} STX</p>
                  </div>
                </div>
                <DropdownMenuItem onClick={disconnect} className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10 transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="font-bold text-[10px] uppercase tracking-wider">Disconnect</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button onClick={connect} className="group relative overflow-hidden rounded-xl bg-primary px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white transition-all hover:scale-105 active:scale-95 shadow-[0_10px_25px_rgba(249,115,22,0.3)]">
              <span className="relative z-10">Connect</span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>
          )}
        </div>
      </div>
    </header>

    {/* MOBILE BOTTOM NAVIGATION BAR */}
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/50 flex lg:hidden items-end justify-around pb-4 pt-2 px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
      {menuItems.slice(0, 5).map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`group flex flex-col items-center justify-center flex-1 transition-all ${
              isActive ? "text-companion" : "text-muted-foreground"
            }`}
          >
            <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? "bg-companion/10 scale-110" : "group-hover:bg-secondary/20 group-active:bg-secondary/20 group-hover:-translate-y-1 group-active:-translate-y-1"}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className={`text-[9px] font-black tracking-wider uppercase mt-1 text-center block w-full transition-all duration-300 ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-active:opacity-100 group-active:translate-y-0"}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
    </>
  );
}
