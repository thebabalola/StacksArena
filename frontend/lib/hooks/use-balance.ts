"use client";

import { useState, useEffect, useCallback } from 'react';
import { useStacks } from './use-stacks';
import { STACKS_NETWORK_CONFIG } from '../constants/contracts';

export interface BalanceData {
  /** Raw microSTX as BigInt */
  rawMicroStx: bigint;
  /** Human-readable STX with up to 6 decimal places, e.g. "0.000123" */
  formattedSTX: string;
  /** Full microSTX integer string, e.g. "123" */
  microStxStr: string;
  /** Whether the balance is loading */
  isLoading: boolean;
}

export function useBalance(): BalanceData & { refresh: () => void } {
  const { stxAddress, isConnected } = useStacks();
  const [rawMicroStx, setRawMicroStx] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!stxAddress) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${STACKS_NETWORK_CONFIG.baseUrl}/extended/v1/address/${stxAddress}/balances`
      );
      const data = await response.json();
      setRawMicroStx(BigInt(data.stx.balance));
    } catch (e) {
      console.error("Failed to fetch balance:", e);
    } finally {
      setIsLoading(false);
    }
  }, [stxAddress]);

  useEffect(() => {
    if (isConnected) {
      fetchBalance();
      const interval = setInterval(fetchBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, fetchBalance]);

  // Format: support micro-units — show up to 6 decimal places
  const formattedSTX = (Number(rawMicroStx) / 1_000_000).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });

  return {
    rawMicroStx,
    formattedSTX,
    microStxStr: rawMicroStx.toString(),
    isLoading,
    refresh: fetchBalance,
  };
}
