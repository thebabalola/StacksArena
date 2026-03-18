"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Ticket, Gift, Clock, TrendingUp, Plus, Minus } from "lucide-react";
import { useStacks } from "@/lib/hooks/use-stacks";

const PAST_ROUNDS = [
  { round: 11, jackpot: 1240, winner: "SP3X...K2M1", tickets: 248, date: "Mar 12, 2025" },
  { round: 10, jackpot: 870, winner: "SP1A...9QN4", tickets: 174, date: "Mar 5, 2025" },
  { round: 9, jackpot: 2100, winner: "SP7F...3TY8", tickets: 420, date: "Feb 26, 2025" },
];

export default function LotteryPage() {
  const { connect, isConnected } = useStacks();
  const [qty, setQty] = useState(1);

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-black mb-2">Lottery <span className="text-companion">Pool</span></h1>
          <p className="text-muted-foreground">Provably fair on-chain lottery. One winner takes the entire jackpot.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[{ icon: Gift, label: "Current Jackpot", value: "1,847 STX", color: "text-primary" },
            { icon: Ticket, label: "Tickets Sold", value: "369", color: "text-companion" },
            { icon: Clock, label: "Draw In", value: "18h 42m", color: "text-primary" }].map(({ icon: Icon, label, value, color }) => (
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
          <h2 className="text-xl font-black mb-4">Buy Tickets — Round #12</h2>
          <p className="text-sm text-muted-foreground mb-4">Each ticket costs <strong className="text-primary">5 STX</strong>. More tickets = higher win chance.</p>
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
              <p className="text-2xl font-black text-primary">{qty * 5} STX</p>
            </div>
          </div>
          <button onClick={!isConnected ? connect : undefined}
            className="w-full py-3.5 rounded-2xl bg-companion text-white font-black text-sm hover:bg-companion/90 transition-colors shadow-lg shadow-companion/25">
            {isConnected ? `Buy ${qty} Ticket${qty > 1 ? "s" : ""}` : "Connect Wallet to Buy"}
          </button>
        </motion.div>

        <h2 className="text-xl font-black mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Past Rounds</h2>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>{["Round", "Jackpot", "Winner", "Tickets", "Date"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {PAST_ROUNDS.map((r, i) => (
                <tr key={r.round} className={`border-t border-border ${i % 2 === 0 ? "" : "bg-secondary/20"}`}>
                  <td className="px-4 py-3 font-bold">#{r.round}</td>
                  <td className="px-4 py-3 text-primary font-bold">{r.jackpot} STX</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.winner}</td>
                  <td className="px-4 py-3">{r.tickets}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
