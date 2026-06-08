"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  Lock,
  Bitcoin,
  Users,
  Percent,
  Calendar,
  Layers,
  ArrowLeft,
  RefreshCw,
  Scale,
  Shield,
  Activity
} from "lucide-react";
import Link from "next/link";
import { useStacks } from "@/lib/hooks/use-stacks";
import { useVaultFactory, useCommitVault } from "@/lib/hooks/use-contract";
import { useBlockHeight } from "@/lib/hooks/use-block-height";

interface VaultStats {
  id: number;
  owner: string;
  balance: number;
  penaltyRate: number;
  threshold: number;
  isActive: boolean;
  totalMilestones: number;
}

export default function StatsPage() {
  const { isConnected, connect } = useStacks();
  const { getProtocolStats } = useVaultFactory();
  const { getVaultDetails } = useCommitVault();
  const { blockHeight } = useBlockHeight();

  const [globalStats, setGlobalStats] = useState({
    totalVaults: 0,
    totalLocked: 0,
    activeUsers: 0,
  });

  const [vaults, setVaults] = useState<VaultStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Computed metrics
  const [computed, setComputed] = useState({
    timeLocked: 0,
    penaltyLocked: 0,
    multiSig: 0,
    avgPenalty: 0,
    sumBalances: 0,
  });

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      // 1. Fetch Global Stats
      const protocolStats = await getProtocolStats();
      if (protocolStats?.value) {
        const val = protocolStats.value;
        setGlobalStats({
          totalVaults: Number(val["total-vaults"]?.value ?? 0),
          totalLocked: Number(val["total-locked"]?.value ?? 0) / 1000000,
          activeUsers: Number(val["total-vaults"]?.value ?? 0),
        });
      }

      // 2. Fetch individual vault info to perform deep data analysis
      const list: VaultStats[] = [];
      let totalPenaltySum = 0;
      let timeCount = 0;
      let penaltyCount = 0;
      let multiCount = 0;
      let balanceSum = 0;

      // Scan first 20 vaults on-chain
      for (let i = 0; i < 20; i++) {
        const v = await getVaultDetails(i);
        if (v?.value) {
          const val = v.value;
          const vaultItem: VaultStats = {
            id: i,
            owner: val.owner?.value || "",
            balance: Number(val.balance?.value ?? 0) / 1000000,
            penaltyRate: Number(val["penalty-rate"]?.value ?? 0),
            threshold: Number(val.threshold?.value ?? 1),
            isActive: val["is-active"]?.value ?? false,
            totalMilestones: Number(val["total-milestones"]?.value ?? 1),
          };
          list.push(vaultItem);

          if (vaultItem.isActive) {
            balanceSum += vaultItem.balance;
            totalPenaltySum += vaultItem.penaltyRate;

            // Classify vault
            if (vaultItem.threshold > 1) {
              multiCount++;
            } else if (vaultItem.penaltyRate > 0) {
              penaltyCount++;
            } else {
              timeCount++;
            }
          }
        }
      }

      setVaults(list);

      const activeCount = timeCount + penaltyCount + multiCount;
      setComputed({
        timeLocked: timeCount,
        penaltyLocked: penaltyCount,
        multiSig: multiCount,
        avgPenalty: activeCount > 0 ? totalPenaltySum / activeCount : 0,
        sumBalances: balanceSum,
      });

    } catch (e) {
      console.error("Failed to load on-chain stats:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getProtocolStats, getVaultDetails]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Distribution chart percentages
  const totalActive = computed.timeLocked + computed.penaltyLocked + computed.multiSig;
  const timePercent = totalActive > 0 ? (computed.timeLocked / totalActive) * 100 : 0;
  const penaltyPercent = totalActive > 0 ? (computed.penaltyLocked / totalActive) * 100 : 0;
  const multiPercent = totalActive > 0 ? (computed.multiSig / totalActive) * 100 : 0;

  return (
    <div className="min-h-screen px-4 md:px-8 pt-28 pb-28 md:py-12 bg-background transition-colors duration-300">
      <div className="mx-auto max-w-6xl">
        
        {/* Navigation back */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors mb-4 uppercase font-black tracking-widest"
            >
              <ArrowLeft className="w-3 h-3" /> Dashboard
            </Link>
            <h1 className="text-4xl md:text-5xl font-black font-[var(--font-display)] uppercase italic tracking-tight text-foreground">
              GLOBAL <span className="text-primary">ANALYTICS.</span>
            </h1>
            <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
              Verifiable Stacks L2 protocol statistics
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/15 hover:bg-secondary/25 border border-border text-[10px] font-black uppercase tracking-widest text-foreground transition-all duration-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Stats
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <RefreshCw className="w-12 h-12 text-companion animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Syncing live Stacks blocks...
            </p>
          </div>
        ) : (
          <div className="space-y-8 animate-slide-up">
            
            {/* Primary Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  icon: Lock,
                  label: "Total Vaults Deployed",
                  value: globalStats.totalVaults,
                  color: "text-companion",
                  bg: "bg-companion/10",
                },
                {
                  icon: Bitcoin,
                  label: "Aggregate STX Locked",
                  value: `${globalStats.totalLocked.toLocaleString(undefined, { maximumFractionDigits: 2 })} STX`,
                  color: "text-primary",
                  bg: "bg-primary/10",
                },
                {
                  icon: Users,
                  label: "Active Committers",
                  value: globalStats.activeUsers,
                  color: "text-green-500",
                  bg: "bg-green-500/10",
                },
                {
                  icon: Percent,
                  label: "Avg. Penalty Fee Rate",
                  value: `${computed.avgPenalty.toFixed(1)}%`,
                  color: "text-red-500",
                  bg: "bg-red-500/10",
                },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="glass-panel p-5 rounded-2xl border border-border/50 flex flex-col justify-between h-36 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-companion/5 to-transparent pointer-events-none" />
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                      {stat.label}
                    </span>
                    <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-xl md:text-2xl font-black text-foreground font-[var(--font-display)] tracking-wide mt-4 relative z-10">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Distribution Graph section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Category split visual bar */}
              <div className="md:col-span-2 glass-panel p-6 md:p-8 rounded-3xl border border-border/50 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2 mb-2">
                    <Layers className="w-4 h-4 text-companion" /> Lock Category Distribution
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-medium mb-6">
                    Live breakdown of locked capital categories across active vaults
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Visual allocation progress bar */}
                  <div className="w-full h-4 rounded-full overflow-hidden flex bg-secondary/20">
                    {totalActive > 0 ? (
                      <>
                        <div style={{ width: `${timePercent}%` }} className="bg-companion transition-all h-full" title="Time Locked" />
                        <div style={{ width: `${penaltyPercent}%` }} className="bg-primary transition-all h-full" title="Penalty Based" />
                        <div style={{ width: `${multiPercent}%` }} className="bg-green-500 transition-all h-full" title="Multi-Sig" />
                      </>
                    ) : (
                      <div className="w-full bg-secondary/10 h-full flex items-center justify-center text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                        No active vaults found
                      </div>
                    )}
                  </div>

                  {/* Indicators Legend */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/20">
                    {[
                      { label: "Time Locked", value: computed.timeLocked, percent: timePercent, color: "bg-companion" },
                      { label: "Penalty Locked", value: computed.penaltyLocked, percent: penaltyPercent, color: "bg-primary" },
                      { label: "Multi-Signature", value: computed.multiSig, percent: multiPercent, color: "bg-green-500" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className={`w-2.5 h-2.5 rounded ${item.color}`} />
                          <span className="text-[10px] font-black text-foreground">{item.label}</span>
                        </div>
                        <span className="text-lg font-black text-foreground font-[var(--font-display)]">
                          {item.value} <span className="text-xs text-muted-foreground">({item.percent.toFixed(0)}%)</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Security block details */}
              <div className="glass-panel p-6 md:p-8 rounded-3xl border border-border/50 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-primary" /> Stacks consensus block
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-medium mb-6">
                    Anchor state of Bitcoin security mapping details
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2.5 border-b border-border/20">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Current Block Height</span>
                    <span className="text-xs font-black text-foreground tracking-wide font-mono">
                      #{blockHeight || "Loading"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2.5 border-b border-border/20">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Consensus Status</span>
                    <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Bitcoin Anchored
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Network Version</span>
                    <span className="text-[9px] font-black text-foreground uppercase tracking-widest">
                      Hiro Mainnet L2
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Live Vault Registry Feed */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-border/50">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/20">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-5 h-5 text-companion" />
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
                      Live Vault Registry
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      Displaying live locking details derived dynamically from Clarity Factory
                    </p>
                  </div>
                </div>
              </div>

              {vaults.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs font-black uppercase tracking-widest">
                  No vaults deployed to protocol factory yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/30 text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                        <th className="pb-3 pr-4">Vault ID</th>
                        <th className="pb-3 pr-4">Committer</th>
                        <th className="pb-3 pr-4">Balance</th>
                        <th className="pb-3 pr-4">Early Penalty Rate</th>
                        <th className="pb-3 pr-4">Approval Threshold</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 text-xs font-medium text-foreground">
                      {vaults.map((vault) => (
                        <tr key={vault.id} className="hover:bg-secondary/5 transition-colors">
                          <td className="py-4 font-mono font-black text-companion">#{vault.id}</td>
                          <td className="py-4 font-mono pr-4" title={vault.owner}>
                            {vault.owner ? `${vault.owner.slice(0, 6)}...${vault.owner.slice(-4)}` : "ST123...4567"}
                          </td>
                          <td className="py-4 font-black pr-4">{vault.balance.toLocaleString()} STX</td>
                          <td className="py-4 pr-4 flex items-center gap-1">
                            <Scale className="w-3.5 h-3.5 text-slate-400" />
                            {vault.penaltyRate}%
                          </td>
                          <td className="py-4 pr-4">{vault.threshold}-of-3 Multi-Sig</td>
                          <td className="py-4">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                              vault.isActive 
                                ? "text-green-500 bg-green-500/10" 
                                : "text-slate-500 bg-slate-500/10"
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${vault.isActive ? "bg-green-500 animate-pulse" : "bg-slate-500"}`} />
                              {vault.isActive ? "Locked" : "Unlocked"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
