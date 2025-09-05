import { useWeb3Auth } from '@web3auth/modal/react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useState, useEffect, useMemo } from 'react';

const SOLANA_RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export const useSolanaWallet = () => {
  const { isConnected, provider } = useWeb3Auth();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<string[] | null>(null);

  // Create connection
  const connection = useMemo(() => {
    return new Connection(SOLANA_RPC_URL, 'confirmed');
  }, []);

  // Get accounts from provider when connected
  useEffect(() => {
    const getAccounts = async () => {
      if (!provider || !isConnected) {
        setAccounts(null);
        return;
      }
      
      try {
        console.log('Getting accounts from provider...');
        const accounts = await provider.request({ method: "getAccounts" });
        console.log('Provider accounts:', accounts);
        setAccounts(accounts);
      } catch (error) {
        console.error('Error getting accounts:', error);
        setAccounts(null);
      }
    };

    getAccounts();
  }, [provider, isConnected]);

  // Get publicKey from first account
  const publicKey = useMemo(() => {
    if (!accounts || accounts.length === 0) return null;
    try {
      const key = new PublicKey(accounts[0]);
      console.log('PublicKey created:', key.toString());
      return key;
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