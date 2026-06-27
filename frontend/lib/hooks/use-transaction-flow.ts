import { useState, useCallback, useEffect } from 'react';
import { STACKS_NETWORK_CONFIG } from '../constants/contracts';

export type TxState = "idle" | "pending_signature" | "broadcast" | "confirming" | "success" | "error" | "rejected";

export function useTransactionFlow() {
  const [txState, setTxState] = useState<TxState>("idle");
  const [txId, setTxId] = useState<string | null>(null);

  const handlePending = useCallback(() => {
    setTxState("pending_signature");
    setTxId(null);
  }, []);

  const handleFinish = useCallback((data: any) => {
    setTxId(data.txId);
    setTxState("broadcast");
  }, []);

  const handleCancel = useCallback(() => {
    setTxState("rejected");
  }, []);

  const handleError = useCallback((e: any) => {
    console.error(e);
    setTxState("error");
  }, []);

  const reset = useCallback(() => {
    setTxState("idle");
    setTxId(null);
  }, []);

  useEffect(() => {
    if (!txId || (txState !== 'broadcast' && txState !== 'confirming')) return;

    let timeoutId: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const apiUrl = (STACKS_NETWORK_CONFIG as any).coreApiUrl || 'https://api.mainnet.hiro.so';
        const res = await fetch(`${apiUrl}/extended/v1/tx/${txId}`);
        if (!res.ok) {
           timeoutId = setTimeout(checkStatus, 5000);
           return;
        }
        const data = await res.json();
        
        if (data.tx_status === 'success') {
          setTxState('success');
        } else if (data.tx_status === 'pending') {
          setTxState('confirming');
          timeoutId = setTimeout(checkStatus, 5000);
        } else if (data.tx_status === 'abort_by_response' || data.tx_status === 'abort_by_post_condition' || data.tx_status === 'dropped') {
          setTxState('error');
        } else {
          timeoutId = setTimeout(checkStatus, 5000);
        }
      } catch (e) {
        timeoutId = setTimeout(checkStatus, 5000);
      }
    };

    checkStatus();

    return () => clearTimeout(timeoutId);
  }, [txId, txState]);

  return {
    txState,
    txId,
    setTxState,
    handlePending,
    handleFinish,
    handleCancel,
    handleError,
    reset,
  };
}
