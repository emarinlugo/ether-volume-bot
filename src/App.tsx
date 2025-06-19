import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import ConfigPanel from './components/ConfigPanel';
import WalletManager from './components/WalletManager';
import TradingPanel from './components/TradingPanel';
import LogsPanel from './components/LogsPanel';
import StatusBar from './components/StatusBar';
import { BotConfig, TradingLog, WalletData } from './types';

const defaultConfig: BotConfig = {
  targetTokenAddress: '',
  baseWalletAddress: '',
  baseWalletPrivateKey: '',
  chainId: 56,
  subWalletNum: 2,
  amountMin: 0.001,
  amountMax: 0.003,
  fee: 0.001,
  minInterval: 5000,
  maxInterval: 30000,
  testVersion: false,
  rpcEndpoints: {
    eth: '',
    bsc: '',
    sepolia: ''
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('config');
  const [config, setConfig] = useState<BotConfig>(defaultConfig);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [logs, setLogs] = useState<TradingLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState({
    totalTrades: 0,
    successfulTrades: 0,
    totalVolume: 0,
    activeWallets: 0
  });

  const tabs = [
    { id: 'config', label: 'Configuración', icon: '⚙️' },
    { id: 'wallets', label: 'Wallets', icon: '👛' },
    { id: 'trading', label: 'Trading', icon: '📈' },
    { id: 'logs', label: 'Logs', icon: '📋' }
  ];

  const addLog = (log: Omit<TradingLog, 'id' | 'timestamp'>) => {
    const newLog: TradingLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep only last 100 logs
  };

  const updateStats = (newStats: Partial<typeof stats>) => {
    setStats(prev => ({ ...prev, ...newStats }));
  };

  useEffect(() => {
    // Load saved config from localStorage
    const savedConfig = localStorage.getItem('volumeBotConfig');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Error loading saved config:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save config to localStorage whenever it changes
    localStorage.setItem('volumeBotConfig', JSON.stringify(config));
  }, [config]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-dark-800/50 p-1 rounded-xl backdrop-blur-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {activeTab === 'config' && (
              <ConfigPanel config={config} setConfig={setConfig} />
            )}
            
            {activeTab === 'wallets' && (
              <WalletManager 
                wallets={wallets} 
                setWallets={setWallets}
                config={config}
                addLog={addLog}
              />
            )}
            
            {activeTab === 'trading' && (
              <TradingPanel 
                config={config}
                wallets={wallets}
                isRunning={isRunning}
                setIsRunning={setIsRunning}
                addLog={addLog}
                updateStats={updateStats}
                stats={stats}
              />
            )}
            
            {activeTab === 'logs' && (
              <LogsPanel logs={logs} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <StatusBar 
        isRunning={isRunning}
        stats={stats}
        activeWallets={wallets.filter(w => w.funded > 0).length}
      />
    </div>
  );
}

export default App;