"use client";

import { useStacks } from "@/lib/hooks/use-stacks";
import { User, Wallet, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { isConnected, stxAddress, connect } = useStacks();

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-black mb-10">Player <span className="text-primary">Profile</span></h1>

        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-border rounded-2xl bg-card">
            <Wallet className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-xl font-bold mb-2">Wallet Not Connected</h2>
            <p className="text-muted-foreground mb-6">Connect your Stacks wallet to view your profile and assets.</p>
            <button onClick={connect} className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-2xl border border-border bg-card flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">PlayerOne</h2>
                <p className="text-muted-foreground font-mono bg-white/5 px-3 py-1 rounded-lg inline-block">{stxAddress}</p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl border border-border bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold">Activity Stats</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                    <span className="text-sm text-muted-foreground">Tournaments Played</span>
                    <span className="font-bold">0</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                    <span className="text-sm text-muted-foreground">Lottery Tickets</span>
                    <span className="font-bold">0</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                    <span className="text-sm text-muted-foreground">Assets Owned</span>
                    <span className="font-bold">0</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
