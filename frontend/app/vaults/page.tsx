"use client";

import { VaultListSkeleton } from "@/components/ArenaSkeletons";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Lock,
  Zap,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Unlock,
  AlertTriangle,
  Clock,
  History,
  KeyRound,
  Info as InfoIcon,
} from "lucide-react";
import { useStacks } from "@/lib/hooks/use-stacks";
import { useCommitVault, useVaultFactory } from "@/lib/hooks/use-contract";
import { useBlockHeight } from "@/lib/hooks/use-block-height";
import Link from "next/link";

interface Vault {
  id: number;
  owner: string;
  balance: number;
  lockStart: number;
  targetBlock: number;
  penaltyRate: number;
  threshold: number;
  approvalCount: number;
  isActive: boolean;
  token: string | null;
  totalMilestones: number;
  currentMilestone: number;
  timeRemaining: number; // In blocks
}

export default function VaultsPage() {
  const { connect, isConnected, stxAddress } = useStacks();
  const { getVaultDetails, withdraw, approveVault, releaseMilestone, loading } =
    useCommitVault();
  const { getProtocolStats } = useVaultFactory();
  const { blockHeight } = useBlockHeight();

  const [vaults, setVaults] = useState<Vault[]>([]);
  const [fetching, setFetching] = useState(true);

  const fetchVaults = useCallback(async () => {
    if (!stxAddress) return;
    setFetching(true);
    try {
      const statsRes = await getProtocolStats();
      const s = statsRes?.value;
      const totalVaults = Number(s?.["total-vaults"]?.value ?? 0);

      const list: Vault[] = [];
      const startIdx = Math.max(0, totalVaults - 150);

      for (let i = totalVaults - 1; i >= startIdx; i--) {
        const v = await getVaultDetails(i);
        if (v?.value && v.value.value) {
          const val = v.value.value;
          const ownerAddress = val.owner?.value;
          
          if (ownerAddress === stxAddress && val["is-active"]?.value === true) {
            list.push({
              id: i,
              owner: ownerAddress,
              balance: Number(val.balance?.value ?? 0) / 1000000,
              lockStart: Number(val["lock-start"]?.value ?? 0),
              targetBlock: Number(val["target-block"]?.value ?? 0),
              penaltyRate: Number(val["penalty-rate"]?.value ?? 0),
              threshold: Number(val.threshold?.value ?? 1),
              approvalCount: Number(val["approval-count"]?.value ?? 0),
              isActive: val["is-active"]?.value ?? false,
              token: val.token?.value?.value || null,
              totalMilestones: Number(val["total-milestones"]?.value ?? 1),
              currentMilestone: Number(val["current-milestone"]?.value ?? 0),
              timeRemaining: Math.max(
                0,
                Number(val["target-block"]?.value ?? 0) - (blockHeight || 0),
              ),
            });
          }
        }
      }

      setVaults(list);
    } catch (e) {
      console.error("Failed to fetch vaults:", e);
    } finally {
      setFetching(false);
    }
  }, [getVaultDetails, getProtocolStats, stxAddress, blockHeight]);

  useEffect(() => {
    fetchVaults();
  }, [fetchVaults]);

  const handleWithdraw = async (vaultId: number, token: string | null) => {
    await withdraw(vaultId, token, () => fetchVaults());
  };

  const handleApprove = async (vaultId: number) => {
    await approveVault(vaultId, () => fetchVaults());
  };

  const handleReleaseMilestone = async (
    vaultId: number,
    token: string | null,
  ) => {
    await releaseMilestone(vaultId, token, () => fetchVaults());
  };

  return (
    <div className="min-h-screen px-6 pt-28 pb-28 sm:py-12 bg-background transition-colors duration-300">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-primary transition-colors mb-4 uppercase font-black tracking-widest"
            >
              <ArrowLeft className="w-3 h-3" /> Dashboard
            </Link>
            <h1 className="text-5xl font-black font-[var(--font-display)] uppercase italic tracking-tight">
              ACTIVE <span className="text-primary">LOCKS.</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
              Monitoring your Bitcoin-anchored commitments
            </p>
          </div>
          <button
            onClick={fetchVaults}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            <RefreshCw
              className={`w-3 h-3 ${fetching ? "animate-spin" : ""}`}
            />{" "}
            Refresh Data
          </button>
        </div>

        {!isConnected ? (
          <div className="text-center py-24 glass-panel rounded-3xl border border-white/5">
            <Lock className="w-16 h-16 mx-auto mb-6 text-slate-700 opacity-20" />
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter">
              AUTHENTICATION REQUIRED
            </h2>
            <button
              onClick={connect}
              className="px-10 py-4 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
            >
              Connect Stacks Wallet
            </button>
          </div>
        ) : fetching && vaults.length === 0 ? (
          <VaultListSkeleton />
        ) : vaults.length === 0 ? (
          <div className="text-center py-24 glass-panel rounded-3xl border border-white/5 bg-gradient-to-br from-companion/5 to-transparent">
            <History className="w-16 h-16 mx-auto mb-6 text-slate-700 opacity-20" />
            <p className="text-lg font-black text-slate-400 uppercase tracking-tighter">
              No active commitments found
            </p>
            <Link
              href="/create"
              className="mt-6 inline-block px-10 py-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
            >
              Establish Your First Lock
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vaults.map((vault, i) => (
              <motion.div
                key={vault.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card/40 backdrop-blur-md p-8 rounded-[2rem] border-2 border-border/60 relative overflow-hidden group hover:border-companion/40 transition-all shadow-xl"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-companion/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="w-14 h-14 rounded-[1.2rem] bg-companion/10 flex items-center justify-center border border-companion/20 shadow-inner">
                    <KeyRound className="w-7 h-7 text-companion drop-shadow-md" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Commitment ID
                    </p>
                    <p className="text-xl font-black text-foreground font-[var(--font-display)] tracking-tighter">
                      #{vault.id.toString().padStart(4, "0")}
                    </p>
                  </div>
                </div>

                <div className="space-y-6 relative z-10">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                      Committed Balance
                    </p>
                    <p className="text-4xl font-black text-foreground tracking-tighter drop-shadow-sm">
                      {vault.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}{" "}
                      <span className="text-companion text-2xl">STX</span>
                    </p>
                  </div>

                  <div className="space-y-3 bg-secondary/10 p-4 rounded-2xl border border-border/50">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground group/tooltip">
                      <div className="flex items-center gap-1.5 cursor-help">
                        <span>Lock Status</span>
                        <InfoIcon className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                        <div className="absolute invisible group-hover/tooltip:visible bg-card border border-border/50 text-foreground p-3 rounded-xl shadow-xl w-48 text-[10px] leading-relaxed -mt-20 z-50">
                          {vault.timeRemaining === 0 
                            ? "This lock has matured. You can withdraw your full balance with zero penalty."
                            : "Your assets are secured until the target block. Early withdrawal triggers the penalty rate."}
                        </div>
                      </div>
                      <span className={vault.timeRemaining === 0 ? "text-green-500" : "text-companion"}>
                        {vault.timeRemaining === 0 ? "MATURED" : "LOCKED"}
                      </span>
                    </div>
                    
                    <div className="h-2.5 bg-background rounded-full overflow-hidden border border-border/50 inset-shadow">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: vault.timeRemaining === 0 ? "100%" : "25%",
                        }}
                        className={`h-full ${vault.timeRemaining === 0 ? "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]" : "bg-companion shadow-[0_0_12px_rgba(139,92,246,0.6)]"}`}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          {vault.timeRemaining === 0
                            ? "Ready for withdrawal"
                            : `${vault.timeRemaining.toLocaleString()} blocks remaining`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {vault.totalMilestones > 1 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <span>Milestones</span>
                        <span>
                          {vault.currentMilestone} / {vault.totalMilestones}
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        {Array.from({ length: vault.totalMilestones }).map(
                          (_, idx) => (
                            <div
                              key={idx}
                              className={`h-1.5 flex-1 rounded-full ${idx < vault.currentMilestone ? "bg-companion shadow-sm" : "bg-border/50"}`}
                            />
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                        Exit Penalty
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {vault.penaltyRate}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                        Signers
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {vault.threshold} / {vault.threshold} required
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    {vault.timeRemaining > 0 && (
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                        <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-orange-500/80 leading-relaxed">
                          Force-withdrawing now will destroy{" "}
                          <span className="text-orange-500 font-black">{((vault.balance * vault.penaltyRate) / 100).toLocaleString(undefined, { maximumFractionDigits: 6 })} STX</span> 
                          {" "}as an early exit penalty.
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={() => handleWithdraw(vault.id, vault.token)}
                        disabled={loading || !vault.isActive}
                        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all ${
                          vault.timeRemaining === 0
                            ? "bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-green-500/25"
                            : "bg-background border border-border text-foreground hover:bg-secondary/50 hover:border-companion/30"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {vault.timeRemaining === 0 ? "Withdraw Assets" : "Force Withdraw (Take Penalty)"}
                      </button>

                      {vault.threshold > 1 && (
                        <button
                          onClick={() => handleApprove(vault.id)}
                          disabled={loading || !vault.isActive}
                          className="w-full py-4 rounded-2xl bg-companion/10 border border-companion/20 text-companion text-[11px] font-black uppercase tracking-widest hover:bg-companion/20 transition-all"
                        >
                          Approve Release ({vault.approvalCount}/{vault.threshold})
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
