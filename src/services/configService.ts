import { BotConfig } from '../types';

export class ConfigService {
  private static readonly CONFIG_KEY = 'volumeBotConfig';
  private static readonly ENV_CONFIG_KEY = 'volumeBotEnvConfig';

  static saveConfig(config: BotConfig): void {
    try {
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      throw new Error(`Error guardando configuración: ${error}`);
    }
  }

  static loadConfig(): BotConfig | null {
    try {
      const saved = localStorage.getItem(this.CONFIG_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error cargando configuración:', error);
      return null;
    }
  }

  static validateConfig(config: BotConfig): string[] {
    const errors: string[] = [];

    // Validar dirección del token
    if (!config.targetTokenAddress) {
      errors.push('Dirección del token objetivo es requerida');
    } else if (!this.isValidAddress(config.targetTokenAddress)) {
      errors.push('Dirección del token objetivo no es válida');
    }

    // Validar wallet base
    if (!config.baseWalletAddress) {
      errors.push('Dirección de wallet base es requerida');
    } else if (!this.isValidAddress(config.baseWalletAddress)) {
      errors.push('Dirección de wallet base no es válida');
    }

    // Validar clave privada
    if (!config.baseWalletPrivateKey) {
      errors.push('Clave privada de wallet base es requerida');
    } else if (!this.isValidPrivateKey(config.baseWalletPrivateKey)) {
      errors.push('Clave privada de wallet base no es válida');
    }

    // Validar parámetros numéricos
    if (config.amountMin <= 0) {
      errors.push('Cantidad mínima debe ser mayor a 0');
    }

    if (config.amountMax <= config.amountMin) {
      errors.push('Cantidad máxima debe ser mayor a la mínima');
    }

    if (config.fee <= 0) {
      errors.push('Fee debe ser mayor a 0');
    }

    if (config.subWalletNum <= 0 || config.subWalletNum > 100) {
      errors.push('Número de sub-wallets debe estar entre 1 y 100');
    }

    if (config.minInterval >= config.maxInterval) {
      errors.push('Intervalo mínimo debe ser menor al máximo');
    }

    // Validar RPCs
    if (!config.rpcEndpoints.eth && config.chainId === 1) {
      errors.push('RPC de Ethereum es requerido para la red seleccionada');
    }

    if (!config.rpcEndpoints.bsc && config.chainId === 56) {
      errors.push('RPC de BSC es requerido para la red seleccionada');
    }

    if (!config.rpcEndpoints.sepolia && config.chainId === 11155111) {
      errors.push('RPC de Sepolia es requerido para la red seleccionada');
    }

    return errors;
  }

  static generateEnvFile(config: BotConfig): string {
    const envContent = `# Volume Bot Configuration
TARGET_TOKEN_ADDRESS=${config.targetTokenAddress}
ETH_BASE_WALLET_ADDRESS=${config.baseWalletAddress}
ETH_BASE_WALLET_PRIVATE_KEY=${config.baseWalletPrivateKey}

# RPC Endpoints
ETH_RPC_ENDPOINT=${config.rpcEndpoints.eth}
BSC_RPC_ENDPOINT=${config.rpcEndpoints.bsc}
ETH_SEPOLIA_RPC_ENDPOINT=${config.rpcEndpoints.sepolia}
MEV_BLOCK_RPC_ENDPOINT=${config.rpcEndpoints.eth}

# Generated at ${new Date().toISOString()}
`;
    return envContent;
  }

  static generateBotConfig(config: BotConfig): string {
    const configContent = `import { ChainId } from "./types";

export const testVersion = ${config.testVersion};

// Random time interval of buy and sell
export const maxInterval = ${config.maxInterval}; // millisecond
export const minInterval = ${config.minInterval}; // millisecond

// Random amount for wallet
export const amountMax = ${config.amountMax}; // Ether balance
export const amountMin = ${config.amountMin}; // Should be more than 0.001

// Fee balance that must be remaining in the wallet
export const fee = ${config.fee}; // Must be greater than 0.001

// Number of sub wallets
export const subWalletNum = ${config.subWalletNum};

// ChainId : Sepolia, BSC, Ethereum
export const CHAINID: ChainId = ChainId.${config.chainId === 56 ? 'BSC' : config.chainId === 1 ? 'Ethereum' : 'Sepolia'};
`;
    return configContent;
  }

  private static isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  private static isValidPrivateKey(privateKey: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(privateKey);
  }

  static downloadEnvFile(config: BotConfig): void {
    const envContent = this.generateEnvFile(config);
    const blob = new Blob([envContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static downloadBotConfig(config: BotConfig): void {
    const configContent = this.generateBotConfig(config);
    const blob = new Blob([configContent], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.ts';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}