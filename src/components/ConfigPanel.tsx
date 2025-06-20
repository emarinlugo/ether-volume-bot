import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Globe, Wallet, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { BotConfig } from '../types';
import { ConfigService } from '../services/configService';

interface ConfigPanelProps {
  config: BotConfig;
  setConfig: (config: BotConfig) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, setConfig }) => {
  const updateConfig = (field: keyof BotConfig, value: any) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    ConfigService.saveConfig(newConfig);
  };

  const updateRpcEndpoint = (chain: keyof BotConfig['rpcEndpoints'], value: string) => {
    const newConfig = {
      ...config,
      rpcEndpoints: {
        ...config.rpcEndpoints,
        [chain]: value
      }
    };
    setConfig(newConfig);
    ConfigService.saveConfig(newConfig);
  };

  const chains = [
    { id: 56, name: 'Binance Smart Chain', symbol: 'BNB' },
    { id: 1, name: 'Ethereum', symbol: 'ETH' },
    { id: 11155111, name: 'Sepolia Testnet', symbol: 'SepoliaETH' }
  ];

  const validationErrors = ConfigService.validateConfig(config);
  const isConfigValid = validationErrors.length === 0;

  const downloadEnvFile = () => {
    ConfigService.downloadEnvFile(config);
  };

  const downloadBotConfig = () => {
    ConfigService.downloadBotConfig(config);
  };

  return (
    <div className="space-y-6">
      {/* Validation Status */}
      {validationErrors.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-xl p-6 border-l-4 border-red-500"
        >
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold text-red-400">Errores de Configuración</h3>
          </div>
          <ul className="space-y-2">
            {validationErrors.map((error, index) => (
              <li key={index} className="text-sm text-red-300 flex items-center space-x-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {isConfigValid && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-xl p-6 border-l-4 border-green-500"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <h3 className="text-lg font-semibold text-green-400">Configuración Válida</h3>
                <p className="text-sm text-dark-400">Todos los parámetros están correctamente configurados</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={downloadEnvFile}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Descargar .env</span>
              </button>
              <button
                onClick={downloadBotConfig}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Descargar config.ts</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Token Configuration */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold">Configuración del Token</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Dirección del Token Objetivo *
            </label>
            <input
              type="text"
              value={config.targetTokenAddress}
              onChange={(e) => updateConfig('targetTokenAddress', e.target.value)}
              placeholder="0x..."
              className={`w-full px-4 py-3 bg-dark-700/50 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-dark-400 ${
                config.targetTokenAddress && !/^0x[a-fA-F0-9]{40}$/.test(config.targetTokenAddress) 
                  ? 'border-red-500' 
                  : 'border-dark-600'
              }`}
            />
            {config.targetTokenAddress && !/^0x[a-fA-F0-9]{40}$/.test(config.targetTokenAddress) && (
              <p className="text-xs text-red-400 mt-1">Dirección inválida</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Blockchain *
            </label>
            <select
              value={config.chainId}
              onChange={(e) => updateConfig('chainId', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
            >
              {chains.map(chain => (
                <option key={chain.id} value={chain.id}>
                  {chain.name} ({chain.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Wallet Configuration */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold">Configuración de Wallet Principal</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Dirección de Wallet Base *
            </label>
            <input
              type="text"
              value={config.baseWalletAddress}
              onChange={(e) => updateConfig('baseWalletAddress', e.target.value)}
              placeholder="0x..."
              className={`w-full px-4 py-3 bg-dark-700/50 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-dark-400 ${
                config.baseWalletAddress && !/^0x[a-fA-F0-9]{40}$/.test(config.baseWalletAddress) 
                  ? 'border-red-500' 
                  : 'border-dark-600'
              }`}
            />
            {config.baseWalletAddress && !/^0x[a-fA-F0-9]{40}$/.test(config.baseWalletAddress) && (
              <p className="text-xs text-red-400 mt-1">Dirección inválida</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Clave Privada de Wallet Base *
            </label>
            <input
              type="password"
              value={config.baseWalletPrivateKey}
              onChange={(e) => updateConfig('baseWalletPrivateKey', e.target.value)}
              placeholder="0x..."
              className={`w-full px-4 py-3 bg-dark-700/50 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-dark-400 ${
                config.baseWalletPrivateKey && !/^0x[a-fA-F0-9]{64}$/.test(config.baseWalletPrivateKey) 
                  ? 'border-red-500' 
                  : 'border-dark-600'
              }`}
            />
            {config.baseWalletPrivateKey && !/^0x[a-fA-F0-9]{64}$/.test(config.baseWalletPrivateKey) && (
              <p className="text-xs text-red-400 mt-1">Clave privada inválida (debe ser 64 caracteres hex)</p>
            )}
            <p className="text-xs text-dark-400 mt-1">
              <Shield className="w-3 h-3 inline mr-1" />
              Tu clave privada se almacena localmente y nunca se envía a servidores externos
            </p>
          </div>
        </div>
      </motion.div>

      {/* Trading Parameters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-effect rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">₿</span>
          </div>
          <h2 className="text-xl font-semibold">Parámetros de Trading</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Número de Sub-Wallets *
            </label>
            <input
              type="number"
              value={config.subWalletNum}
              onChange={(e) => updateConfig('subWalletNum', parseInt(e.target.value) || 0)}
              min="1"
              max="100"
              className={`w-full px-4 py-3 bg-dark-700/50 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white ${
                config.subWalletNum <= 0 || config.subWalletNum > 100 ? 'border-red-500' : 'border-dark-600'
              }`}
            />
            {(config.subWalletNum <= 0 || config.subWalletNum > 100) && (
              <p className="text-xs text-red-400 mt-1">Debe estar entre 1 y 100</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Cantidad Mínima (ETH) *
            </label>
            <input
              type="number"
              value={config.amountMin}
              onChange={(e) => updateConfig('amountMin', parseFloat(e.target.value) || 0)}
              step="0.001"
              min="0.001"
              className={`w-full px-4 py-3 bg-dark-700/50 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white ${
                config.amountMin <= 0 ? 'border-red-500' : 'border-dark-600'
              }`}
            />
            {config.amountMin <= 0 && (
              <p className="text-xs text-red-400 mt-1">Debe ser mayor a 0</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Cantidad Máxima (ETH) *
            </label>
            <input
              type="number"
              value={config.amountMax}
              onChange={(e) => updateConfig('amountMax', parseFloat(e.target.value) || 0)}
              step="0.001"
              min="0.001"
              className={`w-full px-4 py-3 bg-dark-700/50 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white ${
                config.amountMax <= config.amountMin ? 'border-red-500' : 'border-dark-600'
              }`}
            />
            {config.amountMax <= config.amountMin && (
              <p className="text-xs text-red-400 mt-1">Debe ser mayor a la cantidad mínima</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Fee de Reserva (ETH) *
            </label>
            <input
              type="number"
              value={config.fee}
              onChange={(e) => updateConfig('fee', parseFloat(e.target.value) || 0)}
              step="0.001"
              min="0.001"
              className={`w-full px-4 py-3 bg-dark-700/50 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white ${
                config.fee <= 0 ? 'border-red-500' : 'border-dark-600'
              }`}
            />
            {config.fee <= 0 && (
              <p className="text-xs text-red-400 mt-1">Debe ser mayor a 0</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Intervalo Mínimo (ms) *
            </label>
            <input
              type="number"
              value={config.minInterval}
              onChange={(e) => updateConfig('minInterval', parseInt(e.target.value) || 0)}
              min="1000"
              step="1000"
              className={`w-full px-4 py-3 bg-dark-700/50 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white ${
                config.minInterval >= config.maxInterval ? 'border-red-500' : 'border-dark-600'
              }`}
            />
            {config.minInterval >= config.maxInterval && (
              <p className="text-xs text-red-400 mt-1">Debe ser menor al intervalo máximo</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Intervalo Máximo (ms) *
            </label>
            <input
              type="number"
              value={config.maxInterval}
              onChange={(e) => updateConfig('maxInterval', parseInt(e.target.value) || 0)}
              min="1000"
              step="1000"
              className={`w-full px-4 py-3 bg-dark-700/50 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white ${
                config.maxInterval <= config.minInterval ? 'border-red-500' : 'border-dark-600'
              }`}
            />
            {config.maxInterval <= config.minInterval && (
              <p className="text-xs text-red-400 mt-1">Debe ser mayor al intervalo mínimo</p>
            )}
          </div>
        </div>
        
        <div className="mt-6">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={config.testVersion}
              onChange={(e) => updateConfig('testVersion', e.target.checked)}
              className="w-5 h-5 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-dark-300">Modo de Prueba (Testnet)</span>
          </label>
        </div>
      </motion.div>

      {/* RPC Configuration */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-effect rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold">Configuración RPC</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Ethereum RPC URL {config.chainId === 1 && '*'}
            </label>
            <input
              type="url"
              value={config.rpcEndpoints.eth}
              onChange={(e) => updateRpcEndpoint('eth', e.target.value)}
              placeholder="https://mainnet.infura.io/v3/..."
              className={`w-full px-4 py-3 bg-dark-700/50 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-dark-400 ${
                config.chainId === 1 && !config.rpcEndpoints.eth ? 'border-red-500' : 'border-dark-600'
              }`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              BSC RPC URL {config.chainId === 56 && '*'}
            </label>
            <input
              type="url"
              value={config.rpcEndpoints.bsc}
              onChange={(e) => updateRpcEndpoint('bsc', e.target.value)}
              placeholder="https://bsc-dataseed.binance.org/"
              className={`w-full px-4 py-3 bg-dark-700/50 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-dark-400 ${
                config.chainId === 56 && !config.rpcEndpoints.bsc ? 'border-red-500' : 'border-dark-600'
              }`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Sepolia RPC URL {config.chainId === 11155111 && '*'}
            </label>
            <input
              type="url"
              value={config.rpcEndpoints.sepolia}
              onChange={(e) => updateRpcEndpoint('sepolia', e.target.value)}
              placeholder="https://sepolia.infura.io/v3/..."
              className={`w-full px-4 py-3 bg-dark-700/50 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-dark-400 ${
                config.chainId === 11155111 && !config.rpcEndpoints.sepolia ? 'border-red-500' : 'border-dark-600'
              }`}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfigPanel;