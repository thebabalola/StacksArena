"use client";

import { useState, useEffect, useCallback } from 'react';
import { useStacks } from './use-stacks';
import { STACKS_NETWORK_CONFIG } from '../constants/contracts';

export function useBalance() {
  const { stxAddress, isConnected } = useStacks();
  const [balance, setBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!stxAddress) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${STACKS_NETWORK_CONFIG.baseUrl}/extended/v1/address/${stxAddress}/balances`);
      const data = await response.json();
      const stxBalance = BigInt(data.stx.balance);
      // Convert microSTX to STX and format
      const formatted = (Number(stxBalance) / 1000000).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
      setBalance(formatted);
    } catch (e) {
      console.error("Failed to fetch balance:", e);
    } finally {
      setIsLoading(false);
    }
  }, [stxAddress]);

  useEffect(() => {
    if (isConnected) {
      fetchBalance();
      // Refresh every 30 seconds
      const interval = setInterval(fetchBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, fetchBalance]);

  return { balance, isLoading, refresh: fetchBalance };
}
