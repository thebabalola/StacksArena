"use client";

import ArenaOnboardingTour from "@/components/ArenaOnboardingTour";
import { StatsSkeleton } from "@/components/ArenaSkeletons";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Lock,
  BarChart3,
  Bitcoin,
  ChevronRight,
  PlusCircle,
  Scale,
  Zap,
  Users
} from "lucide-react";
import { useStacks } from "@/lib/hooks/use-stacks";
import { useVaultFactory } from "@/lib/hooks/use-contract";

function Counter({
  target,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let n = 0;
    const duration = 2000;
    const steps = 80;
    const stepValue = target / steps;
    const interval = duration / steps;

    const timer = setInterval(() => {
      n += stepValue;
      if (n >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(n);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

export default function Home() {
  const { connect, isConnected } = useStacks();
  const { getProtocolStats } = useVaultFactory();

  const [stats, setStats] = useState({
    totalVaults: 0,
    totalLocked: 0,
    activeUsers: 0,
    treasuryBalance: 0,
  });

  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const protocolStats = await getProtocolStats();
      const s = protocolStats?.value;

      setStats({
        totalVaults: Number(s?.["total-vaults"]?.value ?? 0),
        totalLocked: Number(s?.["total-locked"]?.value ?? 0) / 1000000,
        activeUsers: Number(s?.["total-vaults"]?.value ?? 0),
        treasuryBalance: 0,
      });
    } catch (e) {
      console.error("Failed to fetch stats:", e);
    } finally {
      setIsLoadingStats(false);
    }
  }, [getProtocolStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const featureCards = [
    {
      icon: Lock,
      colorClass: "text-primary",
      title: "TIME-LOCKED",
      desc: "Secure your STX until a future date. No early access, pure discipline.",
      href: "/create",
    },
    {
      icon: Scale,
      colorClass: "text-orange-500",
      title: "PENALTY-BASED",
      desc: "Commit to a goal. Early withdrawal incurs a penalty to ensure you stay on track.",
      href: "/create",
    },
    {
      icon: Shield,
      colorClass: "text-companion",
      title: "MULTI-SIG",
      desc: "Require multiple approvals to unlock. Perfect for partnerships and escrow.",
      href: "/create",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Connect Wallet",
      desc: "Link your Stacks wallet (Leather or Xverse) to access your vaults.",
    },
    {
      num: "02",
      title: "Define Terms",
      desc: "Set your lock duration, penalty rate, or multi-sig participants.",
    },
    {
      num: "03",
      title: "Commit BTC/STX",
      desc: "Lock your assets under immutable Clarity smart contract rules.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 dark:from-[#020208] dark:via-[#050515] dark:to-[#010103] text-foreground transition-colors duration-300">
      <ArenaOnboardingTour />
      {/* HERO SECTION */}
      <section className="relative overflow-hidden min-h-[95vh] flex items-center justify-center text-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-background/80 dark:bg-[#020208]/80 z-10 transition-colors duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-background dark:from-[#020208] via-transparent to-transparent z-10 transition-all duration-300" />
          <img
            src="/stacksarena-heroimg.png"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-15 dark:opacity-70 transition-opacity duration-300"
          />
        </div>

        <div className="relative z-20 w-full max-w-5xl px-6 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-6xl md:text-8xl font-black leading-[0.95] tracking-tight text-foreground mb-6 font-[var(--font-display)] uppercase"
            >
              LOCK.
              <br />
              <span className="text-primary text-glow animate-neon-flicker italic">
                COMMIT.
              </span>
              <br />
              GROW.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-lg md:text-xl text-muted-foreground font-bold leading-relaxed mb-10 max-w-2xl mx-auto uppercase"
            >
              The Bitcoin-native commitment protocol. Transform your assets into
              enforceable financial behavior with Stacks Arena.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              {isConnected ? (
                <Link
                  href="/create"
                  className="group inline-flex items-center gap-3 rounded-xl bg-primary px-10 py-5 text-sm font-black text-white hover:bg-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all hover:scale-105 active:scale-95 border-glow uppercase tracking-wide"
                >
                  CREATE VAULT{" "}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <button
                  onClick={connect}
                  className="group inline-flex items-center gap-3 rounded-xl bg-primary px-10 py-5 text-sm font-black text-white hover:bg-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all hover:scale-105 active:scale-95 border-glow uppercase tracking-wide"
                >
                  CONNECT WALLET{" "}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              <Link
                href="/vaults"
                className="inline-flex items-center gap-2 rounded-xl border border-border/50 px-10 py-5 text-sm font-black text-foreground hover:bg-secondary/50 hover:border-border transition-all uppercase tracking-wide bg-secondary/20 backdrop-blur-sm transition-colors duration-300"
              >
                MANAGE LOCKS <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center gap-6 md:gap-10 mt-12 pt-8 border-t border-border/40"
            >
              {[
                { icon: Shield, label: "Bitcoin Secured" },
                { icon: Lock, label: "Enforced Discipline" },
                { icon: Zap, label: "Deterministic" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-muted-foreground transition-colors duration-300"
                >
                  <Icon className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    {label}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="relative z-30 -mt-16 w-full max-w-7xl mx-auto px-6 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="w-full rounded-2xl bg-card/95 border border-border/50 p-6 md:p-10 backdrop-blur-2xl shadow-2xl relative"
        >
          <div className="absolute inset-0 cyber-mesh opacity-10 rounded-2xl pointer-events-none" />

          {isLoadingStats ? (
            <StatsSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
              {[
                {
                  icon: Users,
                  label: "COMMITTERS",
                  target: stats.activeUsers,
                  suffix: "",
                  decimals: 0,
                },
                {
                  icon: Lock,
                  label: "ACTIVE VAULTS",
                  target: stats.totalVaults,
                  suffix: "",
                  decimals: 0,
                },
                {
                  icon: Bitcoin,
                  label: "TOTAL LOCKED",
                  target: stats.totalLocked,
                  suffix: " STX",
                  prefix: "",
                  decimals: 2,
                },
                {
                  icon: BarChart3,
                  label: "TREASURY",
                  target: stats.treasuryBalance,
                  suffix: " STX",
                  decimals: 2,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-4 shrink-0"
                >
                  <div className="w-12 h-12 rounded-xl bg-companion/10 flex items-center justify-center shrink-0">
                    <stat.icon className="w-5 h-5 text-companion" />
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-black text-foreground font-[var(--font-display)] tracking-wide">
                      {stat.prefix}
                      <Counter
                        target={stat.target}
                        suffix={stat.suffix}
                        decimals={stat.decimals}
                      />
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      {/* FEATURE CARDS */}
      <section className="py-10 px-6">
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureCards.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 * i + 0.5 }}
              >
                <Link
                  href={feat.href}
                  className="group relative block p-8 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/50 hover:border-companion/40 transition-all hover:-translate-y-2 h-full shadow-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-companion/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-14 h-14 rounded-xl bg-secondary/15 flex items-center justify-center mb-6 relative z-10 border border-border/50">
                    <Icon
                      className={`w-6 h-6 ${feat.colorClass} drop-shadow-[0_0_8px_currentColor]`}
                    />
                  </div>
                  <h3 className="text-xs font-black text-foreground mb-3 tracking-widest font-[var(--font-display)] relative z-10 uppercase">
                    {feat.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-bold relative z-10">
                    {feat.desc}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 bg-secondary/5 transition-colors duration-300">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">
              How It Works
            </p>
            <h2 className="text-3xl md:text-5xl font-black font-[var(--font-display)] text-foreground tracking-wide uppercase">
              THREE STEPS TO COMMIT.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-panel relative flex flex-col gap-4 p-8 rounded-2xl border border-border/40 overflow-hidden"
              >
                <span className="text-7xl font-black text-primary/10 leading-none font-[var(--font-display)]">
                  {step.num}
                </span>
                <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-black text-primary">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-xl font-bold -mt-2 font-[var(--font-display)] text-foreground tracking-wide">
                  {step.title}
                </h3>
                <p className="text-[11px] font-bold text-muted-foreground leading-relaxed uppercase">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
}
