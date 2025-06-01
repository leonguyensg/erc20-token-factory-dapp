// Environment configuration utility
export const config = {
  // Factory Contract Configuration
  factoryAddress: process.env.REACT_APP_FACTORY_ADDRESS,
  
  // Network Configuration
  networkName: process.env.REACT_APP_NETWORK_NAME || "BSC Testnet",
  chainId: parseInt(process.env.REACT_APP_CHAIN_ID || "97"),
  rpcUrl: process.env.REACT_APP_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545/",
  
  // API Keys for contract verification
  bscscanApiKey: process.env.REACT_APP_BSCSCAN_API_KEY,
  etherscanApiKey: process.env.REACT_APP_ETHERSCAN_API_KEY,
};

// Validation functions
export const validateConfig = () => {
  const errors = [];
  
  if (!config.factoryAddress) {
    errors.push("REACT_APP_FACTORY_ADDRESS is required");
  }
  
  if (config.factoryAddress && !isValidAddress(config.factoryAddress)) {
    errors.push("REACT_APP_FACTORY_ADDRESS is not a valid Ethereum address");
  }
  
  if (isNaN(config.chainId)) {
    errors.push("REACT_APP_CHAIN_ID must be a valid number");
  }
  
  return errors;
};

// Helper function to validate Ethereum addresses
const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Get network specific configuration
export const getNetworkInfo = () => {
  return {
    name: config.networkName,
    chainId: config.chainId,
    rpcUrl: config.rpcUrl,
    factoryAddress: config.factoryAddress
  };
};

// Export individual config values for backwards compatibility
export const {
  factoryAddress,
  networkName,
  chainId,
  rpcUrl,
  bscscanApiKey,
  etherscanApiKey
} = config;
