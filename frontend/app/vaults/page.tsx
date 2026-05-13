"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Shield, Lock, Zap, Loader2, RefreshCw, ArrowLeft, Unlock, AlertTriangle, Clock, History } from "lucide-react";
import { useStacks } from "@/lib/hooks/use-stacks";
import { useCommitVault } from "@/lib/hooks/use-contract";
import Link from "next/link";

interface Vault {
  id: number;
  owner: string;
  balance: number;
  lockStart: number;
  targetBlock: number;
  penaltyRate: number;
  threshold: number;
  isActive: boolean;
  timeRemaining: number; // In blocks
}

export default function VaultsPage() {
  const { connect, isConnected, stxAddress } = useStacks();
  const { getVaultDetails, withdraw, loading } = useCommitVault();

  const [vaults, setVaults] = useState<Vault[]>([]);
  const [fetching, setFetching] = useState(true);

  const fetchVaults = useCallback(async () => {
    if (!stxAddress) return;
    setFetching(true);
    try {
      // In a real app, we'd fetch vault IDs from a user-specific list or factory
      // For MVP, we'll try to fetch the first few IDs or use placeholders
      const list: Vault[] = [];
      for (let i = 0; i < 3; i++) {
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
            isActive: val["is-active"]?.value ?? false,
            timeRemaining: Math.max(0, Number(val["target-block"]?.value ?? 0) - 1000000), // Placeholder block height
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

  useEffect(() => { fetchVaults(); }, [fetchVaults]);

  const handleWithdraw = async (vaultId: number) => {
    await withdraw(vaultId, () => fetchVaults());
  };

  return (
    <div className="min-h-screen px-6 py-12 bg-[#050510]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2 text-xs text-slate-500 hover:text-primary transition-colors mb-4 uppercase font-black tracking-widest">
              <ArrowLeft className="w-3 h-3" /> Dashboard
            </Link>
            <h1 className="text-5xl font-black font-[var(--font-display)] uppercase italic tracking-tight">
              ACTIVE <span className="text-primary">LOCKS.</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Monitoring your Bitcoin-anchored commitments</p>
          </div>
          <button onClick={fetchVaults} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            <RefreshCw className={`w-3 h-3 ${fetching ? "animate-spin" : ""}`} /> Refresh Data
          </button>
        </div>

        {!isConnected ? (
          <div className="text-center py-24 glass-panel rounded-3xl border border-white/5">
            <Lock className="w-16 h-16 mx-auto mb-6 text-slate-700 opacity-20" />
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter">AUTHENTICATION REQUIRED</h2>
            <button onClick={connect} className="px-10 py-4 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
              Connect Stacks Wallet
            </button>
          </div>
        ) : fetching && vaults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Syncing with Clarity VM...</p>
          </div>
        ) : vaults.length === 0 ? (
          <div className="text-center py-24 glass-panel rounded-3xl border border-white/5 bg-gradient-to-br from-companion/5 to-transparent">
            <History className="w-16 h-16 mx-auto mb-6 text-slate-700 opacity-20" />
            <p className="text-lg font-black text-slate-400 uppercase tracking-tighter">No active commitments found</p>
            <Link href="/create" className="mt-6 inline-block px-10 py-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-all">
              Establish Your First Lock
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vaults.map((vault, i) => (
              <motion.div key={vault.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-primary/30 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-primary/10 transition-colors">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vault ID</p>
                    <p className="text-lg font-black text-white font-[var(--font-display)]">#{vault.id.toString().padStart(4, '0')}</p>
                  </div>
                </div>

                <div className="space-y-6 relative z-10">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Locked Balance</p>
                    <p className="text-3xl font-black text-white tracking-tighter">{vault.balance.toLocaleString()} <span className="text-primary italic">STX</span></p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Unlock Progress</span>
                      <span>{vault.timeRemaining === 0 ? "100%" : "Locked"}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: vault.timeRemaining === 0 ? "100%" : "30%" }} 
                        className={`h-full ${vault.timeRemaining === 0 ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-primary shadow-[0_0_10px_rgba(249,115,22,0.5)]"}`} 
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{vault.timeRemaining} blocks remaining until release</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Penalty</p>
                      <p className="text-xs font-bold text-white">{vault.penaltyRate}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Approvals</p>
                      <p className="text-xs font-bold text-white">{vault.threshold} Signer{vault.threshold > 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleWithdraw(vault.id)}
                    disabled={loading || !vault.isActive}
                    className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${
                      vault.timeRemaining === 0 
                      ? "bg-green-500 text-white hover:bg-green-600 shadow-[0_0_20px_rgba(34,197,94,0.3)]" 
                      : "bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : vault.timeRemaining === 0 ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    {vault.timeRemaining === 0 ? "Withdraw Assets" : "Early Unlock (Penalty)"}
                  </button>
                  
                  {vault.timeRemaining > 0 && (
                    <div className="flex items-center gap-2 justify-center opacity-50">
                      <AlertTriangle className="w-3 h-3 text-orange-500" />
                      <span className="text-[9px] font-bold text-slate-600 uppercase italic">Early exit will incur {((vault.balance * vault.penaltyRate) / 100).toFixed(2)} STX penalty</span>
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
