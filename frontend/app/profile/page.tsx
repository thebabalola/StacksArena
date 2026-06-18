"use client";

import { useStacks } from "@/lib/hooks/use-stacks";
import { User, Wallet, Activity, History, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useCommitVault, useVaultFactory } from "@/lib/hooks/use-contract";

interface Vault {
  id: number;
  balance: number;
  penaltyRate: number;
  isActive: boolean;
}

export default function ProfilePage() {
  const { isConnected, stxAddress, connect } = useStacks();
  const { getVaultDetails } = useCommitVault();
  const { getProtocolStats } = useVaultFactory();

  const [inactiveVaults, setInactiveVaults] = useState<Vault[]>([]);
  const [fetching, setFetching] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchVaults = useCallback(async () => {
    if (!stxAddress) return;
    setFetching(true);
    try {
      const statsRes = await getProtocolStats();
      const s = statsRes?.value;
      const totalVaults = Number(s?.["total-vaults"]?.value ?? 0);

      const list: Vault[] = [];
      const startIdx = Math.max(0, totalVaults - 25);

      for (let i = totalVaults - 1; i >= startIdx; i--) {
        const v = await getVaultDetails(i);
        if (v?.value && v.value.value) {
          const val = v.value.value;
          const ownerAddress = val.owner?.value;
          
          if (ownerAddress === stxAddress && val["is-active"]?.value === false) {
            list.push({
              id: i,
              balance: Number(val.balance?.value ?? 0) / 1000000,
              penaltyRate: Number(val["penalty-rate"]?.value ?? 0),
              isActive: false,
            });
          }
        }
      }

      setInactiveVaults(list);
    } catch (e) {
      console.error("Failed to fetch inactive vaults:", e);
    } finally {
      setFetching(false);
    }
  }, [getVaultDetails, getProtocolStats, stxAddress]);

  useEffect(() => {
    if (isConnected) {
      fetchVaults();
    }
  }, [isConnected, fetchVaults]);

  return (
    <div className="min-h-screen px-6 pt-28 pb-28 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-black mb-10">Player <span className="text-primary">Profile</span></h1>

        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-border rounded-2xl bg-card">
            <Wallet className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-xl font-bold mb-2">Wallet Not Connected</h2>
            <p className="text-muted-foreground mb-6">Connect your Stacks wallet to view your profile and assets.</p>
            <button onClick={connect} className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 sm:p-8 rounded-2xl border border-border bg-card flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <div className="min-w-0 w-full">
                <h2 className="text-xl sm:text-2xl font-bold mb-1">PlayerOne</h2>
                <p className="text-muted-foreground font-mono bg-white/5 px-3 py-1.5 rounded-lg break-all text-xs inline-block max-w-full">{stxAddress}</p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl border border-border bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold">Activity Stats</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                    <span className="text-sm text-muted-foreground">Tournaments Played</span>
                    <span className="font-bold">0</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                    <span className="text-sm text-muted-foreground">Lottery Tickets</span>
                    <span className="font-bold">0</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                    <span className="text-sm text-muted-foreground">Assets Owned</span>
                    <span className="font-bold">0</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Inactive Vaults Accordion */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-border bg-card overflow-hidden">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold">Inactive Vaults History</h3>
                  <span className="bg-primary/20 text-primary text-xs font-black px-2 py-1 rounded-md">{inactiveVaults.length}</span>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
              </button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0 }} 
                    animate={{ height: "auto" }} 
                    exit={{ height: 0 }} 
                    className="overflow-hidden border-t border-border"
                  >
                    <div className="p-6">
                      {fetching ? (
                        <div className="flex items-center justify-center py-10 text-muted-foreground">
                          <RefreshCw className="w-6 h-6 animate-spin mr-3" />
                          <span className="text-sm font-bold uppercase tracking-widest">Fetching Vaults...</span>
                        </div>
                      ) : inactiveVaults.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground text-sm font-bold">
                          No inactive vaults found.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead>
                              <tr className="border-b border-border/50 text-muted-foreground uppercase tracking-widest text-[10px]">
                                <th className="pb-3 pr-4">Vault ID</th>
                                <th className="pb-3 pr-4">Withdrawn Amount</th>
                                <th className="pb-3 pr-4">Penalty Rate</th>
                                <th className="pb-3">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                              {inactiveVaults.map((vault) => (
                                <tr key={vault.id} className="hover:bg-white/5 transition-colors">
                                  <td className="py-4 font-mono font-black text-primary pr-4">#{vault.id.toString().padStart(4, "0")}</td>
                                  <td className="py-4 font-black pr-4">{vault.balance.toLocaleString()} STX</td>
                                  <td className="py-4 pr-4 text-muted-foreground">{vault.penaltyRate}%</td>
                                  <td className="py-4">
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full text-slate-500 bg-slate-500/10">
                                      Withdrawn
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

          </div>
        )}
      </div>
    </div>
  );
}
