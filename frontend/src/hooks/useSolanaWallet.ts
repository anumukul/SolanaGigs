import { useWeb3Auth } from '@web3auth/modal/react';
import { useSolanaWallet as useWeb3AuthSolana } from '@web3auth/modal/react/solana';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useState, useEffect, useMemo } from 'react';

const SOLANA_RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export const useSolanaWallet = () => {
  const { isConnected } = useWeb3Auth();
  const { accounts, connection: web3AuthConnection } = useWeb3AuthSolana();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Create our own connection for reliability
  const connection = useMemo(() => {
    return new Connection(SOLANA_RPC_URL, 'confirmed');
  }, []);

  const publicKey = useMemo(() => {
    if (!accounts || accounts.length === 0) return null;
    try {
      return new PublicKey(accounts[0]);
    } catch (error) {
      console.error('Invalid public key:', error);
      return null;
    }
  }, [accounts]);

  const fetchBalance = async () => {
    if (!connection || !publicKey) return;
    
    try {
      setIsLoading(true);
      const balanceInLamports = await connection.getBalance(publicKey);
      setBalance(balanceInLamports / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && publicKey) {
      fetchBalance();
    } else {
      setBalance(null);
    }
  }, [isConnected, publicKey, connection]);

  return {
    isConnected,
    publicKey,
    balance,
    connection,
    isLoading,
    fetchBalance,
    accounts,
  };
};