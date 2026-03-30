"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Trophy, Users, Clock, Zap, Loader2, RefreshCw } from "lucide-react";
import { useStacks } from "@/lib/hooks/use-stacks";
import { useTournament } from "@/lib/hooks/use-contract";

interface Tournament {
  id: number;
  title: string;
  entryFee: number;
  prizePool: number;
  players: number;
  maxPlayers: number;
  status: string;
  timeRemaining: number;
}

export default function ArenaPage() {
  const { connect, isConnected } = useStacks();
  const { getTournament, getArenaStats, joinTournament, loading } = useTournament();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [stats, setStats] = useState({ total: 0, totalPrize: 0 });
  const [fetching, setFetching] = useState(true);

  const fetchTournaments = useCallback(async () => {
    setFetching(true);
    try {
      const arenaStats = await getArenaStats();
      const total = Number(arenaStats?.value?.value?.["total-tournaments"]?.value ?? 0);
      const totalPrize = Number(arenaStats?.value?.value?.["total-prize-pool"]?.value ?? 0);

      setStats({ total, totalPrize });

      // Fetch last 9 tournaments
      const list: Tournament[] = [];
      for (let i = Math.max(0, total - 9); i < total; i++) {
        const t = await getTournament(i);
        if (t?.value?.value) {
          const v = t.value.value;
          list.push({
            id: i,
            title: v.title?.value ?? `Tournament #${i}`,
            entryFee: Number(v["entry-fee"]?.value ?? 0),
            prizePool: Number(v["prize-pool"]?.value ?? 0),
            players: Number(v["current-players"]?.value ?? 0),
            maxPlayers: Number(v["max-players"]?.value ?? 0),
            status: Number(v.status?.value ?? 0) === 0 ? "ACTIVE" : Number(v.status?.value) === 1 ? "ENDED" : "CANCELLED",
            timeRemaining: Number(v["end-time"]?.value ?? 0),
          });
        }
      }
      setTournaments(list.reverse());
    } catch (e) {
      console.error("Failed to fetch tournaments:", e);
    } finally {
      setFetching(false);
    }
  }, [getArenaStats, getTournament]);

  useEffect(() => { fetchTournaments(); }, [fetchTournaments]);

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black mb-2">Tournament <span className="text-primary">Arena</span></h1>
            <p className="text-muted-foreground">{stats.total} tournaments created · {stats.totalPrize} uSTX total prize pool</p>
          </div>
          <button onClick={fetchTournaments} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
            <RefreshCw className={`w-3 h-3 ${fetching ? "animate-spin" : ""}`} /> Refresh
          </button>
        </motion.div>

        {fetching && tournaments.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-bold">No tournaments yet</p>
            <p className="text-sm">Create the first tournament to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tournaments.map((t, i) => (
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
                <h3 className="font-bold mb-3">{t.title || `Tournament #${t.id}`}</h3>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Players</span>
                    <span className="font-medium">{t.players}/{t.maxPlayers}</span>
                  </div>
                  {t.maxPlayers > 0 && (
                    <div className="h-1.5 bg-secondary rounded-full">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(t.players / t.maxPlayers) * 100}%` }} />
                    </div>
                  )}
                  <div className="flex justify-between text-xs mt-2">
                    <span className="text-muted-foreground">Entry Fee</span>
                    <span className="font-bold text-primary">{t.entryFee} uSTX</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Prize Pool</span>
                    <span className="font-bold">{t.prizePool.toLocaleString()} uSTX</span>
                  </div>
                </div>
                {t.status === "ACTIVE" && (
                  <button onClick={!isConnected ? connect : () => joinTournament(t.id, () => fetchTournaments())}
                    disabled={loading}
                    className="mt-4 w-full py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1">
                    <Zap className="w-3.5 h-3.5" />{isConnected ? (loading ? "Joining..." : "Join Tournament") : "Connect to Join"}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
