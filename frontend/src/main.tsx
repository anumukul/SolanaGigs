import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Web3AuthProvider } from '@web3auth/modal/react';
import web3AuthContextConfig from './config/web3auth';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Web3AuthProvider config={web3AuthContextConfig}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Web3AuthProvider>
  </React.StrictMode>
);