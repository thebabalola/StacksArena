"use client";

import { useMemo } from "react";

import { useStacks } from "@/lib/hooks/use-stacks";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatAddress(address?: string | null) {
  if (!address) return "—";
  return address.length <= 10
    ? address
    : `${address.slice(0, 5)}…${address.slice(address.length - 5)}`;
}

export function WalletPanel() {
  const {
    status,
    providerName,
    isLoading,
    isPending,
    isConnected,
    stxAddress,
    btcAddress,
    error,
    connect,
    disconnect,
    refresh,
  } = useStacks();

  const statusCopy = useMemo(() => {
    switch (status) {
      case "connected":
        return "Wallet connected";
      case "pending":
        return "Awaiting wallet approval…";
      case "error":
        return "Wallet error";
      case "disconnected":
        return "No wallet connected";
      default:
        return "Idle";
    }
  }, [status]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Wallet status</p>
          <CardTitle className="text-xl mt-1">{statusCopy}</CardTitle>
          {providerName ? (
            <p className="text-sm text-muted-foreground mt-1">Provider: {providerName}</p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refresh}
            disabled={isLoading}
          >
            Refresh
          </Button>
          {isConnected ? (
            <Button
              variant="secondary"
              onClick={disconnect}
              disabled={isLoading}
            >
              Disconnect
            </Button>
          ) : (
            <Button
              onClick={connect}
              disabled={isLoading || isPending}
            >
              {isPending ? "Opening wallet…" : "Connect wallet"}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-4 rounded-xl bg-secondary/20 p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              STX Address
            </p>
            <p className="mt-1 font-mono text-sm text-foreground">
              {formatAddress(stxAddress)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              BTC Address
            </p>
            <p className="mt-1 font-mono text-sm text-foreground">
              {formatAddress(btcAddress)}
            </p>
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
