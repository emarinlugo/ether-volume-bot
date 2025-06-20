import { ethers } from 'ethers';
import { WalletData, BotConfig } from '../types';

export class WalletService {
  static generateWallets(count: number, config: BotConfig): WalletData[] {
    const wallets: WalletData[] = [];
    
    for (let i = 0; i < count; i++) {
      // Generar wallet real usando ethers
      const wallet = ethers.Wallet.createRandom();
      
      // Generar cantidad aleatoria dentro del rango configurado
      const amount = Math.random() * (config.amountMax - config.amountMin) + config.amountMin;
      
      wallets.push({
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic?.phrase || '',
        amount: parseFloat(amount.toFixed(6)),
        funded: 0,
        balance: 0,
        status: 'idle'
      });
    }
    
    return wallets;
  }

  static async saveWalletsToFile(wallets: WalletData[]): Promise<string> {
    const timestamp = Math.floor(Date.now() / 1000);
    const fileName = `wallets/${timestamp}.json`;
    
    try {
      // En un entorno real, esto haría una llamada al backend
      // Por ahora simulamos guardando en localStorage para persistencia
      const walletsData = wallets.map(wallet => ({
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic,
        amount: wallet.amount.toString(),
        funded: wallet.funded
      }));
      
      localStorage.setItem(`wallets_${timestamp}`, JSON.stringify(walletsData));
      localStorage.setItem('latest_wallets_file', fileName);
      
      return fileName;
    } catch (error) {
      throw new Error(`Error guardando wallets: ${error}`);
    }
  }

  static async loadWalletsFromFile(fileName?: string): Promise<WalletData[]> {
    try {
      const fileToLoad = fileName || localStorage.getItem('latest_wallets_file');
      if (!fileToLoad) return [];
      
      const timestamp = fileToLoad.replace('wallets/', '').replace('.json', '');
      const walletsData = localStorage.getItem(`wallets_${timestamp}`);
      
      if (!walletsData) return [];
      
      const parsed = JSON.parse(walletsData);
      return parsed.map((wallet: any) => ({
        ...wallet,
        amount: parseFloat(wallet.amount),
        status: 'idle' as const,
        balance: 0
      }));
    } catch (error) {
      console.error('Error cargando wallets:', error);
      return [];
    }
  }

  static validatePrivateKey(privateKey: string): boolean {
    try {
      new ethers.Wallet(privateKey);
      return true;
    } catch {
      return false;
    }
  }

  static validateAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  static async getBalance(address: string, rpcUrl: string): Promise<number> {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const balance = await provider.getBalance(address);
      return parseFloat(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error obteniendo balance:', error);
      return 0;
    }
  }
}