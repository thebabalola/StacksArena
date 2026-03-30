"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Ticket, Gift, Clock, TrendingUp, Plus, Minus, Loader2, RefreshCw } from "lucide-react";
import { useStacks } from "@/lib/hooks/use-stacks";
import { useLottery } from "@/lib/hooks/use-contract";

export default function LotteryPage() {
  const { connect, isConnected } = useStacks();
  const { getPlatformStats, buyTickets, loading } = useLottery();

  const [stats, setStats] = useState({
    totalRounds: 0, totalTicketsSold: 0, totalPrizePaid: 0,
    currentRoundId: 0, currentJackpot: 0, currentTicketsSold: 0, ticketPrice: 0,
  });
  const [qty, setQty] = useState(1);
  const [fetching, setFetching] = useState(true);

  const fetchStats = useCallback(async () => {
    setFetching(true);
    try {
      const result = await getPlatformStats();
      if (result?.value?.value) {
        const v = result.value.value;
        setStats({
          totalRounds: Number(v["total-rounds"]?.value ?? 0),
          totalTicketsSold: Number(v["total-tickets-sold"]?.value ?? 0),
          totalPrizePaid: Number(v["total-prize-paid"]?.value ?? 0),
          currentRoundId: Number(v["current-round-id"]?.value ?? 0),
          currentJackpot: Number(v["current-jackpot"]?.value ?? 0),
          currentTicketsSold: Number(v["current-tickets-sold"]?.value ?? 0),
          ticketPrice: Number(v["ticket-price"]?.value ?? 0),
        });
      }
    } catch (e) { console.error("Failed to fetch lottery stats:", e); }
    finally { setFetching(false); }
  }, [getPlatformStats]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black mb-2">Lottery <span className="text-companion">Pool</span></h1>
            <p className="text-muted-foreground">Provably fair on-chain lottery. {stats.totalRounds} rounds completed.</p>
          </div>
          <button onClick={fetchStats} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
            <RefreshCw className={`w-3 h-3 ${fetching ? "animate-spin" : ""}`} /> Refresh
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[{ icon: Gift, label: "Current Jackpot", value: fetching ? "..." : `${stats.currentJackpot} uSTX`, color: "text-primary" },
            { icon: Ticket, label: "Tickets Sold", value: fetching ? "..." : stats.currentTicketsSold.toString(), color: "text-companion" },
            { icon: Clock, label: "Total Rounds", value: fetching ? "..." : stats.totalRounds.toString(), color: "text-primary" }].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="p-6 rounded-2xl border border-border bg-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-2xl font-black ${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-8 rounded-3xl border border-border bg-card mb-8">
          <h2 className="text-xl font-black mb-4">Buy Tickets — Round #{stats.currentRoundId}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Each ticket costs <strong className="text-primary">{stats.ticketPrice} uSTX</strong>. More tickets = higher win chance.
          </p>
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors">
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-3xl font-black w-16 text-center">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors">
              <Plus className="w-4 h-4" />
            </button>
            <div className="ml-4">
              <p className="text-xs text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-black text-primary">{qty * stats.ticketPrice} uSTX</p>
            </div>
          </div>
          <button onClick={!isConnected ? connect : () => buyTickets(stats.currentRoundId, qty, () => fetchStats())}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-companion text-white font-black text-sm hover:bg-companion/90 transition-colors shadow-lg shadow-companion/25">
            {isConnected ? (loading ? "Buying..." : `Buy ${qty} Ticket${qty > 1 ? "s" : ""}`) : "Connect Wallet to Buy"}
          </button>
        </motion.div>

        <h2 className="text-xl font-black mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Stats</h2>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Tickets Sold</p>
              <p className="text-lg font-bold">{fetching ? "..." : stats.totalTicketsSold}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Prize Paid</p>
              <p className="text-lg font-bold text-primary">{fetching ? "..." : `${stats.totalPrizePaid} uSTX`}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Jackpot</p>
              <p className="text-lg font-bold">{fetching ? "..." : `${stats.currentJackpot} uSTX`}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ticket Price</p>
              <p className="text-lg font-bold">{fetching ? "..." : `${stats.ticketPrice} uSTX`}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
