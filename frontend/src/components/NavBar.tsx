import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3Auth } from '@web3auth/modal/react';
import { useWeb3AuthConnect } from '@web3auth/modal/react';
import { useSolanaWallet } from '../hooks/useSolanaWallet';
import { Wallet, Plus, MapPin, Grid, User, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { isConnected, user, logout } = useWeb3Auth();
  const { connect, loading } = useWeb3AuthConnect();
  const { balance, publicKey } = useSolanaWallet();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/browse', label: 'Browse Tasks', icon: Grid },
    { path: '/map', label: 'Map View', icon: MapPin },
    { path: '/post', label: 'Post Task', icon: Plus },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
         
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SolanaGigs</span>
          </Link>

          
          <div className="hidden md:flex space-x-8">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(path)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

        
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                
                <div className="text-sm text-gray-600">
                  {balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}
                </div>

                
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{user?.name || 'User'}</div>
                    <div className="text-gray-500 text-xs">
                      {publicKey?.toBase58().slice(0, 8)}...
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Disconnect"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={loading}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Wallet className="w-4 h-4" />
                <span>{loading ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>
        </div>


        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 py-3 space-y-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                  isActive(path)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};