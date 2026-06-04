"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  BarChart3,
  Info,
  HelpCircle,
  LayoutDashboard,
  User as UserIcon,
  PlusCircle,
  Settings,
} from "lucide-react";
import { PLATFORM_CONFIG } from "@/lib/constants/contracts";
import { motion } from "framer-motion";
import { useStacks } from "@/lib/hooks/use-stacks";
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
  const { isConnected, stxAddress, profile } = useStacks();
  const { formattedSTX } = useBalance();
  const isAdmin = stxAddress === PLATFORM_CONFIG.deployer;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-card text-card-foreground border-r border-border h-screen sticky top-0 z-40 transition-colors duration-300">
      <div className="px-6 py-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-10 h-10 flex-shrink-0">
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full group-hover:bg-primary/40 transition-colors" />
            <img
              src="/stacksarena-logo.png"
              alt="StacksArena"
              className="relative z-10 w-full h-full object-contain group-hover:scale-110 transition-transform"
            />
          </div>
          <span className="text-lg font-black tracking-tight text-foreground font-[var(--font-display)]">
            STACKS<span className="text-primary italic">ARENA</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-0.5">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-4 mb-4">
          Vault Systems
        </div>
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
                className="relative group block"
              >
                <div className="relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-muted-foreground hover:text-foreground hover:bg-secondary/30">
                  <Icon className="w-4.5 h-4.5 opacity-70 group-hover:opacity-100" />
                  <span className="text-xs font-bold tracking-wide">
                    {item.name}
                  </span>
                </div>
              </a>
            );
          }
          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative group block"
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-companion/10 rounded-xl border-l-2 border-companion"
                />
              )}
              <div
                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? "text-companion bg-companion/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                }`}
              >
                <Icon
                  className={`w-4.5 h-4.5 ${isActive ? "drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]" : "opacity-70 group-hover:opacity-100"}`}
                />
                <span className="text-xs font-bold tracking-wide">
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}

        {isAdmin && (
          <Link href="/admin" className="relative group block mt-4 border-t border-border/50 pt-4">
            {pathname === "/admin" && (
              <motion.div
                layoutId="activeNav"
                className="absolute inset-0 top-4 bg-companion/10 rounded-xl border-l-2 border-companion"
              />
            )}
            <div
              className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                pathname === "/admin"
                  ? "text-companion bg-companion/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
              }`}
            >
              <Settings
                className={`w-4.5 h-4.5 ${pathname === "/admin" ? "drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]" : "opacity-70 group-hover:opacity-100"}`}
              />
              <span className="text-xs font-bold tracking-wide uppercase text-primary">
                Admin Panel
              </span>
            </div>
          </Link>
        )}
      </nav>

      <div className="p-4 space-y-4">
        {isConnected && (
          <div className="rounded-2xl bg-secondary/10 p-3 border border-border/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-companion to-primary/20 p-[1px]">
              <div className="w-full h-full rounded-xl bg-card flex items-center justify-center overflow-hidden">
                <img
                  src={
                    profile?.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${stxAddress || "Player"}`
                  }
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-foreground truncate">
                {profile?.username || "Committer"}
              </p>
              <p className="text-[9px] font-bold text-muted-foreground truncate">
                {formatAddress(stxAddress)}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1 h-1 rounded-full bg-primary" />
                <span className="text-[9px] font-black text-primary tracking-widest uppercase">
                  {formattedSTX} STX
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-secondary/5 p-4 border border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              Protocol Live
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
