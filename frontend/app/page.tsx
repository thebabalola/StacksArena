"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Trophy, Ticket, Layers, Zap, Shield, Star, ChevronRight, Users, DollarSign, Award, Package, Swords } from "lucide-react";
import { HeroIllustration } from "./components/hero-illustration";
import { useStacks } from "@/lib/hooks/use-stacks";

function Counter({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let n = 0;
    const step = target / 80;
    const timer = setInterval(() => {
      n = Math.min(n + step, target);
      setCount(Math.floor(n));
      if (n >= target) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

const features = [
  { icon: Trophy, colorClass: "text-primary", bgClass: "bg-primary/10", title: "Tournament Arena", sub: "Compete & Win", desc: "Enter skill-based weekly tournaments with STX entry fees. Top players split the entire prize pool, tracked and distributed automatically on-chain.", href: "/arena", stat: "148 Completed" },
  { icon: Ticket, colorClass: "text-companion", bgClass: "bg-companion/10", title: "Lottery Pool", sub: "Spin & Jackpot", desc: "Buy provably fair lottery tickets. One lucky winner claims the entire jackpot. Randomness derived from Bitcoin block hashes — no admin override possible.", href: "/lottery", stat: "847K STX Paid" },
  { icon: Layers, colorClass: "text-primary", bgClass: "bg-primary/10", title: "Game Assets", sub: "Collect & Trade", desc: "Mint rare on-chain game assets with XP, levels, and rarity tiers from Common to Legendary. Fuse assets to create legendary items. True ownership on Bitcoin.", href: "/assets", stat: "12K+ Minted" },
];

const stats = [
  { icon: Users, label: "Active Players", target: 2400, suffix: "+" },
  { icon: DollarSign, label: "Total Prize Pool", prefix: "$", target: 847000 },
  { icon: Award, label: "Tournaments", target: 148 },
  { icon: Package, label: "Assets Minted", target: 12000, suffix: "+" },
];

const steps = [
  { num: "01", title: "Connect Wallet", desc: "Link your Stacks wallet (Leather or Xverse) with one click. Your identity is secured on Bitcoin." },
  { num: "02", title: "Join or Create", desc: "Enter an open tournament, buy lottery tickets, or mint your first game asset with STX." },
  { num: "03", title: "Compete & Earn", desc: "Win STX prizes from tournaments and lotteries. Level up your assets and trade with other players." },
];

export default function Home() {
  const { connect, isConnected } = useStacks();
  const featuresRef = useRef(null);
  const inView = useInView(featuresRef, { once: true, margin: "-80px" });

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0a0a1a] min-h-[95vh] flex items-center">
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#F97316 1px,transparent 1px),linear-gradient(90deg,#F97316 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        {/* Gradient orbs */}
        <div className="absolute top-[15%] left-[20%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] bg-companion/10 rounded-full blur-[100px] pointer-events-none" />
        {/* Diagonal line accents */}
        <svg className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.06] pointer-events-none" viewBox="0 0 600 600">
          <line x1="0" y1="600" x2="600" y2="0" stroke="#F97316" strokeWidth="1" />
          <line x1="100" y1="600" x2="600" y2="100" stroke="#8B5CF6" strokeWidth="0.5" />
          <line x1="200" y1="600" x2="600" y2="200" stroke="#F97316" strokeWidth="0.5" />
        </svg>

        <div className="relative mx-auto max-w-7xl px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          <div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-primary/10 border border-primary/25 mb-8 backdrop-blur-sm">
              <Swords className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary font-[var(--font-heading)]">Built on Bitcoin · Stacks L2</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
              className="text-6xl md:text-8xl font-black leading-[0.95] tracking-tight text-white mb-6 font-[var(--font-display)]">
              COMPETE.<br />
              <span className="text-primary text-glow animate-neon-flicker">WIN.</span><br />
              DOMINATE.
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="text-lg text-slate-400 leading-relaxed mb-10 max-w-lg">
              The premier Bitcoin-anchored gaming arena. Enter tournaments, win lottery jackpots, and collect rare on-chain game assets — secured by the world&apos;s most powerful blockchain.
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

          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.3 }}
            className="hidden lg:block">
            <HeroIllustration />
          </motion.div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-secondary/40 border-y border-border backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ icon: Icon, label, target, prefix, suffix }) => (
            <div key={label} className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-black font-[var(--font-display)] tracking-wider"><Counter target={target} prefix={prefix} suffix={suffix} /></p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{label}</p>
              </div>
            </div>
          ))}
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
              EVERYTHING YOU NEED TO<br />
              <span className="text-primary text-glow">GAME ON BITCOIN.</span>
            </motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div key={feat.href} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.15 * i + 0.2 }}>
                  <Link href={feat.href} className="group flex flex-col h-full p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:-translate-y-2 transition-all duration-300 cursor-pointer hover:shadow-[0_0_40px_rgba(249,115,22,0.08)]">
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
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 10px,white 10px,white 11px)" }} />
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
