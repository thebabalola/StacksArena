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
    href: "https://explorer.hiro.so/txid/SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2.stacksarena-VaultFactory?chain=mainnet",
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
            <span className="text-sm font-black tracking-tight font-[var(--font-display)] text-foreground">
              STACKS<span className="text-primary italic">ARENA</span>
            </span>
          </Link>
        </div>

        {/* MOBILE HEADER ACTIONS */}
        <div className="flex lg:hidden items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-secondary/10 border border-border/50 text-foreground"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-card border-l border-border/50 p-6 shadow-2xl z-50 flex flex-col justify-between lg:hidden text-foreground"
            >
              <div>
                {/* Header inside drawer */}
                <div className="flex items-center justify-between pb-6 border-b border-border/50 mb-6">
                  <div className="flex items-center gap-2">
                    <img src="/stacksarena-logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                    <span className="text-sm font-black tracking-tight font-[var(--font-display)]">
                      STACKS<span className="text-primary italic">ARENA</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Navigation inside drawer */}
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    if (item.external) {
                      return (
                        <a
                          key={item.name}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/20 transition-all"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Icon className="w-5 h-5 opacity-70" />
                          <span className="text-xs font-bold tracking-wide">{item.name}</span>
                        </a>
                      );
                    }
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive 
                            ? "text-companion bg-companion/10 border-l-2 border-companion font-bold" 
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/20"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-bold tracking-wide">{item.name}</span>
                      </Link>
                    );
                  })}
                  
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all mt-4 border-t border-border/50 pt-4 ${
                        pathname === "/admin" 
                          ? "text-companion bg-companion/10 border-l-2 border-companion font-bold" 
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/20"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5 text-primary" />
                      <span className="text-xs font-bold tracking-wide text-primary uppercase">Admin Panel</span>
                    </Link>
                  )}
                </nav>
              </div>

              {/* Footer / Account section inside drawer */}
              <div className="space-y-4 pt-6 border-t border-border/50">
                {isConnected ? (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-secondary/10 p-3 border border-border flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-companion to-primary/20 p-[1px]">
                        <div className="w-full h-full rounded-lg bg-card flex items-center justify-center overflow-hidden">
                          <img
                            src={profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${stxAddress || "Player"}`}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black truncate">{profile?.username || "Committer"}</p>
                        <p className="text-[9px] font-bold text-muted-foreground truncate">{formatAddress(stxAddress)}</p>
                        <p className="text-[9px] font-black text-primary tracking-wider uppercase mt-0.5">{formattedSTX} STX</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        disconnect();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all text-xs font-bold uppercase tracking-widest"
                    >
                      <LogOut className="w-4 h-4" />
                      Terminate Session
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      connect();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-4 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest text-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                  >
                    Connect Wallet
                  </button>
                )}
                
                <div className="flex items-center justify-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>Protocol Live</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
            <span className={`text-[9px] font-black tracking-wider uppercase mt-1 transition-all duration-300 ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-active:opacity-100 group-active:translate-y-0"}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
    </>
  );
}
