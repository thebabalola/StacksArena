"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Trophy, Ticket, Layers, Zap, Shield, Star, ChevronRight, Users, DollarSign, Award, Package } from "lucide-react";
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
      <section className="relative overflow-hidden bg-[#0F172A] min-h-[92vh] flex items-center">
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "linear-gradient(#F97316 1px,transparent 1px),linear-gradient(90deg,#F97316 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-companion/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30 mb-6">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Built on Bitcoin · Stacks L2</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight text-white mb-6">
              Compete.<br />Win.<br /><span className="text-primary">Dominate.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-lg text-slate-300 leading-relaxed mb-8 max-w-lg">
              The premier Bitcoin-anchored gaming arena. Enter tournaments, win lottery jackpots, and collect rare on-chain game assets — secured by the world&apos;s most powerful blockchain.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-4">
              {isConnected ? (
                <Link href="/arena" className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white hover:bg-primary/90 shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95">
                  Enter Arena <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button onClick={connect} className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white hover:bg-primary/90 shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95">
                  Connect &amp; Play <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <Link href="/assets" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-all">
                View Assets <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="flex items-center gap-6 mt-10">
              {[{ icon: Shield, label: "Bitcoin Secured" }, { icon: Zap, label: "Instant Settlement" }, { icon: Star, label: "Provably Fair" }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-slate-400">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <HeroIllustration />
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-secondary/50 border-y border-border">
        <div className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ icon: Icon, label, target, prefix, suffix }) => (
            <div key={label} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-black"><Counter target={target} prefix={prefix} suffix={suffix} /></p>
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section ref={featuresRef} className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <motion.p initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              className="text-sm font-bold uppercase tracking-widest text-primary mb-3">Platform Features</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-black tracking-tight">
              Everything you need to<br /><span className="text-primary">game on Bitcoin.</span>
            </motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div key={feat.href} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 * i + 0.2 }}>
                  <Link href={feat.href} className="group flex flex-col h-full p-8 rounded-3xl border border-border bg-card hover:border-primary/40 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer">
                    <div className={`w-14 h-14 ${feat.bgClass} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${feat.colorClass}`} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{feat.sub}</p>
                    <h3 className="text-xl font-black mb-3 group-hover:text-primary transition-colors">{feat.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">{feat.desc}</p>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{feat.stat}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 bg-secondary/30">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest text-primary mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-black">Three steps to start<br />earning on Bitcoin.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="flex flex-col gap-4 p-6 rounded-2xl bg-card border border-border">
                <span className="text-5xl font-black text-primary/20 leading-none">{step.num}</span>
                <h3 className="text-lg font-bold -mt-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-primary p-12 text-center shadow-2xl shadow-primary/30">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle at 20% 50%,white 1px,transparent 1px),radial-gradient(circle at 80% 50%,white 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
            <h2 className="relative text-3xl md:text-4xl font-black text-white mb-4">Ready to Enter the Arena?</h2>
            <p className="relative text-white/80 mb-8 max-w-md mx-auto">Connect your Stacks wallet and start competing for Bitcoin-backed prizes today.</p>
            <button onClick={connect} className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-black text-primary hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-lg">
              Connect Wallet <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
