import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Filter, Download, Trash2, Search } from 'lucide-react';
import { TradingLog } from '../types';

interface LogsPanelProps {
  logs: TradingLog[];
}

const LogsPanel: React.FC<LogsPanelProps> = ({ logs }) => {
  const [filter, setFilter] = useState<'all' | 'info' | 'success' | 'warning' | 'error'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.type === filter;
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.walletAddress && log.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getLogIcon = (type: TradingLog['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getLogColor = (type: TradingLog['type']) => {
    switch (type) {
      case 'success': return 'text-green-400 border-green-500/30 bg-green-500/10';
      case 'error': return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'warning': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      default: return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    }
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `volume-bot-logs-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const clearLogs = () => {
    if (confirm('¿Estás seguro de que quieres limpiar todos los logs?')) {
      // This would need to be implemented in the parent component
      console.log('Clear logs requested');
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
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Logs del Sistema</h2>
              <p className="text-sm text-dark-400">
                {filteredLogs.length} de {logs.length} logs mostrados
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={exportLogs}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Exportar</span>
            </button>
            
            <button
              onClick={clearLogs}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">Limpiar</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="text"
                placeholder="Buscar en logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-700/50 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-dark-400"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-dark-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 bg-dark-700/50 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
            >
              <option value="all">Todos</option>
              <option value="info">Info</option>
              <option value="success">Éxito</option>
              <option value="warning">Advertencia</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Logs List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect rounded-xl p-6"
      >
        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-dark-500 mx-auto mb-4" />
              <p className="text-dark-400">No hay logs que mostrar</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`border rounded-lg p-4 ${getLogColor(log.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{getLogIcon(log.type)}</span>
                      <span className="text-sm font-medium">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                      {log.walletAddress && (
                        <code className="text-xs bg-dark-800 px-2 py-1 rounded font-mono">
                          {log.walletAddress.slice(0, 8)}...
                        </code>
                      )}
                    </div>
                    
                    <p className="text-sm mb-2">{log.message}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-dark-400">
                      <span>{log.timestamp.toLocaleDateString()}</span>
                      {log.txHash && (
                        <code className="bg-dark-800 px-2 py-1 rounded font-mono">
                          Tx: {log.txHash.slice(0, 10)}...
                        </code>
                      )}
                      {log.amount && (
                        <span>Cantidad: {log.amount.toFixed(6)} ETH</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LogsPanel;