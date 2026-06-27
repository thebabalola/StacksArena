"use client";

import { useState, useCallback } from 'react';
import { Cl, fetchCallReadOnlyFunction, cvToJSON } from '@stacks/transactions';
import { useToast } from '@/components/features/core/ArenaToastProvider';
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
  const { toast } = useToast();
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
    token: string | null, // null for STX
    milestones: number,
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
        Cl.uint(threshold),
        token ? Cl.some(Cl.principal(token)) : Cl.none(),
        Cl.uint(milestones),
        Cl.contractPrincipal(CONTRACTS.VAULT_FACTORY.split('.')[0], CONTRACTS.VAULT_FACTORY.split('.')[1])
      ],
      (data) => { setLoading(false); onFinish(data); },
      () => setLoading(false)
    );
  };

  const withdraw = async (vaultId: number, tokenContract: string | null, onFinish: (data: any) => void) => {
    setLoading(true);
    try {
      await executeContractAction(
        addr, name,
        'withdraw',
        [
          Cl.uint(vaultId),
          tokenContract ? Cl.some(Cl.principal(tokenContract)) : Cl.none()
        ],
        (data) => {
          setLoading(false);
          toast("success", "Withdrawal transaction broadcasted!");
          onFinish(data);
        },
        () => {
          setLoading(false);
          toast("info", "Withdrawal cancelled.");
        }
      );
    } catch (e) {
      setLoading(false);
      toast("error", "Withdrawal failed.");
    }
  };

  const releaseMilestone = async (vaultId: number, tokenContract: string | null, onFinish: (data: any) => void) => {
    setLoading(true);
    await executeContractAction(
      addr, name,
      'release-milestone',
      [
        Cl.uint(vaultId),
        tokenContract ? Cl.some(Cl.principal(tokenContract)) : Cl.none()
      ],
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
    releaseMilestone,
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
    getPlatformStats: async () => null,
    getTicket: async (id: number) => null,
    buyTicket: async (...args: any[]) => {},
    buyTickets: async (...args: any[]) => {},
    loading: false
  };
}

export function useTournament() {
  return {
    getTournaments: async () => [],
    getTournament: async (id: number) => null,
    getArenaStats: async () => null,
    joinTournament: async (...args: any[]) => {},
    createTournament: async (...args: any[]) => {},
    loading: false
  };
}
