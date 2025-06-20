import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, TrendingUp, DollarSign, Activity, AlertTriangle } from 'lucide-react';
import { BotConfig, WalletData, TradingLog, TradingStats } from '../types';
import { ConfigService } from '../services/configService';
import { TradingService } from '../services/tradingService';

interface TradingPanelProps {
  config: BotConfig;
  wallets: WalletData[];
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  addLog: (log: Omit<TradingLog, 'id' | 'timestamp'>) => void;
  updateStats: (stats: Partial<TradingStats>) => void;
  stats: TradingStats;
}

const TradingPanel: React.FC<TradingPanelProps> = ({
  config,
  wallets,
  isRunning,
  setIsRunning,
  addLog,
  updateStats,
  stats
}) => {
  const [currentWallet, setCurrentWallet] = useState<string | null>(null);
  const [nextTradeIn, setNextTradeIn] = useState<number>(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [tradingService, setTradingService] = useState<TradingService | null>(null);

  // Validation
  const validateConfig = (): string[] => {
    const configErrors = ConfigService.validateConfig(config);
    const walletErrors: string[] = [];
    
    if (wallets.length === 0) {
      walletErrors.push('No hay wallets configurados');
    } else {
      const fundedWallets = wallets.filter(w => w.funded > 0);
      if (fundedWallets.length === 0) {
        walletErrors.push('No hay wallets con fondos disponibles');
      }
    }
    
    return [...configErrors, ...walletErrors];
  };

  useEffect(() => {
    setErrors(validateConfig());
  }, [config, wallets]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && nextTradeIn > 0) {
      interval = setInterval(() => {
        setNextTradeIn(prev => Math.max(0, prev - 1000));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, nextTradeIn]);

  const startTrading = async () => {
    if (errors.length > 0) {
      addLog({ type: 'error', message: 'Corrige los errores de configuración antes de iniciar' });
      return;
    }
    
    setIsRunning(true);
    addLog({ type: 'info', message: 'Iniciando bot de trading con configuración validada...' });
    
    // Crear servicio de trading con configuración actual
    const service = new TradingService(config);
    setTradingService(service);
    
    try {
      await service.startTrading(
        wallets,
        addLog,
        (newStats) => {
          updateStats(newStats);
          // Actualizar wallet actual
          const currentIndex = service.getCurrentWalletIndex();
          const activeWallets = wallets.filter(w => w.funded > 0);
          if (currentIndex < activeWallets.length) {
            setCurrentWallet(activeWallets[currentIndex].address);
          }
        }
      );
    } catch (error) {
      addLog({ 
        type: 'error', 
        message: `Error en trading: ${(error as Error).message}` 
      });
    } finally {
      setIsRunning(false);
      setCurrentWallet(null);
      setTradingService(null);
    }
  };

  const stopTrading = () => {
    if (tradingService) {
      tradingService.stopTrading();
    }
    setIsRunning(false);
    setCurrentWallet(null);
    setNextTradeIn(0);
    addLog({ type: 'info', message: 'Bot de trading detenido por el usuario' });
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 56: return 'BSC';
      case 1: return 'Ethereum';
      case 11155111: return 'Sepolia';
      default: return 'Desconocido';
    }
  };

  const fundedWallets = wallets.filter(w => w.funded > 0);
  const totalFunds = fundedWallets.reduce((sum, w) => sum + w.funded, 0);

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Panel de Trading</h2>
              <p className="text-sm text-dark-400">
                Estado: {isRunning ? 'Activo' : 'Inactivo'} • {fundedWallets.length} wallets listos
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {!isRunning ? (
              <button
                onClick={startTrading}
                disabled={errors.length > 0}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Play className="w-5 h-5" />
                <span>Iniciar Trading</span>
              </button>
            ) : (
              <button
                onClick={stopTrading}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <Square className="w-5 h-5" />
                <span>Detener</span>
              </button>
            )}
          </div>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="font-medium text-red-400">Errores de Configuración</span>
            </div>
            <ul className="text-sm text-red-300 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dark-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-dark-400">Total Trades</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">{stats.totalTrades}</div>
          </div>
          
          <div className="bg-dark-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-dark-400">Exitosos</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{stats.successfulTrades}</div>
          </div>
          
          <div className="bg-dark-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-dark-400">Volumen Total</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">
              {stats.totalVolume.toFixed(4)}
            </div>
          </div>
          
          <div className="bg-dark-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-4 h-4 bg-purple-400 rounded-full"></span>
              <span className="text-sm text-dark-400">Tasa Éxito</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {stats.totalTrades > 0 ? ((stats.successfulTrades / stats.totalTrades) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>
      </motion.div>

      {/* Current Status */}
      {isRunning && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Estado Actual del Trading</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Wallet Activo
              </label>
              <div className="bg-dark-700/50 rounded-lg p-3">
                {currentWallet ? (
                  <code className="text-sm font-mono text-primary-400">
                    {currentWallet}
                  </code>
                ) : (
                  <span className="text-dark-400">Preparando...</span>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Próximo Trade en
              </label>
              <div className="bg-dark-700/50 rounded-lg p-3">
                <span className="text-lg font-mono text-yellow-400">
                  {formatTime(nextTradeIn)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-dark-400 mb-2">
              <span>Progreso del Ciclo</span>
              <span>{fundedWallets.length} wallets con fondos</span>
            </div>
            <div className="w-full bg-dark-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${currentWallet ? 
                    ((fundedWallets.findIndex(w => w.address === currentWallet) + 1) / fundedWallets.length) * 100 : 0
                  }%` 
                }}
              ></div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Configuration Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Resumen de Configuración Validada</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <label className="text-dark-400">Token Objetivo:</label>
            <div className="font-mono text-primary-400 truncate">
              {config.targetTokenAddress || 'No configurado'}
            </div>
          </div>
          
          <div>
            <label className="text-dark-400">Blockchain:</label>
            <div className="text-white">
              {getChainName(config.chainId)} ({config.testVersion ? 'Testnet' : 'Mainnet'})
            </div>
          </div>
          
          <div>
            <label className="text-dark-400">Wallets Configurados:</label>
            <div className="text-white">{wallets.length} total • {fundedWallets.length} con fondos</div>
          </div>
          
          <div>
            <label className="text-dark-400">Fondos Totales:</label>
            <div className="text-green-400 font-medium">
              {totalFunds.toFixed(6)} ETH
            </div>
          </div>
          
          <div>
            <label className="text-dark-400">Rango de Cantidad:</label>
            <div className="text-white">
              {config.amountMin} - {config.amountMax} ETH
            </div>
          </div>
          
          <div>
            <label className="text-dark-400">Intervalo de Trading:</label>
            <div className="text-white">
              {config.minInterval/1000}s - {config.maxInterval/1000}s
            </div>
          </div>
          
          <div>
            <label className="text-dark-400">Fee de Reserva:</label>
            <div className="text-yellow-400">
              {config.fee} ETH por wallet
            </div>
          </div>
          
          <div>
            <label className="text-dark-400">RPC Configurado:</label>
            <div className="text-white">
              {config.chainId === 56 && config.rpcEndpoints.bsc ? '✅ BSC' :
               config.chainId === 1 && config.rpcEndpoints.eth ? '✅ Ethereum' :
               config.chainId === 11155111 && config.rpcEndpoints.sepolia ? '✅ Sepolia' :
               '❌ No configurado'}
            </div>
          </div>
          
          <div>
            <label className="text-dark-400">Estado de Configuración:</label>
            <div className={errors.length === 0 ? 'text-green-400' : 'text-red-400'}>
              {errors.length === 0 ? '✅ Válida' : `❌ ${errors.length} errores`}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TradingPanel;