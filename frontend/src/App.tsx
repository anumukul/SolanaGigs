import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { BrowsePage } from './pages/BrowsePage';
import { PostTaskPage } from './pages/PostTaskPage';
import { MapPage } from './pages/MapPage';
import { ProfilePage } from './pages/ProfilePage';
import './App.css';
import { useWeb3Auth } from '@web3auth/modal/react';
import { useSolanaWallet } from './hooks/useSolanaWallet';

function App() {

  const { isConnected, user } = useWeb3Auth();
const { accounts, publicKey, balance } = useSolanaWallet();

console.log('=== APP DEBUG ===');
console.log('Connected:', isConnected);
console.log('User:', user);
console.log('Accounts:', accounts);
console.log('PublicKey:', publicKey?.toString());
console.log('Balance:', balance);
console.log('================');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/post" element={<PostTaskPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;