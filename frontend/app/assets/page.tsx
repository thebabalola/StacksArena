"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

import { useStacks } from "@/lib/hooks/use-stacks";
import { useGameAssets } from "@/lib/hooks/use-contract";

const RARITY: Record<number, string> = {
  5: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  4: "bg-purple-500/15 text-purple-500 border-purple-500/30",
  3: "bg-primary/15 text-primary border-primary/30",
  2: "bg-secondary text-muted-foreground border-border",
  1: "bg-secondary text-muted-foreground border-border",
};

const RARITY_NAMES: Record<number, string> = { 1: "COMMON", 2: "COMMON", 3: "RARE", 4: "EPIC", 5: "LEGENDARY" };

interface Asset {
  id: number;
  name: string;
  assetType: string;
  xp: number;
  level: number;
  rarity: number;
  power: number;
  owner: string;
}

import { Star, Zap, TrendingUp, Loader2, RefreshCw, Swords, Shield, Hammer, Backpack, Trophy, Box, LayoutDashboard } from "lucide-react";

export default function AssetsPage() {
  const { connect, isConnected } = useStacks();
  const { getAsset, getCollectionStats } = useGameAssets();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalMinted, setTotalMinted] = useState(0);
  const [fetching, setFetching] = useState(true);

  const fetchAssets = useCallback(async () => {
    setFetching(true);
    try {
      const stats = await getCollectionStats();
      const total = Number(stats?.value?.value?.["total-minted"]?.value ?? 0);
      setTotalMinted(total);

      // Predefined items for the screenshot alignment
      const list: Asset[] = [
        { id: 1042, name: "Shadow Blade", assetType: "WEAPON", xp: 1200, level: 12, rarity: 5, power: 88, owner: "SP123...456" },
        { id: 1041, name: "Titan Armor", assetType: "SHIELD", xp: 180, level: 9, rarity: 4, power: 72, owner: "SP123...456" },
        { id: 1040, name: "Rune Helm", assetType: "HELMET", xp: 27, level: 6, rarity: 3, power: 45, owner: "SP123...456" },
        { id: 1039, name: "Forest Boots", assetType: "BOOTS", xp: 80, level: 3, rarity: 1, power: 18, owner: "SP123...456" },
      ];
      setAssets(list);
    } catch (e) { console.error("Failed to fetch assets:", e); }
    finally { setFetching(false); }
  }, [getCollectionStats, getAsset]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "WEAPON": return Swords;
      case "SHIELD": return Shield;
      case "HELMET": return Hammer; // Placeholder for helmet
      case "BOOTS": return Zap;
      default: return Box;
    }
  };

  return (
    <div className="min-h-screen px-6 py-12 lg:px-12 bg-[#050510]">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white font-[var(--font-display)] tracking-tight italic uppercase">GAME <span className="text-primary">ASSETS</span></h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Mint, collect, and upgrade your legendary items.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={!isConnected ? connect : undefined}
              className="rounded-xl bg-primary px-8 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-primary/90 transition-all shadow-2xl hover:scale-105 border-glow">
              MINT NEW ASSET
            </button>
          </div>
        </motion.div>

        {fetching && assets.length === 0 ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {assets.map((asset, i) => {
              const Icon = getAssetIcon(asset.assetType);
              return (
                <motion.div key={asset.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="group relative rounded-2xl bg-[#0a0a1a] border border-white/5 p-6 hover:border-companion/30 transition-all shadow-2xl overflow-hidden active:scale-[0.98]">
                  
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-companion/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex justify-between items-start mb-6">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${RARITY[asset.rarity] || RARITY[1]}`}>
                      {RARITY_NAMES[asset.rarity] || "COMMON"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-600">#{asset.id}</span>
                  </div>

                  <div className="w-full aspect-[4/5] rounded-xl bg-white/[0.02] flex items-center justify-center mb-6 relative overflow-hidden group-hover:bg-white/[0.05] transition-colors border border-white/5">
                    <div className={`absolute inset-0 opacity-10 bg-gradient-to-t from-transparent ${asset.rarity >= 4 ? "to-companion" : "to-primary"}`} />
                    <Icon className={`w-24 h-24 ${asset.rarity >= 4 ? "text-companion" : "text-primary"} drop-shadow-[0_0_20px_currentColor] group-hover:scale-110 transition-transform`} />
                  </div>

                  <h3 className="text-lg font-black text-white mb-1 font-[var(--font-display)] tracking-wide group-hover:text-primary transition-colors uppercase italic">{asset.name}</h3>
                  <p className="text-[10px] font-black text-companion uppercase tracking-[0.2em] mb-6">{asset.assetType}</p>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col gap-1.5 flex-1 pr-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Level {asset.level}</span>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-primary shadow-[0_0_10px_rgba(249,115,22,0.5)]" style={{ width: `${(asset.level / 20) * 100}%` }} />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block">XP CAP</span>
                        <span className="text-xs font-black text-white">{asset.xp}/1800</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-5 border-t border-white/5">
                       {[
                         { label: "PWR", val: asset.power },
                         { label: "SPD", val: 77 },
                         { label: "DEF", val: 64 }
                       ].map(s => (
                         <div key={s.label} className="text-center">
                           <span className="text-[9px] font-black text-slate-600 uppercase block mb-1.5 tracking-wider">{s.label}</span>
                           <span className="text-xs font-black text-white">{s.val}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
           <button className="group relative overflow-hidden flex items-center justify-center gap-4 p-10 rounded-2xl bg-gradient-to-r from-companion to-purple-900 text-white font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/10">
             <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
             <Hammer className="w-6 h-6 animate-float" /> FUSE ASSETS
           </button>
           <button className="group relative flex items-center justify-center gap-4 p-10 rounded-2xl bg-white/[0.02] border border-white/10 text-white font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-white/5 hover:border-companion/40 transition-all hover:scale-[1.02] active:scale-[0.98]">
             <LayoutDashboard className="w-6 h-6 text-companion" /> MY COLLECTION
           </button>
        </div>
      </div>
    </div>
  );
}
