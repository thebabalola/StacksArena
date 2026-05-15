"use client";

import { useState, useEffect } from 'react';
import { STACKS_NETWORK_CONFIG } from './constants/contracts';

export function useBlockHeight() {
  const [blockHeight, setBlockHeight] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHeight() {
      try {
        const response = await fetch(`${STACKS_NETWORK_CONFIG.baseUrl}/extended/v1/block?limit=1`);
        const data = await response.json();
        if (data.results && data.results[0]) {
          setBlockHeight(data.results[0].height);
        }
      } catch (e) {
        console.error("Failed to fetch block height", e);
      } finally {
        setLoading(false);
      }
    }

    fetchHeight();
    const interval = setInterval(fetchHeight, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return { blockHeight, loading };
}
