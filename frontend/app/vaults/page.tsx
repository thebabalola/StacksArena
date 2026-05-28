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
} from "lucide-react";
import { useStacks } from "@/lib/hooks/use-stacks";
import { useCommitVault } from "@/lib/hooks/use-contract";
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
  const { blockHeight } = useBlockHeight();

  const [vaults, setVaults] = useState<Vault[]>([]);
  const [fetching, setFetching] = useState(true);

  const fetchVaults = useCallback(async () => {
    if (!stxAddress) return;
    setFetching(true);
    try {
      // In a real app, we'd fetch vault IDs from a user-specific list or factory
      // For MVP, we'll try to fetch the first few IDs or use placeholders
      const list: Vault[] = [];
      for (let i = 0; i < 10; i++) {
        const v = await getVaultDetails(i);
        if (v?.value) {
          const val = v.value;
          list.push({
            id: i,
            owner: val.owner?.value,
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
      setVaults(list);
    } catch (e) {
      console.error("Failed to fetch vaults:", e);
    } finally {
      setFetching(false);
    }
  }, [getVaultDetails, stxAddress]);

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
    <div className="min-h-screen px-6 py-12 bg-background transition-colors duration-300">
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
                className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-primary/30 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center border border-border/50 group-hover:bg-primary/10 transition-colors">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Vault ID
                    </p>
                    <p className="text-lg font-black text-foreground font-[var(--font-display)]">
                      #{vault.id.toString().padStart(4, "0")}
                    </p>
                  </div>
                </div>

                <div className="space-y-6 relative z-10">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Locked Balance
                    </p>
                    <p className="text-3xl font-black text-foreground tracking-tighter">
                      {vault.balance.toLocaleString()}{" "}
                      <span className="text-primary italic">STX</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Unlock Progress</span>
                      <span>
                        {vault.timeRemaining === 0 ? "100%" : "Locked"}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary/15 rounded-full overflow-hidden border border-border/50">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: vault.timeRemaining === 0 ? "100%" : "30%",
                        }}
                        className={`h-full ${vault.timeRemaining === 0 ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-primary shadow-[0_0_10px_rgba(249,115,22,0.5)]"}`}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                        {vault.timeRemaining === 0
                          ? "Unlocked"
                          : `${vault.timeRemaining} blocks until release`}
                      </span>
                    </div>
                  </div>

                  {vault.totalMilestones > 1 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Milestones</span>
                        <span>
                          {vault.currentMilestone} / {vault.totalMilestones}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: vault.totalMilestones }).map(
                          (_, idx) => (
                            <div
                              key={idx}
                              className={`h-1 flex-1 rounded-full ${idx < vault.currentMilestone ? "bg-primary" : "bg-white/5"}`}
                            />
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                        Penalty
                      </p>
                      <p className="text-xs font-bold text-white">
                        {vault.penaltyRate}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                        Approvals
                      </p>
                      <p className="text-xs font-bold text-white">
                        {vault.threshold} Signer{vault.threshold > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleWithdraw(vault.id, vault.token)}
                      disabled={loading || !vault.isActive}
                      className={`py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                        vault.timeRemaining === 0
                          ? "bg-green-500 text-white hover:bg-green-600 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                          : "bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {vault.timeRemaining === 0 ? "Withdraw" : "Penalty Exit"}
                    </button>

                    {vault.threshold > 1 && (
                      <button
                        onClick={() => handleApprove(vault.id)}
                        disabled={loading || !vault.isActive}
                        className="py-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
                      >
                        Approve ({vault.approvalCount}/{vault.threshold})
                      </button>
                    )}

                    {vault.totalMilestones > 1 &&
                      vault.currentMilestone < vault.totalMilestones && (
                        <button
                          onClick={() =>
                            handleReleaseMilestone(vault.id, vault.token)
                          }
                          disabled={loading || !vault.isActive}
                          className="col-span-2 py-4 rounded-2xl bg-companion/10 border border-companion/20 text-companion text-[10px] font-black uppercase tracking-widest hover:bg-companion/20 transition-all"
                        >
                          Release Next Milestone
                        </button>
                      )}
                  </div>

                  {vault.timeRemaining > 0 && (
                    <div className="flex items-center gap-2 justify-center opacity-50">
                      <AlertTriangle className="w-3 h-3 text-orange-500" />
                      <span className="text-[9px] font-bold text-slate-600 uppercase italic">
                        Early exit will incur{" "}
                        {((vault.balance * vault.penaltyRate) / 100).toFixed(2)}{" "}
                        STX penalty
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
