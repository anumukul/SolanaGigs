import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, MapPin, Wallet, DollarSign } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-white">
     
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-blue-50">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Get Things Done with
              <span className="text-primary-600 block">SolanaGigs</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The decentralized marketplace where builders get paid instantly in SOL. 
              Post tasks, find skilled professionals, and enjoy trustless payments powered by smart contracts.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/browse"
                className="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center space-x-2 shadow-lg"
              >
                <span>Browse Tasks</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link
                to="/map"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <MapPin className="w-5 h-5" />
                <span>Explore Map</span>
              </Link>
            </div>
          </div>
        </div>
      </div>


      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SolanaGigs?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built on Solana for lightning-fast transactions and powered by smart contracts for ultimate security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-green-100 mb-6">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Trustless Escrow</h3>
              <p className="text-gray-600">Smart contracts automatically handle payments when work is completed and approved.</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-100 mb-6">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Instant Settlements</h3>
              <p className="text-gray-600">Lightning-fast payments on Solana with minimal fees. Get paid in seconds, not days.</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-purple-100 mb-6">
                <MapPin className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Location-Based</h3>
              <p className="text-gray-600">Find tasks near you on our interactive map or work remotely from anywhere.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join builders earning SOL for their skills. No upfront costs, no hidden fees.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/browse"
              className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2 shadow-lg"
            >
              <DollarSign className="w-5 h-5" />
              <span>Find Tasks</span>
            </Link>
            <Link
              to="/post"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-colors flex items-center space-x-2"
            >
              <ArrowRight className="w-5 h-5" />
              <span>Post a Task</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};