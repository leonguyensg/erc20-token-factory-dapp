# 🏭 ERC20 Token Factory dApp

A complete decentralized application for creating, verifying, and managing ERC20 tokens on BSC and Ethereum networks.

## ✨ Features

### 🎯 Core Functionality
- **Token Creation**: Deploy custom ERC20 tokens with configurable parameters
- **Contract Verification**: Automatic source code verification on block explorers
- **Token Management**: Transfer, mint, and burn operations
- **Multi-Network**: Support for BSC, Ethereum, and testnets
- **Modern UI**: Clean, responsive interface with Bootstrap styling

### 🔧 Advanced Features
- **Smart Contract Address Extraction**: Automatically extracts deployed contract addresses
- **Explorer Integration**: Direct links to transactions and contracts
- **Wallet Integration**: MetaMask connection with network switching
- **Error Handling**: Comprehensive validation and user feedback
- **Copy-to-Clipboard**: Easy sharing of contract addresses and transaction hashes
- **Environment Configuration**: Flexible configuration through environment variables
- **Multi-Network Support**: Easy switching between different blockchain networks

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MetaMask browser extension
- BSC/ETH testnet tokens for gas fees

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd token-factory

# Install dependencies
npm install
cd frontend && npm install

# Start the frontend
npm start
```

The app will be available at `http://localhost:3000`

### Configuration

1. **Environment Setup**: Copy and configure environment variables
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env file with your configuration
   ```

2. **Required Environment Variables**:
   ```bash
   # Factory contract address (required)
   REACT_APP_FACTORY_ADDRESS=0x24abbea534Af99b6304640930c4CBf60d473D077
   
   # Network configuration
   REACT_APP_NETWORK_NAME=BSC Testnet
   REACT_APP_CHAIN_ID=97
   REACT_APP_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
   
   # API keys for contract verification (optional)
   REACT_APP_BSCSCAN_API_KEY=your_api_key_here
   REACT_APP_ETHERSCAN_API_KEY=your_api_key_here
   ```

3. **Network Setup**: Configure MetaMask for BSC Testnet
   - RPC URL: `https://data-seed-prebsc-1-s1.binance.org:8545/`
   - Chain ID: `97`
   - Currency: `BNB`

## 🏗️ Factory Contract

**Deployed Address**: `0x24abbea534Af99b6304640930c4CBf60d473D077`  
**Network**: BSC Testnet (Chain ID: 97)  
**Explorer**: [View on BSCScan](https://testnet.bscscan.com/address/0x24abbea534Af99b6304640930c4CBf60d473D077)

## 📱 User Interface

### Navigation Menu
1. **Create New Token** - Deploy custom ERC20 contracts
2. **Verify Token** - Submit source code for verification
3. **Transfer** - Send tokens between addresses
4. **Mint Token** - Create new tokens (owner only)
5. **Burn Token** - Destroy tokens from supply

### Supported Token Features
- ✅ **Basic ERC20**: Standard transfer functionality
- ✅ **Mintable**: Owner can create new tokens
- ✅ **Burnable**: Holders can destroy their tokens
- ✅ **Pausable**: Owner can pause all transfers
- ✅ **Custom Decimals**: Configure decimal places (1-18)

## 🔧 Technical Stack

### Smart Contracts
- **Solidity**: Contract development
- **Hardhat**: Development framework
- **OpenZeppelin**: Security-audited contract libraries

### Frontend
- **React**: UI framework
- **Ethers.js v6**: Blockchain interaction
- **Bootstrap**: Responsive styling
- **MetaMask**: Wallet integration

### Verification
- **BSCScan API**: BSC contract verification

## 📊 Contract Architecture

```
Erc20TokenFactory.sol
├── createToken() - Deploy new ERC20 tokens
├── getDeployedTokens() - List all created tokens
└── Events: TokenCreated(address, string, string)

ERC20Custom.sol (Template)
├── Standard ERC20 functions
├── Mintable functionality
├── Burnable functionality
└── Pausable functionality
```

## 🧪 Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing instructions.

### Quick Test
1. Connect MetaMask to BSC Testnet
2. Navigate to "Create New Token"
3. Fill form and create token
4. Copy contract address
5. Test transfer/mint/burn operations

## 🔐 Security

### Smart Contract Security
- ✅ OpenZeppelin library usage
- ✅ Owner-only mint functionality
- ✅ Pausable emergency stops
- ✅ Input validation

### Frontend Security
- ✅ Address validation
- ✅ Amount validation
- ✅ Transaction confirmation
- ✅ Error boundary handling

## 🚀 Deployment

### Smart Contract Deployment
```bash
# Compile contracts
npx hardhat compile

# Deploy to testnet
npx hardhat run scripts/deploy.js --network bsc_testnet

# Verify contract (optional)
npx hardhat verify --network bsc_testnet <contract_address> <constructor_args>
```

### Frontend Deployment
```bash
# Build for production
cd frontend
npm run build

# Deploy to hosting service (Vercel, Netlify, etc.)
```

## 🛠️ Development

### Project Structure
```
token-factory/
├── contracts/          # Solidity smart contracts
├── scripts/            # Deployment scripts
├── test/               # Contract tests
├── frontend/           # React application
│   ├── src/components/ # UI components
│   ├── src/utils/      # Utility functions
│   └── src/abi/        # Contract ABIs
└── artifacts/          # Compiled contracts
```


## 📈 Roadmap

### Completed ✅
- [x] Token factory deployment
- [x] Multi-feature UI with navigation
- [x] Contract verification system
- [x] Token management operations
- [x] Error handling and validation
- [x] Responsive design

### Future Enhancements 🔮
- [ ] Multi-chain deployment (Polygon, Avalanche)
- [ ] Token analytics dashboard
- [ ] Liquidity pool creation integration
- [ ] Token vesting contracts
- [ ] DAO governance features
- [ ] NFT collection factory

```
npx hardhat run scripts/deploy.js --network bscTestnet
```

Erc20TokenFactory deployed to: 0x24abbea534Af99b6304640930c4CBf60d473D077