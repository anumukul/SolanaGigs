// src/components/SolanaPayQR.tsx
import React, { useState, useRef, useEffect } from 'react';
import { createQR, encodeURL } from '@solana/pay';
import { PublicKey, Keypair } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { useSolanaWallet } from '../hooks/useSolanaWallet';

interface SolanaPayQRProps {
  recipient: string;
  amount: number;
  label?: string;
  message?: string;
}

export const SolanaPayQR: React.FC<SolanaPayQRProps> = ({
  recipient,
  amount,
  label = "SolanaGigs Payment",
  message = "Task payment via SolanaGigs"
}) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (qrRef.current) {
      try {
        qrRef.current.innerHTML = '';
        
        const recipientPublicKey = new PublicKey(recipient);
        const amountBigNumber = new BigNumber(amount);
        const reference = new Keypair().publicKey;
        
        const url = encodeURL({
          recipient: recipientPublicKey,
          amount: amountBigNumber,
          reference,
          label,
          message,
          memo: `SolanaGigs: ${label}`
        });

        const qr = createQR(url, 300, "white");
        qr.append(qrRef.current);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate QR code');
      }
    }
  }, [recipient, amount, label, message]);

  if (error) {
    return (
      <div className="text-red-500 text-sm text-center p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="text-center">
      <div ref={qrRef} className="inline-block p-4 bg-white rounded-lg shadow" />
      <p className="text-sm text-gray-600 mt-2">Scan to pay {amount} SOL</p>
    </div>
  );
};