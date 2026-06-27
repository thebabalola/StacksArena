"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Trophy, Users, Zap, Loader2, RefreshCw, Plus, ArrowLeft } from "lucide-react";
import { useStacks } from "@/lib/hooks/use-stacks";
import { useTournament } from "@/lib/hooks/use-contract";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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

export default function TournamentsPage() {
  const { connect, isConnected } = useStacks();
  const { getTournament, getArenaStats, joinTournament, createTournament, loading } = useTournament();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [stats, setStats] = useState({ total: 0, totalPrize: 0 });
  const [fetching, setFetching] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    entryFeeSTX: "1.0",
    maxPlayers: 10,
    minPlayers: 2,
    durationBlocks: 144
  });

  const fetchTournaments = useCallback(async () => {
    setFetching(true);
    try {
      const arenaStats = await getArenaStats();
      const a = arenaStats?.value;
      const total = Number(a?.["total-tournaments"]?.value ?? 0);
      const totalPrize = Number(a?.["total-prize-distributed"]?.value ?? 0);

      setStats({ total, totalPrize });

      const list: Tournament[] = [];
      const start = Math.max(1, total - 11);
      for (let i = start; i <= total; i++) {
        const t = await getTournament(i);
        if (t?.value) {
          const v = t.value;
          list.push({
            id: i,
            title: v.title?.value ?? `Tournament #${i}`,
            entryFee: Number(v["entry-fee"]?.value ?? 0) / 1000000,
            prizePool: Number(v["prize-pool"]?.value ?? 0) / 1000000,
            players: Number(v["current-players"]?.value ?? 0),
            maxPlayers: Math.max(1, Number(v["max-players"]?.value ?? 0)),
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
    const entryFeeMicro = Math.floor(parseFloat(formData.entryFeeSTX) * 1000000);
    await createTournament(
      formData.title,
      formData.description,
      entryFeeMicro,
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
    <div className="min-h-screen px-6 pt-28 pb-28 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
           <Link href="/arena" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors mb-4">
             <ArrowLeft className="w-3 h-3" /> Back to Arena Dashboard
           </Link>
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-black mb-2">Available <span className="text-primary">Tournaments</span></h1>
              <p className="text-muted-foreground">{stats.total} global competitions · Active prize pools</p>
            </div>
            <div className="flex items-center gap-4">
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-lg">
                    <Plus className="w-4 h-4" /> Create New
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border text-foreground">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black">Host <span className="text-primary">Tournament</span></DialogTitle>
                    <DialogDescription className="text-muted-foreground">Configure your custom competition arena.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreate} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Title</label>
                      <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Entry Fee (STX)</label>
                        <input type="text" required value={formData.entryFeeSTX} onChange={e => setFormData({...formData, entryFeeSTX: e.target.value})}
                          placeholder="0.00003"
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
                      Launch Tournament
                    </button>
                  </form>
                </DialogContent>
              </Dialog>
              <button onClick={fetchTournaments} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                <RefreshCw className={`w-3 h-3 ${fetching ? "animate-spin" : ""}`} /> Refresh
              </button>
            </div>
          </motion.div>
        </div>

        {fetching && tournaments.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-bold">No active tournaments</p>
            <button onClick={() => setIsCreateOpen(true)} className="mt-4 px-6 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all">
              Launch First Tournament
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tournaments.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${t.status === "ACTIVE" ? "bg-green-500/15 text-green-500" : "bg-muted text-muted-foreground"}`}>
                    {t.status}
                  </span>
                </div>
                <h3 className="font-bold mb-3 truncate">{t.title}</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground">
                      <span>Occupancy</span>
                      <span>{Math.round((t.players/t.maxPlayers)*100)}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(t.players / t.maxPlayers) * 100}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs">
                      <p className="text-muted-foreground">Prize Pool</p>
                      <p className="font-bold">{t.prizePool.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} STX</p>
                    </div>
                    <div className="text-xs text-right">
                      <p className="text-muted-foreground">Entry</p>
                      <p className="font-bold text-primary">{t.entryFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} STX</p>
                    </div>
                  </div>
                </div>
                {t.status === "ACTIVE" && (
                  <button onClick={!isConnected ? connect : () => joinTournament(t.id, () => fetchTournaments())}
                    disabled={loading}
                    className="mt-6 w-full py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-wider hover:bg-primary/90 transition-all shadow-md">
                    {isConnected ? (loading ? "Deploying..." : "Join Arena") : "Connect Wallet"}
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
