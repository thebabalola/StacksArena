"use client";

import { motion } from "framer-motion";
import { Trophy, Users, Clock, Zap } from "lucide-react";
import { useStacks } from "@/lib/hooks/use-stacks";

const TOURNAMENTS = [
  { id: 1, name: "Bitcoin Blitz #12", entryFee: 25, prizePool: 750, players: 24, maxPlayers: 32, status: "ACTIVE", endsIn: "2h 15m" },
  { id: 2, name: "Shield Masters Cup", entryFee: 50, prizePool: 1600, players: 32, maxPlayers: 32, status: "ACTIVE", endsIn: "48m" },
  { id: 3, name: "Midnight Arena", entryFee: 10, prizePool: 180, players: 18, maxPlayers: 20, status: "ACTIVE", endsIn: "5h 30m" },
  { id: 4, name: "Stacks Grand Prix", entryFee: 100, prizePool: 4200, players: 42, maxPlayers: 50, status: "ACTIVE", endsIn: "22h" },
  { id: 5, name: "Rookie Rumble #5", entryFee: 5, prizePool: 95, players: 20, maxPlayers: 20, status: "ENDED", endsIn: "-" },
  { id: 6, name: "Pro League Season 3", entryFee: 200, prizePool: 12000, players: 60, maxPlayers: 60, status: "ENDED", endsIn: "-" },
];

export default function ArenaPage() {
  const { connect, isConnected } = useStacks();
  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-black mb-2">Tournament <span className="text-primary">Arena</span></h1>
          <p className="text-muted-foreground">Compete in on-chain skill tournaments. Top players win STX from the prize pool.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TOURNAMENTS.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="p-6 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${t.status === "ACTIVE" ? "bg-green-500/15 text-green-500" : "bg-muted text-muted-foreground"}`}>
                  {t.status}
                </span>
              </div>
              <h3 className="font-bold mb-3">{t.name}</h3>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Players</span>
                  <span className="font-medium">{t.players}/{t.maxPlayers}</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(t.players / t.maxPlayers) * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <span className="text-muted-foreground">Entry Fee</span>
                  <span className="font-bold text-primary">{t.entryFee} STX</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Prize Pool</span>
                  <span className="font-bold">{t.prizePool.toLocaleString()} STX</span>
                </div>
                {t.status === "ACTIVE" && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Ends in</span>
                    <span className="font-medium text-orange-400">{t.endsIn}</span>
                  </div>
                )}
              </div>
              {t.status === "ACTIVE" && (
                <button onClick={!isConnected ? connect : undefined}
                  className="mt-4 w-full py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1">
                  <Zap className="w-3.5 h-3.5" />{isConnected ? "Join Tournament" : "Connect to Join"}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
