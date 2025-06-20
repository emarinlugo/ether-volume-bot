import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Plus, Trash2, RefreshCw, Eye, EyeOff, Copy, CheckCircle, Download, Upload } from 'lucide-react';
import { WalletData, BotConfig, TradingLog } from '../types';
import { WalletService } from '../services/walletService';

interface WalletManagerProps {
  wallets: WalletData[];
  setWallets: (wallets: WalletData[]) => void;
  config: BotConfig;
  addLog: (log: Omit<TradingLog, 'id' | 'timestamp'>) => void;
}

const WalletManager: React.FC<WalletManagerProps> = ({ wallets, setWallets, config, addLog }) => {
  const [showPrivateKeys, setShowPrivateKeys] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const generateWallets = async () => {
    if (config.subWalletNum <= 0) {
      addLog({ type: 'error', message: 'Configura el número de wallets antes de generar' });
      return;
    }

    setIsGenerating(true);
    addLog({ type: 'info', message: `Generando ${config.subWalletNum} wallets reales...` });
    
    try {
      // Generar wallets reales usando ethers
      const newWallets = WalletService.generateWallets(config.subWalletNum, config);
      
      // Guardar wallets
      const fileName = await WalletService.saveWalletsToFile(newWallets);
      
      setWallets(newWallets);
      addLog({ 
        type: 'success', 
        message: `${config.subWalletNum} wallets reales generados y guardados en ${fileName}` 
      });
    } catch (error) {
      addLog({ 
        type: 'error', 
        message: 'Error al generar wallets: ' + (error as Error).message 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const loadWallets = async () => {
    setIsLoading(true);
    try {
      const loadedWallets = await WalletService.loadWalletsFromFile();
      if (loadedWallets.length > 0) {
        setWallets(loadedWallets);
        addLog({ 
          type: 'success', 
          message: `${loadedWallets.length} wallets cargados desde archivo` 
        });
      } else {
        addLog({ type: 'warning', message: 'No se encontraron wallets guardados' });
      }
    } catch (error) {
      addLog({ 
        type: 'error', 
        message: 'Error cargando wallets: ' + (error as Error).message 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportWallets = () => {
    if (wallets.length === 0) {
      addLog({ type: 'warning', message: 'No hay wallets para exportar' });
      return;
    }

    const dataStr = JSON.stringify(wallets, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `volume-bot-wallets-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    addLog({ type: 'success', message: `Wallets exportados a ${exportFileDefaultName}` });
  };

  const deleteWallet = (index: number) => {
    const newWallets = wallets.filter((_, i) => i !== index);
    setWallets(newWallets);
    addLog({ type: 'info', message: `Wallet eliminado` });
  };

  const copyToClipboard = async (text: string, address: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const validateWallet = (wallet: WalletData): boolean => {
    return WalletService.validateAddress(wallet.address) && 
           WalletService.validatePrivateKey(wallet.privateKey);
  };

  const getStatusColor = (status: WalletData['status']) => {
    switch (status) {
      case 'idle': return 'bg-gray-500';
      case 'funding': return 'bg-yellow-500';
      case 'trading': return 'bg-blue-500';
      case 'gathering': return 'bg-purple-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: WalletData['status']) => {
    switch (status) {
      case 'idle': return 'Inactivo';
      case 'funding': return 'Financiando';
      case 'trading': return 'Operando';
      case 'gathering': return 'Recolectando';
      case 'error': return 'Error';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Gestión de Wallets</h2>
              <p className="text-sm text-dark-400">
                {wallets.length} wallets configurados • {wallets.filter(validateWallet).length} válidos
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPrivateKeys(!showPrivateKeys)}
              className="flex items-center space-x-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
            >
              {showPrivateKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-sm">
                {showPrivateKeys ? 'Ocultar' : 'Mostrar'} Claves
              </span>
            </button>

            <button
              onClick={loadWallets}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span className="text-sm">Cargar</span>
            </button>

            <button
              onClick={exportWallets}
              disabled={wallets.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Exportar</span>
            </button>
            
            <button
              onClick={generateWallets}
              disabled={isGenerating || config.subWalletNum <= 0}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span className="text-sm">
                {isGenerating ? 'Generando...' : 'Generar Wallets'}
              </span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dark-700/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-primary-400">
              {wallets.length}
            </div>
            <div className="text-sm text-dark-400">Total Wallets</div>
          </div>
          
          <div className="bg-dark-700/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">
              {wallets.filter(w => w.funded > 0).length}
            </div>
            <div className="text-sm text-dark-400">Financiados</div>
          </div>
          
          <div className="bg-dark-700/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">
              {wallets.filter(w => w.status === 'trading').length}
            </div>
            <div className="text-sm text-dark-400">Activos</div>
          </div>
          
          <div className="bg-dark-700/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {wallets.reduce((sum, w) => sum + w.funded, 0).toFixed(4)}
            </div>
            <div className="text-sm text-dark-400">ETH Total</div>
          </div>
        </div>
      </motion.div>

      {/* Wallets List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Lista de Wallets</h3>
        
        {wallets.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="w-16 h-16 text-dark-500 mx-auto mb-4" />
            <p className="text-dark-400 mb-4">No hay wallets configurados</p>
            <button
              onClick={generateWallets}
              disabled={config.subWalletNum <= 0}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-lg transition-colors"
            >
              Generar Wallets Reales
            </button>
            {config.subWalletNum <= 0 && (
              <p className="text-xs text-red-400 mt-2">
                Configura el número de wallets en la pestaña de Configuración
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            <AnimatePresence>
              {wallets.map((wallet, index) => {
                const isValid = validateWallet(wallet);
                return (
                  <motion.div
                    key={wallet.address}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`bg-dark-700/30 rounded-lg p-4 border ${
                      isValid ? 'border-dark-600' : 'border-red-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(wallet.status)}`}></div>
                          <span className="text-sm font-medium">Wallet #{index + 1}</span>
                          <span className="text-xs text-dark-400">{getStatusText(wallet.status)}</span>
                          {!isValid && (
                            <span className="text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded">
                              ⚠️ Inválido
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <label className="text-dark-400">Dirección:</label>
                            <div className="flex items-center space-x-2 mt-1">
                              <code className="bg-dark-800 px-2 py-1 rounded text-xs font-mono truncate">
                                {wallet.address}
                              </code>
                              <button
                                onClick={() => copyToClipboard(wallet.address, wallet.address)}
                                className="p-1 hover:bg-dark-600 rounded transition-colors"
                              >
                                {copiedAddress === wallet.address ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4 text-dark-400" />
                                )}
                              </button>
                            </div>
                          </div>
                          
                          {showPrivateKeys && (
                            <div>
                              <label className="text-dark-400">Clave Privada:</label>
                              <div className="flex items-center space-x-2 mt-1">
                                <code className="bg-dark-800 px-2 py-1 rounded text-xs font-mono truncate">
                                  {wallet.privateKey}
                                </code>
                                <button
                                  onClick={() => copyToClipboard(wallet.privateKey, wallet.address + '_pk')}
                                  className="p-1 hover:bg-dark-600 rounded transition-colors"
                                >
                                  {copiedAddress === wallet.address + '_pk' ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-dark-400" />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                          
                          <div>
                            <label className="text-dark-400">Cantidad Asignada:</label>
                            <div className="text-primary-400 font-medium">
                              {wallet.amount.toFixed(6)} ETH
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-dark-400">Fondos:</label>
                            <div className="text-green-400 font-medium">
                              {wallet.funded.toFixed(6)} ETH
                            </div>
                          </div>

                          {wallet.mnemonic && (
                            <div className="md:col-span-2">
                              <label className="text-dark-400">Mnemonic:</label>
                              <div className="text-xs text-dark-300 bg-dark-800 p-2 rounded mt-1 font-mono">
                                {showPrivateKeys ? wallet.mnemonic : '••• ••• ••• •••'}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => deleteWallet(index)}
                        className="ml-4 p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default WalletManager;