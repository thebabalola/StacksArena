"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Shield, Lock, Zap, Loader2, ArrowLeft, Info, Scale, Clock, Users, Wallet } from "lucide-react";
import { useStacks } from "@/lib/hooks/use-stacks";
import { useCommitVault } from "@/lib/hooks/use-contract";
import { useBalance } from "@/lib/hooks/use-balance";
import { useBlockHeight } from "@/lib/hooks/use-block-height";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateVaultPage() {
  const router = useRouter();
  const { connect, isConnected } = useStacks();
  const { createVault, loading } = useCommitVault();
  const { formattedSTX, rawMicroStx, isLoading: balanceLoading } = useBalance();
  const { blockHeight } = useBlockHeight();

  const [formData, setFormData] = useState({
    amountSTX: "",
    targetBlockOffset: 144, // ~1 day
    penaltyRate: 10,
    threshold: 1,
  });

  // Live conversion: STX display <-> microSTX
  const amountMicroStx = useMemo(() => {
    const val = parseFloat(formData.amountSTX);
    if (isNaN(val) || val <= 0) return 0n;
    return BigInt(Math.round(val * 1_000_000));
  }, [formData.amountSTX]);

  const amountInSTX = useMemo(() => {
    if (!amountMicroStx) return "0";
    return (Number(amountMicroStx) / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 });
  }, [amountMicroStx]);

  const exceedsBalance = amountMicroStx > rawMicroStx && rawMicroStx > 0n;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      connect();
      return;
    }

    if (!amountMicroStx || amountMicroStx <= 0n) return;
    
    // Calculate real target block from current block + user offset
    const targetBlock = (blockHeight || 0) + formData.targetBlockOffset;

    await createVault(
      Number(amountMicroStx),
      targetBlock,
      formData.penaltyRate,
      formData.threshold,
      (data) => {
        router.push("/vaults");
      }
    );
  };

  return (
    <div className="min-h-screen px-6 py-12 bg-[#050510]">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="flex items-center gap-2 text-xs text-slate-500 hover:text-primary transition-colors mb-8 uppercase font-black tracking-widest">
          <ArrowLeft className="w-3 h-3" /> Back to Dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl font-black mb-4 font-[var(--font-display)] uppercase italic">
            ESTABLISH <span className="text-primary">COMMITMENT.</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase text-sm tracking-wide">
            Define your lock conditions and secure your assets under Bitcoin-anchored rules.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8 glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 cyber-mesh opacity-10 pointer-events-none" />
              
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                    <Zap className="w-3 h-3 text-primary" /> Commitment Amount (STX)
                  </label>
                  {isConnected && (
                    <span className={`text-[10px] font-bold uppercase flex items-center gap-1 ${
                      balanceLoading ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      <Wallet className="w-3 h-3" />
                      Bal: {balanceLoading ? '...' : formattedSTX} STX
                    </span>
                  )}
                </div>
                <input 
                  type="number" 
                  step="any"
                  min="0.000001"
                  required 
                  value={formData.amountSTX} 
                  onChange={e => setFormData({...formData, amountSTX: e.target.value})}
                  placeholder="0.000123"
                  className={`w-full bg-white/[0.03] border rounded-2xl px-6 py-4 text-xl font-black text-white focus:border-primary outline-none transition-all placeholder:text-slate-700 ${
                    exceedsBalance ? 'border-red-500/60' : 'border-white/10'
                  }`}
                />
                {/* Live micro-unit conversion display */}
                <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                  <span className="text-slate-600">
                    = {amountMicroStx.toString()} microSTX
                  </span>
                  {exceedsBalance && (
                    <span className="text-red-400">Exceeds balance</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                    <Clock className="w-3 h-3 text-primary" /> Lock Duration (Blocks)
                  </label>
                  <input 
                    type="number" 
                    required 
                    value={formData.targetBlockOffset} 
                    onChange={e => setFormData({...formData, targetBlockOffset: Number(e.target.value)})}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-primary outline-none transition-all" 
                  />
                  <p className="text-[9px] text-slate-600 font-bold uppercase">~{(formData.targetBlockOffset / 144).toFixed(1)} Days until unlock</p>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                    <Scale className="w-3 h-3 text-primary" /> Early Access Penalty (%)
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    required 
                    value={formData.penaltyRate} 
                    onChange={e => setFormData({...formData, penaltyRate: Number(e.target.value)})}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-primary outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                  <Users className="w-3 h-3 text-primary" /> Multi-Sig Threshold (Signers)
                </label>
                <div className="flex items-center gap-4">
                  <input 
                    type="number" 
                    min="1"
                    required 
                    value={formData.threshold} 
                    onChange={e => setFormData({...formData, threshold: Number(e.target.value)})}
                    className="w-24 bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-primary outline-none transition-all" 
                  />
                  <p className="text-[10px] text-slate-500 font-bold leading-tight uppercase italic">Vault will require {formData.threshold} approval{formData.threshold > 1 ? 's' : ''} to execute release.</p>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 rounded-2xl bg-primary text-white text-sm font-black uppercase tracking-widest hover:bg-orange-500 transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(249,115,22,0.2)] active:scale-95"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                {isConnected ? "INITIATE LOCK" : "CONNECT TO COMMIT"}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                 <Info className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Protocol Rules</h3>
              <ul className="space-y-3">
                {[
                  "Immutable lock conditions",
                  "Enforced by Clarity VM",
                  "Direct Bitcoin settlement",
                  "No admin override"
                ].map(rule => (
                  <li key={rule} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-companion/5 to-transparent">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Security Notice</h3>
              <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">
                Assets are held in a non-custodial smart contract. Only the defined conditions can trigger a release.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
