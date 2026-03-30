"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Star, Zap, TrendingUp, Loader2, RefreshCw } from "lucide-react";
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

      const list: Asset[] = [];
      for (let i = Math.max(0, total - 8); i < total; i++) {
        const a = await getAsset(i);
        if (a?.value?.value) {
          const v = a.value.value;
          list.push({
            id: i,
            name: v.name?.value ?? `Asset #${i}`,
            assetType: v["asset-type"]?.value ?? "unknown",
            xp: Number(v.xp?.value ?? 0),
            level: Number(v.level?.value ?? 0),
            rarity: Number(v.rarity?.value ?? 1),
            power: Number(v.power?.value ?? 0),
            owner: v.owner?.value ?? "",
          });
        }
      }
      setAssets(list.reverse());
    } catch (e) { console.error("Failed to fetch assets:", e); }
    finally { setFetching(false); }
  }, [getCollectionStats, getAsset]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black mb-2">Game <span className="text-primary">Assets</span></h1>
            <p className="text-muted-foreground">{totalMinted} assets minted on-chain</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchAssets} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
              <RefreshCw className={`w-3 h-3 ${fetching ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button onClick={!isConnected ? connect : undefined}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
              {isConnected ? "Mint Asset" : "Connect to Mint"}
            </button>
          </div>
        </motion.div>

        {fetching && assets.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Star className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-bold">No assets minted yet</p>
            <p className="text-sm">Mint the first game asset to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {assets.map((asset, i) => (
              <motion.div key={asset.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="group p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
                <div className="w-full h-28 rounded-xl bg-secondary flex items-center justify-center mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 50% 50%,#F97316 0%,transparent 70%)" }} />
                  <Star className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                  <span className="absolute top-2 right-2 text-xs font-black text-primary/60">#{asset.id.toString().padStart(4, "0")}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${RARITY[asset.rarity] || RARITY[1]}`}>
                  {RARITY_NAMES[asset.rarity] || "COMMON"}
                </span>
                <h3 className="font-bold mt-2 mb-0.5">{asset.name}</h3>
                <p className="font-mono text-[10px] text-muted-foreground mb-3">{asset.assetType} · {asset.owner.slice(0, 12)}...</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1"><Zap className="w-3 h-3" /> Level</span>
                    <span className="font-bold">{asset.level}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3 h-3" /> XP</span>
                    <span className="font-bold">{asset.xp.toLocaleString()}</span>
                  </div>
                  <div className="mt-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1"><span>Power</span><span>{asset.power}</span></div>
                    <div className="h-1.5 bg-secondary rounded-full">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, asset.power)}%` }} />
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
