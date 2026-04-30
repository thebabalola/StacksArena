"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Trophy, Users, Clock, Zap, Loader2, RefreshCw, Plus } from "lucide-react";
import { useStacks } from "@/lib/hooks/use-stacks";
import { useTournament } from "@/lib/hooks/use-contract";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";

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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    entryFee: 1000000,
    maxPlayers: 10,
    minPlayers: 2,
    durationBlocks: 144
  });

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTournament(
      formData.title,
      formData.description,
      formData.entryFee,
      formData.maxPlayers,
      formData.minPlayers,
      formData.durationBlocks,
      () => {
        setIsCreateOpen(false);
        fetchTournaments();
      }
    );
  };

  useEffect(() => { fetchTournaments(); }, [fetchTournaments]);

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black mb-2">Tournament <span className="text-primary">Arena</span></h1>
            <p className="text-muted-foreground">{stats.total} tournaments created · {stats.totalPrize} uSTX total prize pool</p>
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                  <Plus className="w-4 h-4" /> Create Tournament
                </button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border text-foreground">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">Create <span className="text-primary">Tournament</span></DialogTitle>
                  <DialogDescription className="text-muted-foreground">Set the rules for your new tournament arena.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tournament Title</label>
                    <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none transition-all"
                      placeholder="Grand Bitcoin Championship" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none transition-all h-20"
                      placeholder="Welcome to the ultimate arena..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Entry Fee (uSTX)</label>
                      <input type="number" required value={formData.entryFee} onChange={e => setFormData({...formData, entryFee: Number(e.target.value)})}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Duration (Blocks)</label>
                      <input type="number" required value={formData.durationBlocks} onChange={e => setFormData({...formData, durationBlocks: Number(e.target.value)})}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Min Players</label>
                      <input type="number" required value={formData.minPlayers} onChange={e => setFormData({...formData, minPlayers: Number(e.target.value)})}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Max Players</label>
                      <input type="number" required value={formData.maxPlayers} onChange={e => setFormData({...formData, maxPlayers: Number(e.target.value)})}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none transition-all" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    Deploy Tournament
                  </button>
                </form>
              </DialogContent>
            </Dialog>
            <button onClick={fetchTournaments} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
              <RefreshCw className={`w-3 h-3 ${fetching ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </motion.div>

        {fetching && tournaments.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-bold">No tournaments yet</p>
            <p className="text-sm mb-6">Create the first tournament to get started</p>
            <button onClick={() => setIsCreateOpen(true)} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <Plus className="w-4 h-4" /> Create Tournament
            </button>
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
