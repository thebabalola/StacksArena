"use client";

import { useState, useCallback } from 'react';
import { Cl, fetchCallReadOnlyFunction, cvToJSON } from '@stacks/transactions';
import { CONTRACTS, STACKS_NETWORK_CONFIG } from '../constants/contracts';
import { useStacks } from './use-stacks';
import { executeContractAction } from '../stacks-actions';

// ─── Lottery Pool ─────────────────────────────────────────────────────────

export function useLottery() {
  const { stxAddress } = useStacks();
  const [loading, setLoading] = useState(false);
  const [addr, name] = CONTRACTS.LOTTERY_POOL.split('.');

  const getRound = useCallback(async (roundId: number) => {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: addr,
        contractName: name,
        functionName: 'get-round',
        functionArgs: [Cl.uint(roundId)],
        network: STACKS_NETWORK_CONFIG as any,
        senderAddress: stxAddress || addr,
      });
      return cvToJSON(result);
    } catch (e) {
      console.error('get-round error', e);
      return null;
    }
  }, [addr, name, stxAddress]);

  const getTickets = useCallback(async (roundId: number, buyer: string) => {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: addr,
        contractName: name,
        functionName: 'get-tickets',
        functionArgs: [Cl.uint(roundId), Cl.principal(buyer)],
        network: STACKS_NETWORK_CONFIG as any,
        senderAddress: stxAddress || addr,
      });
      return cvToJSON(result);
    } catch (e) {
      console.error('get-tickets error', e);
      return null;
    }
  }, [addr, name, stxAddress]);

  const getPlatformStats = useCallback(async () => {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: addr,
        contractName: name,
        functionName: 'get-platform-stats',
        functionArgs: [],
        network: STACKS_NETWORK_CONFIG as any,
        senderAddress: stxAddress || addr,
      });
      return cvToJSON(result);
    } catch (e) {
      console.error('get-platform-stats error', e);
      return null;
    }
  }, [addr, name, stxAddress]);

  const createRound = async (
    ticketPrice: number,
    durationBlocks: number,
    onFinish: (data: any) => void
  ) => {
    setLoading(true);
    await executeContractAction(
      addr, name,
      'create-round',
      [Cl.uint(ticketPrice), Cl.uint(durationBlocks)],
      (data) => { setLoading(false); onFinish(data); },
      () => setLoading(false)
    );
  };

  const buyTickets = async (
    roundId: number,
    count: number,
    onFinish: (data: any) => void
  ) => {
    setLoading(true);
    await executeContractAction(
      addr, name,
      'buy-tickets',
      [Cl.uint(roundId), Cl.uint(count)],
      (data) => { setLoading(false); onFinish(data); },
      () => setLoading(false)
    );
  };

  const drawWinner = async (roundId: number, onFinish: (data: any) => void) => {
    setLoading(true);
    await executeContractAction(
      addr, name,
      'draw-winner',
      [Cl.uint(roundId)],
      (data) => { setLoading(false); onFinish(data); },
      () => setLoading(false)
    );
  };

  const claimPrize = async (roundId: number, rangeIndex: number, onFinish: (data: any) => void) => {
    setLoading(true);
    await executeContractAction(
      addr, name,
      'claim-winner',
      [Cl.uint(roundId), Cl.uint(rangeIndex)],
      (data) => { setLoading(false); onFinish(data); },
      () => setLoading(false)
    );
  };

  return {
    getRound,
    getTickets,
    getPlatformStats,
    createRound,
    buyTickets,
    drawWinner,
    claimPrize,
    loading,
  };
}

// ─── Tournament Manager ───────────────────────────────────────────────────

export function useTournament() {
  const { stxAddress } = useStacks();
  const [loading, setLoading] = useState(false);
  const [addr, name] = CONTRACTS.TOURNAMENT_MANAGER.split('.');

  const getTournament = useCallback(async (tournamentId: number) => {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: addr,
        contractName: name,
        functionName: 'get-tournament',
        functionArgs: [Cl.uint(tournamentId)],
        network: STACKS_NETWORK_CONFIG as any,
        senderAddress: stxAddress || addr,
      });
      return cvToJSON(result);
    } catch (e) {
      console.error('get-tournament error', e);
      return null;
    }
  }, [addr, name, stxAddress]);

  const getArenaStats = useCallback(async () => {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: addr,
        contractName: name,
        functionName: 'get-arena-stats',
        functionArgs: [],
        network: STACKS_NETWORK_CONFIG as any,
        senderAddress: stxAddress || addr,
      });
      return cvToJSON(result);
    } catch (e) {
      console.error('get-arena-stats error', e);
      return null;
    }
  }, [addr, name, stxAddress]);

  const getPlayerScore = useCallback(async (tournamentId: number, player: string) => {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: addr,
        contractName: name,
        functionName: 'get-player-score',
        functionArgs: [Cl.uint(tournamentId), Cl.principal(player)],
        network: STACKS_NETWORK_CONFIG as any,
        senderAddress: stxAddress || addr,
      });
      return cvToJSON(result);
    } catch (e) {
      console.error('get-player-score error', e);
      return null;
    }
  }, [addr, name, stxAddress]);

  const createTournament = async (
    title: string,
    description: string,
    entryFee: number,
    maxPlayers: number,
    minPlayers: number,
    durationBlocks: number,
    onFinish: (data: any) => void
  ) => {
    setLoading(true);
    await executeContractAction(
      addr, name,
      'create-tournament',
      [
        Cl.stringAscii(title),
        Cl.stringAscii(description),
        Cl.uint(entryFee),
        Cl.uint(maxPlayers),
        Cl.uint(minPlayers),
        Cl.uint(durationBlocks),
      ],
      (data) => { setLoading(false); onFinish(data); },
      () => setLoading(false)
    );
  };

  const joinTournament = async (tournamentId: number, onFinish: (data: any) => void) => {
    setLoading(true);
    await executeContractAction(
      addr, name,
      'join-tournament',
      [Cl.uint(tournamentId)],
      (data) => { setLoading(false); onFinish(data); },
      () => setLoading(false)
    );
  };

  const submitScore = async (
    tournamentId: number,
    score: number,
    onFinish: (data: any) => void
  ) => {
    setLoading(true);
    await executeContractAction(
      addr, name,
      'submit-score',
      [Cl.uint(tournamentId), Cl.uint(score)],
      (data) => { setLoading(false); onFinish(data); },
      () => setLoading(false)
    );
  };

  const finalizeTournament = async (tournamentId: number, onFinish: (data: any) => void) => {
    setLoading(true);
    await executeContractAction(
      addr, name,
      'finalize-tournament',
      [Cl.uint(tournamentId)],
      (data) => { setLoading(false); onFinish(data); },
      () => setLoading(false)
    );
  };

  const claimWinnerPrize = async (tournamentId: number, onFinish: (data: any) => void) => {
    setLoading(true);
    await executeContractAction(
      addr, name,
      'claim-winner-prize',
      [Cl.uint(tournamentId)],
      (data) => { setLoading(false); onFinish(data); },
      () => setLoading(false)
    );
  };

  const claimRunnerUpPrize = async (tournamentId: number, onFinish: (data: any) => void) => {
    setLoading(true);
    await executeContractAction(
      addr, name,
      'claim-runner-up-prize',
      [Cl.uint(tournamentId)],
      (data) => { setLoading(false); onFinish(data); },
      () => setLoading(false)
    );
  };

  const cancelTournament = async (tournamentId: number, onFinish: (data: any) => void) => {
    setLoading(true);
    await executeContractAction(
      addr, name,
      'cancel-tournament',
      [Cl.uint(tournamentId)],
      (data) => { setLoading(false); onFinish(data); },
      () => setLoading(false)
    );
  };

  const refundEntryFee = async (tournamentId: number, onFinish: (data: any) => void) => {
    setLoading(true);
    await executeContractAction(
      addr, name,
      'refund-entry-fee',
      [Cl.uint(tournamentId)],
      (data) => { setLoading(false); onFinish(data); },
      () => setLoading(false)
    );
  };

  return {
    getTournament,
    getArenaStats,
    getPlayerScore,
    createTournament,
    joinTournament,
    submitScore,
    finalizeTournament,
    claimWinnerPrize,
    claimRunnerUpPrize,
    cancelTournament,
    refundEntryFee,
    loading,
  };
}

// ─── Game Assets ──────────────────────────────────────────────────────────

export function useGameAssets() {
  const { stxAddress } = useStacks();
  const [loading, setLoading] = useState(false);
  const [addr, name] = CONTRACTS.GAME_ASSETS.split('.');

  const getAsset = useCallback(async (assetId: number) => {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: addr,
        contractName: name,
        functionName: 'get-asset',
        functionArgs: [Cl.uint(assetId)],
        network: STACKS_NETWORK_CONFIG as any,
        senderAddress: stxAddress || addr,
      });
      return cvToJSON(result);
    } catch (e) {
      console.error('get-asset error', e);
      return null;
    }
  }, [addr, name, stxAddress]);

  const getCollectionStats = useCallback(async () => {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: addr,
        contractName: name,
        functionName: 'get-collection-stats',
        functionArgs: [],
        network: STACKS_NETWORK_CONFIG as any,
        senderAddress: stxAddress || addr,
      });
      return cvToJSON(result);
    } catch (e) {
      console.error('get-collection-stats error', e);
      return null;
    }
  }, [addr, name, stxAddress]);

  const mintAsset = async (
    assetType: string,
    name_: string,
    power: number,
    defense: number,
    speed: number,
    rarity: number,
    onFinish: (data: any) => void
  ) => {
    setLoading(true);
    await executeContractAction(
      addr, name,
      'mint-asset',
      [
        Cl.stringAscii(assetType),
        Cl.stringAscii(name_),
        Cl.uint(power),
        Cl.uint(defense),
        Cl.uint(speed),
        Cl.uint(rarity),
      ],
      (data) => { setLoading(false); onFinish(data); },
      () => setLoading(false)
    );
  };

  const transferAsset = async (
    assetId: number,
    recipient: string,
    onFinish: (data: any) => void
  ) => {
    setLoading(true);
    await executeContractAction(
      addr, name,
      'transfer-asset',
      [Cl.uint(assetId), Cl.principal(recipient)],
      (data) => { setLoading(false); onFinish(data); },
      () => setLoading(false)
    );
  };

  const addXp = async (assetId: number, xpAmount: number, onFinish: (data: any) => void) => {
    setLoading(true);
    await executeContractAction(
      addr, name,
      'add-xp',
      [Cl.uint(assetId), Cl.uint(xpAmount)],
      (data) => { setLoading(false); onFinish(data); },
      () => setLoading(false)
    );
  };

  const levelUp = async (assetId: number, onFinish: (data: any) => void) => {
    setLoading(true);
    await executeContractAction(
      addr, name,
      'level-up',
      [Cl.uint(assetId)],
      (data) => { setLoading(false); onFinish(data); },
      () => setLoading(false)
    );
  };

  const fuseAssets = async (
    assetId1: number,
    assetId2: number,
    onFinish: (data: any) => void
  ) => {
    setLoading(true);
    await executeContractAction(
      addr, name,
      'fuse-assets',
      [Cl.uint(assetId1), Cl.uint(assetId2)],
      (data) => { setLoading(false); onFinish(data); },
      () => setLoading(false)
    );
  };

  const toggleLock = async (assetId: number, onFinish: (data: any) => void) => {
    setLoading(true);
    await executeContractAction(
      addr, name,
      'toggle-lock',
      [Cl.uint(assetId)],
      (data) => { setLoading(false); onFinish(data); },
      () => setLoading(false)
    );
  };

  return {
    getAsset,
    getCollectionStats,
    mintAsset,
    transferAsset,
    addXp,
    levelUp,
    fuseAssets,
    toggleLock,
    loading,
  };
}
