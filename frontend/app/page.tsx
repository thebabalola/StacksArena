"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Trophy, Ticket, Layers, Zap, Shield, Star, ChevronRight, Users, DollarSign, Award, Package, Swords, RefreshCw, Bitcoin, Coins } from "lucide-react";
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

  const featureCards = [
    { icon: Trophy, colorClass: "text-primary", title: "TOURNAMENTS", desc: "Enter tournaments, compete, and climb the leaderboard.", href: "/arena" },
    { icon: Ticket, colorClass: "text-orange-500", title: "LOTTERY", desc: "Buy tickets and win big with provably fair randomness.", href: "/lottery" },
    { icon: Swords, colorClass: "text-companion", title: "GAME ASSETS", desc: "Mint, upgrade, fuse, and own unique game assets.", href: "/assets" },
  ];

  const steps = [
    { num: "01", title: "Connect Wallet", desc: "Link your Stacks wallet (Leather or Xverse) with one click." },
    { num: "02", title: "Join or Create", desc: "Enter an open tournament, buy lottery tickets, or mint your first asset." },
    { num: "03", title: "Compete & Earn", desc: "Win STX prizes and level up your assets on-chain." },
  ];

  return (
    <div className="min-h-screen bg-[#050510]">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden min-h-[95vh] flex items-center justify-center text-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#050510]/80 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-transparent z-10" />
          <img src="/stacksarena-heroimg.png" alt="Hero Background" className="w-full h-full object-cover opacity-70" />
        </div>

        <div className="relative z-20 w-full max-w-5xl px-6 pt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="flex flex-col items-center">
            
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
              className="text-6xl md:text-8xl font-black leading-[0.95] tracking-tight text-white mb-6 font-[var(--font-display)] uppercase">
              COMPETE.<br /><span className="text-primary text-glow animate-neon-flicker italic">WIN.</span><br />DOMINATE.
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="text-lg md:text-xl text-slate-300 font-bold leading-relaxed mb-10 max-w-2xl mx-auto">
              The Bitcoin-anchored gaming arena. Enter tournaments, win lottery jackpots, and collect rare on-chain game assets.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="flex flex-wrap items-center justify-center gap-4">
              {isConnected ? (
                <Link href="/arena" className="group inline-flex items-center gap-3 rounded-xl bg-primary px-10 py-5 text-sm font-black text-white hover:bg-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all hover:scale-105 active:scale-95 border-glow uppercase tracking-wide">
                  CONNECT &amp; PLAY <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <button onClick={connect} className="group inline-flex items-center gap-3 rounded-xl bg-primary px-10 py-5 text-sm font-black text-white hover:bg-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all hover:scale-105 active:scale-95 border-glow uppercase tracking-wide">
                  CONNECT &amp; PLAY <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              <Link href="/assets" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-10 py-5 text-sm font-black text-white/90 hover:bg-white/5 hover:border-white/20 transition-all uppercase tracking-wide bg-black/20 backdrop-blur-sm">
                VIEW ASSETS <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              className="flex items-center justify-center gap-6 md:gap-10 mt-12 pt-8 border-t border-white/10">
              {[{ icon: Shield, label: "Bitcoin Secured" }, { icon: Zap, label: "Instant Settlement" }, { icon: Star, label: "Provably Fair" }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-slate-400">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="relative z-30 -mt-16 w-full max-w-7xl mx-auto px-6 mb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
          className="w-full rounded-2xl bg-[#0a0a1a]/90 border border-white/5 p-6 md:p-10 backdrop-blur-2xl grid grid-cols-2 md:grid-cols-4 gap-8 shadow-2xl relative">
          <div className="absolute inset-0 cyber-mesh opacity-10 rounded-2xl pointer-events-none" />
          {[
            { icon: Users, label: "PLAYERS", target: 12400, suffix: "K+" },
            { icon: Trophy, label: "TOURNAMENTS", target: 3200, suffix: "+" },
            { icon: Bitcoin, label: "TOTAL PRIZES", target: 245.7, suffix: " BTC", prefix: "" },
            { icon: Swords, label: "ASSETS MINTED", target: 8700, suffix: "+" }
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-companion/10 flex items-center justify-center shrink-0">
                 <stat.icon className="w-5 h-5 text-companion" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-black text-white font-[var(--font-display)] tracking-wide">
                   {stat.prefix}<Counter target={stat.target} suffix={stat.suffix} />
                </p>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* FEATURE CARDS */}
      <section className="py-10 px-6">
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureCards.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div key={feat.title} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 * i + 0.5 }}>
                <Link href={feat.href} className="group relative block p-8 rounded-2xl bg-[#0a0a1a]/60 backdrop-blur-xl border border-white/5 hover:border-companion/40 transition-all hover:-translate-y-2 h-full shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-companion/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-6 relative z-10 border border-white/5">
                    <Icon className={`w-6 h-6 ${feat.colorClass} drop-shadow-[0_0_8px_currentColor]`} />
                  </div>
                  <h3 className="text-xs font-black text-white mb-3 tracking-widest font-[var(--font-display)] relative z-10 uppercase">{feat.title}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-bold relative z-10">{feat.desc}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 bg-[#0a0a1a]/40">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">How It Works</p>
            <h2 className="text-3xl md:text-5xl font-black font-[var(--font-display)] text-white tracking-wide uppercase">THREE STEPS TO START.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative flex flex-col gap-4 p-8 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm overflow-hidden">
                <span className="text-7xl font-black text-primary/10 leading-none font-[var(--font-display)]">{step.num}</span>
                <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-black text-primary">{i + 1}</span>
                </div>
                <h3 className="text-xl font-bold -mt-2 font-[var(--font-display)] text-white tracking-wide">{step.title}</h3>
                <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 mb-20">
        <div className="mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/20 via-companion/20 to-primary/20 p-1 lg:p-[1px]">
            <div className="bg-[#0a0a1a]/90 rounded-[23px] p-12 lg:p-20 text-center relative overflow-hidden">
               <div className="absolute inset-0 cyber-mesh opacity-20" />
               <h2 className="relative text-4xl md:text-6xl font-black text-white mb-6 font-[var(--font-display)] tracking-tighter uppercase italic">READY TO ENTER THE <span className="text-primary">ARENA?</span></h2>
               <p className="relative text-slate-400 mb-10 max-w-lg mx-auto text-lg font-bold">Connect your Stacks wallet and start competing for Bitcoin-backed prizes today.</p>
               <button onClick={connect} className="group relative overflow-hidden rounded-xl bg-primary px-10 py-5 text-sm font-black text-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(249,115,22,0.3)] uppercase tracking-widest border-glow">
                 <span className="relative z-10">Connect Arena Wallet</span>
                 <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
               </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
