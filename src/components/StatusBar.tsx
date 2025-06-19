import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Wallet, TrendingUp, Clock } from 'lucide-react';
import { TradingStats } from '../types';

interface StatusBarProps {
  isRunning: boolean;
  stats: TradingStats;
  activeWallets: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ isRunning, stats, activeWallets }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 right-0 glass-effect border-t border-white/10 p-4"
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
              <span className="text-sm font-medium">
                {isRunning ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-dark-300">
              <Wallet className="w-4 h-4" />
              <span>{activeWallets} wallets activos</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-dark-300">
              <TrendingUp className="w-4 h-4" />
              <span>{stats.totalTrades} trades totales</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-dark-300">
              <Activity className="w-4 h-4" />
              <span>{stats.totalVolume.toFixed(4)} ETH volumen</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-dark-400">
            <Clock className="w-4 h-4" />
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatusBar;