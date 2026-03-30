"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Trophy, Ticket, Layers, Zap, Shield, Star, ChevronRight, Users, DollarSign, Award, Package, Swords, RefreshCw } from "lucide-react";
import { useStacks } from "@/lib/hooks/use-stacks";
import { useTournament, useLottery, useGameAssets } from "@/lib/hooks/use-contract";
import { CONTRACTS } from "@/lib/constants/contracts";

function Counter({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let n = 0;
    const step = Math.max(1, target / 80);
    const timer = setInterval(() => {
      n = Math.min(n + step, target);
      setCount(Math.floor(n));
      if (n >= target) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

export default function Home() {
  const { connect, isConnected } = useStacks();
  const { getArenaStats } = useTournament();
  const { getPlatformStats } = useLottery();
  const { getCollectionStats } = useGameAssets();

  const [stats, setStats] = useState({
    tournaments: 0, lotteryRounds: 0, assetsMinted: 0,
    prizePool: 0, totalTickets: 0, totalPlayers: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [arena, lottery, collection] = await Promise.all([
        getArenaStats(), getPlatformStats(), getCollectionStats(),
      ]);
      setStats({
        tournaments: Number(arena?.value?.value?.["total-tournaments"]?.value ?? 0),
        lotteryRounds: Number(lottery?.value?.value?.["total-rounds"]?.value ?? 0),
        assetsMinted: Number(collection?.value?.value?.["total-minted"]?.value ?? 0),
        prizePool: Number(arena?.value?.value?.["total-prize-pool"]?.value ?? 0),
        totalTickets: Number(lottery?.value?.value?.["total-tickets-sold"]?.value ?? 0),
        totalPlayers: Number(arena?.value?.value?.["total-players"]?.value ?? 0),
      });
    } catch (e) { console.error("Failed to fetch stats:", e); }
    finally { setLoading(false); }
  }, [getArenaStats, getPlatformStats, getCollectionStats]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const features = [
    { icon: Trophy, colorClass: "text-primary", title: "Tournament Arena", sub: "Compete & Win", desc: "Enter skill-based tournaments with STX entry fees. Top players split the entire prize pool, tracked and distributed automatically on-chain.", href: "/arena", stat: `${stats.tournaments} Created` },
    { icon: Ticket, colorClass: "text-companion", title: "Lottery Pool", sub: "Spin & Jackpot", desc: "Buy lottery tickets. One lucky winner claims the entire jackpot. Randomness derived from Bitcoin block hashes.", href: "/lottery", stat: `${stats.lotteryRounds} Rounds` },
    { icon: Layers, colorClass: "text-primary", title: "Game Assets", sub: "Collect & Trade", desc: "Mint rare on-chain game assets with XP, levels, and rarity tiers. Fuse assets to create legendary items.", href: "/assets", stat: `${stats.assetsMinted} Minted` },
  ];

  const onChainStats = [
    { icon: Users, label: "Total Players", target: stats.totalPlayers, suffix: "" },
    { icon: DollarSign, label: "Total Prize Pool", prefix: "", target: stats.prizePool, suffix: " uSTX" },
    { icon: Award, label: "Tournaments", target: stats.tournaments },
    { icon: Package, label: "Assets Minted", target: stats.assetsMinted },
  ];

  const steps = [
    { num: "01", title: "Connect Wallet", desc: "Link your Stacks wallet (Leather or Xverse) with one click. Your identity is secured on Bitcoin." },
    { num: "02", title: "Join or Create", desc: "Enter an open tournament, buy lottery tickets, or mint your first game asset with STX." },
    { num: "03", title: "Compete & Earn", desc: "Win STX prizes from tournaments and lotteries. Level up your assets and trade with other players." },
  ];

  const featuresRef = useRef(null);
  const inView = useInView(featuresRef, { once: true, margin: "-80px" });

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0a0a1a] min-h-[95vh] flex items-center">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#F97316 1px,transparent 1px),linear-gradient(90deg,#F97316 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-[15%] left-[20%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] bg-companion/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 flex flex-col items-center justify-center text-center w-full">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-primary/10 border border-primary/25 mb-8 backdrop-blur-sm">
              <Swords className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary font-[var(--font-heading)]">Built on Bitcoin · Stacks L2</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
              className="text-6xl md:text-8xl font-black leading-[0.95] tracking-tight text-white mb-6 font-[var(--font-display)]">
              COMPETE.<br /><span className="text-primary text-glow animate-neon-flicker">WIN.</span><br />DOMINATE.
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="text-lg text-slate-400 leading-relaxed mb-10 max-w-lg">
              The Bitcoin-anchored gaming arena. Enter tournaments, win lottery jackpots, and collect rare on-chain game assets.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="flex flex-wrap items-center gap-4">
              {isConnected ? (
                <Link href="/arena" className="group inline-flex items-center gap-3 rounded-lg bg-primary px-8 py-4 text-sm font-bold text-white hover:bg-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all hover:scale-105 active:scale-95 border-glow">
                  ENTER ARENA <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <button onClick={connect} className="group inline-flex items-center gap-3 rounded-lg bg-primary px-8 py-4 text-sm font-bold text-white hover:bg-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all hover:scale-105 active:scale-95 border-glow">
                  CONNECT &amp; PLAY <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              <Link href="/assets" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-8 py-4 text-sm font-bold text-white/80 hover:bg-white/5 hover:border-white/20 transition-all">
                VIEW ASSETS <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              className="flex items-center gap-8 mt-12 pt-8 border-t border-white/5">
              {[{ icon: Shield, label: "Bitcoin Secured" }, { icon: Zap, label: "Instant Settlement" }, { icon: Star, label: "Provably Fair" }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-slate-500">
                  <Icon className="w-4 h-4 text-primary/70" />
                  <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS BAR — Real on-chain data */}
      <section className="bg-secondary/40 border-y border-border backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Live On-Chain Stats</p>
            <button onClick={fetchStats} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {onChainStats.map(({ icon: Icon, label, target, prefix, suffix }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-black font-[var(--font-display)] tracking-wider">
                    {loading ? "..." : <Counter target={target} prefix={prefix} suffix={suffix} />}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{label}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 text-center">Contract: {CONTRACTS.TOURNAMENT_MANAGER.slice(0, 28)}...</p>
        </div>
      </section>

      {/* FEATURES */}
      <section ref={featuresRef} className="py-28 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <motion.p initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">Platform Features</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black tracking-tight font-[var(--font-display)]">
              EVERYTHING YOU NEED TO<br /><span className="text-primary text-glow">GAME ON BITCOIN.</span>
            </motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div key={feat.href} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.15 * i + 0.2 }}>
                  <Link href={feat.href} className="group flex flex-col h-full p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-companion/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                      <Icon className={`w-6 h-6 ${feat.colorClass}`} />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-companion mb-2">{feat.sub}</p>
                    <h3 className="text-2xl font-black mb-3 group-hover:text-primary transition-colors font-[var(--font-display)] tracking-wide">{feat.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">{feat.desc}</p>
                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/50">
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-md uppercase tracking-wider">{feat.stat}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-2 transition-all" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 bg-secondary/20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">How It Works</p>
            <h2 className="text-3xl md:text-5xl font-black font-[var(--font-display)] tracking-wide">THREE STEPS TO START<br />EARNING ON BITCOIN.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative flex flex-col gap-4 p-8 rounded-2xl bg-card/50 border border-border backdrop-blur-sm overflow-hidden">
                <span className="text-7xl font-black text-primary/10 leading-none font-[var(--font-display)]">{step.num}</span>
                <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-black text-primary">{i + 1}</span>
                </div>
                <h3 className="text-xl font-bold -mt-2 font-[var(--font-display)] tracking-wide">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-orange-500 to-primary p-14 text-center shadow-[0_0_60px_rgba(249,115,22,0.25)]">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 10px,white 10px,white 11px)" }} />
            <h2 className="relative text-4xl md:text-5xl font-black text-white mb-5 font-[var(--font-display)] tracking-wide">READY TO ENTER THE ARENA?</h2>
            <p className="relative text-white/80 mb-10 max-w-lg mx-auto text-lg">Connect your Stacks wallet and start competing for Bitcoin-backed prizes today.</p>
            <button onClick={connect} className="group inline-flex items-center gap-3 rounded-lg bg-white px-10 py-4 text-sm font-black text-primary hover:bg-white/95 transition-all hover:scale-105 active:scale-95 shadow-lg uppercase tracking-wider">
              Connect Wallet <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
