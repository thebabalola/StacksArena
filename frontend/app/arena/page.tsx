"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Trophy, Users, Zap, Loader2, Sword, Target, Activity, Shield, ArrowRight } from "lucide-react";
import { useStacks } from "@/lib/hooks/use-stacks";
import { useTournament } from "@/lib/hooks/use-contract";
import Link from "next/link";

export default function ArenaDashboard() {
  const { stxAddress } = useStacks();
  const { getArenaStats } = useTournament();
  const [stats, setStats] = useState({ total: 0, totalPrize: 0, activePlayers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const arenaStats = await getArenaStats();
        if (arenaStats?.value?.value) {
          const v = arenaStats.value.value;
          setStats({
            total: Number(v["total-tournaments"]?.value ?? 0),
            totalPrize: Number(v["total-prize-pool"]?.value ?? 0),
            activePlayers: Number(v["total-players"]?.value ?? 0)
          });
        }
      } catch (e) {
        console.error("Failed to fetch dashboard stats:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [getArenaStats]);

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-black mb-2">Battle <span className="text-primary">Dashboard</span></h1>
          <p className="text-muted-foreground">Your central command for StacksArena combat operations.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard icon={Sword} label="Total Arenas" value={stats.total.toString()} sub="Global Competitions" color="text-primary" />
          <StatCard icon={Trophy} label="Prize Liquidity" value={`${(stats.totalPrize/1000000).toFixed(2)} STX`} sub="Total uSTX Distributed" color="text-yellow-500" />
          <StatCard icon={Users} label="Active Warriors" value={stats.activePlayers.toString()} sub="Registered Players" color="text-green-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <ActionLink href="/tournaments" title="Join Tournament" desc="Browse active arenas and compete for STX prizes." icon={Target} color="bg-primary/10 text-primary" />
              <ActionLink href="/assets" title="Manage Assets" desc="View your battle equipment and power-ups." icon={Shield} color="bg-companion/10 text-companion" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Trophy className="w-16 h-16 text-primary/20 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-black mb-3">Ready for Combat?</h3>
            <p className="text-sm text-muted-foreground mb-8 max-w-xs">
              Check out the latest tournaments and start your journey to the top of the leaderboard.
            </p>
            <Link href="/tournaments" className="px-8 py-3 rounded-xl bg-primary text-white text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20">
              Enter Tournament List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-3xl p-6 hover:border-primary/20 transition-all">
      <div className={`w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-6 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <h2 className="text-3xl font-black mb-2">{value}</h2>
      <p className="text-[10px] text-slate-500 font-medium">{sub}</p>
    </motion.div>
  );
}

function ActionLink({ href, title, desc, icon: Icon, color }: any) {
  return (
    <Link href={href} className="group flex items-center justify-between p-6 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold">{title}</h4>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
    </Link>
  );
}
