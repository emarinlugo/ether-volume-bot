export interface BotConfig {
  targetTokenAddress: string;
  baseWalletAddress: string;
  baseWalletPrivateKey: string;
  chainId: number;
  subWalletNum: number;
  amountMin: number;
  amountMax: number;
  fee: number;
  minInterval: number;
  maxInterval: number;
  testVersion: boolean;
  rpcEndpoints: {
    eth: string;
    bsc: string;
    sepolia: string;
  };
}

export interface WalletData {
  address: string;
  privateKey: string;
  mnemonic: string;
  amount: number;
  funded: number;
  balance?: number;
  status: 'idle' | 'funding' | 'trading' | 'gathering' | 'error';
}

export interface TradingLog {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  walletAddress?: string;
  txHash?: string;
  amount?: number;
}

export interface TradingStats {
  totalTrades: number;
  successfulTrades: number;
  totalVolume: number;
  activeWallets: number;
}

export enum ChainId {
  BSC = 56,
  Ethereum = 1,
  Sepolia = 11155111,
}

export interface ChainConfig {
  name: string;
  symbol: string;
  rpcUrl: string;
  explorerUrl: string;
  routerAddress: string;
  wrappedNativeAddress: string;
}