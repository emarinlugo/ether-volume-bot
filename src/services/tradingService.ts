import { ethers } from 'ethers';
import { BotConfig, WalletData, TradingLog } from '../types';

export class TradingService {
  private config: BotConfig;
  private isRunning: boolean = false;
  private currentWalletIndex: number = 0;

  constructor(config: BotConfig) {
    this.config = config;
  }

  async startTrading(
    wallets: WalletData[],
    onLog: (log: Omit<TradingLog, 'id' | 'timestamp'>) => void,
    onStatsUpdate: (stats: any) => void
  ): Promise<void> {
    this.isRunning = true;
    this.currentWalletIndex = 0;

    onLog({ type: 'info', message: 'Iniciando bot de trading...' });

    try {
      const activeWallets = wallets.filter(w => w.funded > 0);
      
      if (activeWallets.length === 0) {
        throw new Error('No hay wallets con fondos disponibles');
      }

      for (let i = 0; i < activeWallets.length && this.isRunning; i++) {
        this.currentWalletIndex = i;
        const wallet = activeWallets[i];

        await this.processWalletTrading(wallet, onLog, onStatsUpdate);
        
        if (i < activeWallets.length - 1) {
          const delay = this.getRandomDelay();
          onLog({ 
            type: 'info', 
            message: `Esperando ${delay/1000}s antes del siguiente wallet...` 
          });
          await this.delay(delay);
        }
      }

      onLog({ type: 'success', message: 'Ciclo de trading completado exitosamente' });
    } catch (error) {
      onLog({ 
        type: 'error', 
        message: `Error en trading: ${(error as Error).message}` 
      });
    } finally {
      this.isRunning = false;
    }
  }

  stopTrading(): void {
    this.isRunning = false;
  }

  private async processWalletTrading(
    wallet: WalletData,
    onLog: (log: Omit<TradingLog, 'id' | 'timestamp'>) => void,
    onStatsUpdate: (stats: any) => void
  ): Promise<void> {
    try {
      // Simular compra
      onLog({
        type: 'info',
        message: `Comprando tokens con wallet ${wallet.address.slice(0, 8)}...`,
        walletAddress: wallet.address,
        amount: wallet.amount
      });

      const buyTxHash = await this.simulateBuyTransaction(wallet);
      
      onLog({
        type: 'success',
        message: `Compra exitosa`,
        walletAddress: wallet.address,
        txHash: buyTxHash,
        amount: wallet.amount
      });

      // Delay entre compra y venta
      const tradeDelay = this.getRandomDelay();
      onLog({
        type: 'info',
        message: `Esperando ${tradeDelay/1000}s antes de vender...`
      });
      await this.delay(tradeDelay);

      // Simular venta
      onLog({
        type: 'info',
        message: `Vendiendo tokens con wallet ${wallet.address.slice(0, 8)}...`,
        walletAddress: wallet.address
      });

      const sellTxHash = await this.simulateSellTransaction(wallet);
      
      onLog({
        type: 'success',
        message: `Venta exitosa`,
        walletAddress: wallet.address,
        txHash: sellTxHash
      });

      // Actualizar estadísticas
      onStatsUpdate({
        totalTrades: 2,
        successfulTrades: 2,
        totalVolume: wallet.amount * 2
      });

    } catch (error) {
      onLog({
        type: 'error',
        message: `Error procesando wallet ${wallet.address.slice(0, 8)}: ${(error as Error).message}`,
        walletAddress: wallet.address
      });
    }
  }

  private async simulateBuyTransaction(wallet: WalletData): Promise<string> {
    // En producción, aquí iría la lógica real de compra
    await this.delay(2000); // Simular tiempo de transacción
    return `0x${Math.random().toString(16).substr(2, 64)}`;
  }

  private async simulateSellTransaction(wallet: WalletData): Promise<string> {
    // En producción, aquí iría la lógica real de venta
    await this.delay(2000); // Simular tiempo de transacción
    return `0x${Math.random().toString(16).substr(2, 64)}`;
  }

  private getRandomDelay(): number {
    return Math.floor(Math.random() * (this.config.maxInterval - this.config.minInterval + 1)) + this.config.minInterval;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getCurrentWalletIndex(): number {
    return this.currentWalletIndex;
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }
}