"use client";

import { useState, useCallback } from 'react';
import { Cl, fetchCallReadOnlyFunction, cvToJSON } from '@stacks/transactions';
import { CONTRACTS, STACKS_NETWORK_CONFIG } from '../constants/contracts';
import { useStacks } from './use-stacks';
import { executeContractAction } from '../stacks-actions';

// ─── Vault Factory ────────────────────────────────────────────────────────

export function useVaultFactory() {
  const { stxAddress } = useStacks();
  const [loading, setLoading] = useState(false);
  const [addr, name] = CONTRACTS.VAULT_FACTORY.split('.');

  const getProtocolStats = useCallback(async () => {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: addr,
        contractName: name,
        functionName: 'get-protocol-stats',
        functionArgs: [],
        network: STACKS_NETWORK_CONFIG as any,
        senderAddress: stxAddress || addr,
      });
      return cvToJSON(result);
    } catch (e) {
      console.error('get-protocol-stats error', e);
      return null;
    }
  }, [addr, name, stxAddress]);

  return {
    getProtocolStats,
    loading,
  };
}

// ─── Commit Vault ─────────────────────────────────────────────────────────

export function useCommitVault() {
  const { stxAddress } = useStacks();
  const [loading, setLoading] = useState(false);
  const [addr, name] = CONTRACTS.COMMIT_VAULT.split('.');

  const getVaultDetails = useCallback(async (vaultId: number) => {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: addr,
        contractName: name,
        functionName: 'get-vault-details',
        functionArgs: [Cl.uint(vaultId)],
        network: STACKS_NETWORK_CONFIG as any,
        senderAddress: stxAddress || addr,
      });
      return cvToJSON(result);
    } catch (e) {
      console.error('get-vault-details error', e);
      return null;
    }
  }, [addr, name, stxAddress]);

  const createVault = async (
    amount: number,
    targetBlock: number,
    penaltyRate: number,
    threshold: number,
    onFinish: (data: any) => void
  ) => {
    setLoading(true);
    await executeContractAction(
      addr, name,
      'create-vault',
      [
        Cl.uint(amount),
        Cl.uint(targetBlock),
        Cl.uint(penaltyRate),
        Cl.uint(threshold)
      ],
      (data) => { setLoading(false); onFinish(data); },
      () => setLoading(false)
    );
  };

  const withdraw = async (vaultId: number, onFinish: (data: any) => void) => {
    setLoading(true);
    await executeContractAction(
      addr, name,
      'withdraw',
      [Cl.uint(vaultId)],
      (data) => { setLoading(false); onFinish(data); },
      () => setLoading(false)
    );
  };

  const approveVault = async (vaultId: number, onFinish: (data: any) => void) => {
    setLoading(true);
    await executeContractAction(
      addr, name,
      'approve-vault',
      [Cl.uint(vaultId)],
      (data) => { setLoading(false); onFinish(data); },
      () => setLoading(false)
    );
  };

  return {
    getVaultDetails,
    createVault,
    withdraw,
    approveVault,
    loading,
  };
}

// ─── Placeholder Hooks for Future Features ───────────────────────────────

export function useGameAssets() {
  return {
    getAsset: async (id: number) => null,
    getCollectionStats: async () => null,
    getWalletCount: async (addr: string) => ({ value: 0 }),
    getWalletAssetAt: async (addr: string, i: number) => ({ value: 0 }),
    mintAsset: async (...args: any[]) => {},
    loading: false
  };
}

export function useLottery() {
  return {
    getLotteryStats: async () => null,
    getTicket: async (id: number) => null,
    buyTicket: async (...args: any[]) => {},
    loading: false
  };
}

export function useTournament() {
  return {
    getTournaments: async () => [],
    getTournament: async (id: number) => null,
    joinTournament: async (...args: any[]) => {},
    loading: false
  };
}
