"use client";

import { motion } from "framer-motion";
import { Star, Zap, TrendingUp } from "lucide-react";
import { useStacks } from "@/lib/hooks/use-stacks";

const RARITY: Record<string, string> = {
  LEGENDARY: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  EPIC: "bg-companion/15 text-companion border-companion/30",
  RARE: "bg-primary/15 text-primary border-primary/30",
  COMMON: "bg-secondary text-muted-foreground border-border",
};

const ASSETS = [
  { id: 1, name: "Obsidian Shield", xp: 9420, level: 12, rarity: "LEGENDARY", owner: "SP1A...3K9X", power: 94 },
  { id: 2, name: "Void Runner", xp: 7180, level: 9, rarity: "EPIC", owner: "SP7F...2NM4", power: 78 },
  { id: 3, name: "Flame Gauntlet", xp: 5240, level: 7, rarity: "EPIC", owner: "SP3X...K2M1", power: 66 },
  { id: 4, name: "Storm Blade", xp: 3150, level: 5, rarity: "RARE", owner: "SP9Q...8VT2", power: 52 },
  { id: 5, name: "Iron Sigil", xp: 1820, level: 3, rarity: "RARE", owner: "SP2R...4FL9", power: 38 },
  { id: 6, name: "Ember Staff", xp: 960, level: 2, rarity: "COMMON", owner: "SP5M...1JD7", power: 24 },
  { id: 7, name: "Shadow Orb", xp: 6700, level: 8, rarity: "EPIC", owner: "SP8K...5PT3", power: 72 },
  { id: 8, name: "Bronze Charm", xp: 420, level: 1, rarity: "COMMON", owner: "SP4L...9RC6", power: 15 },
];

export default function AssetsPage() {
  const { connect, isConnected } = useStacks();
  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black mb-2">Game <span className="text-primary">Assets</span></h1>
            <p className="text-muted-foreground">Rare on-chain items with XP, levels, and rarity tiers. Truly owned on Bitcoin.</p>
          </div>
          <button onClick={!isConnected ? connect : undefined}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
            {isConnected ? "Mint Asset" : "Connect to Mint"}
          </button>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ASSETS.map((asset, i) => (
            <motion.div key={asset.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="group p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
              <div className="w-full h-28 rounded-xl bg-secondary flex items-center justify-center mb-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 50% 50%,#F97316 0%,transparent 70%)" }} />
                <Star className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                <span className="absolute top-2 right-2 text-xs font-black text-primary/60">#{asset.id.toString().padStart(4, "0")}</span>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${RARITY[asset.rarity]}`}>{asset.rarity}</span>
              <h3 className="font-bold mt-2 mb-0.5">{asset.name}</h3>
              <p className="font-mono text-[10px] text-muted-foreground mb-3">{asset.owner}</p>
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
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1"><span>Power</span><span>{asset.power}%</span></div>
                  <div className="h-1.5 bg-secondary rounded-full">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${asset.power}%` }} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
