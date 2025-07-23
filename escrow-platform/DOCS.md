# SafeEscrow Platform Documentation

## 📚 Complete Documentation Guide

### Table of Contents
1. [Project Overview](#project-overview)
2. [Technical Architecture](#technical-architecture)
3. [Smart Contract API](#smart-contract-api)
4. [Frontend Integration](#frontend-integration)
5. [Development Workflow](#development-workflow)
6. [Testing Guide](#testing-guide)
7. [Deployment Guide](#deployment-guide)
8. [Troubleshooting](#troubleshooting)

## Project Overview

### What is SafeEscrow?

SafeEscrow is a revolutionary privacy-preserving escrow platform that combines traditional multi-party escrow mechanics with cutting-edge Fully Homomorphic Encryption (FHE) technology from Zama. This enables secure financial transactions where sensitive information like amounts and approval states remain completely private while still allowing for verification and execution.

### Key Innovations

#### Privacy-First Design
- **Encrypted Amounts**: Transaction values are encrypted using Zama's FHEVM
- **Private Approvals**: Signature states hidden from public view
- **Confidential Computation**: Mathematical operations on encrypted data
- **Selective Transparency**: Public information where needed, private where sensitive

#### Dual Architecture
- **FHEVM Version**: Full privacy preservation for sensitive transactions
- **Standard Version**: Traditional implementation for testing and development
- **Seamless Migration**: Easy upgrade path from standard to private

## Technical Architecture

### Smart Contract Layer

#### FHEVM Implementation (`FHEEscrow.sol`)

```solidity
// Core data structure with encrypted fields
struct Escrow {
    address buyer;                  // Public: Transaction participant
    address seller;                 // Public: Transaction participant
    address arbitrator;             // Public: Neutral party
    euint64 encryptedAmount;        // 🔒 Private: Transaction value
    EscrowState state;              // Public: Current state
    string description;             // Public: Transaction details
    uint256 createdAt;              // Public: Timestamp
    uint256 timeout;                // Public: Deadline
    mapping(address => bool) signatures;     // Public: Signature tracking
    uint256 signatureCount;         // Public: Signature count
    ebool buyerApproval;            // 🔒 Private: Buyer's decision
    ebool sellerApproval;           // 🔒 Private: Seller's decision
    ebool arbitratorDecision;       // 🔒 Private: Arbitrator's decision
}
```

#### State Management

```solidity
enum EscrowState {
    Created,    // 0: Initial state, waiting for funding
    Funded,     // 1: Ready for execution, parties can sign
    Completed,  // 2: Successfully executed, funds released
    Disputed,   // 3: Under arbitration, awaiting resolution
    Cancelled   // 4: Cancelled/refunded, funds returned
}
```

#### Access Control

```solidity
modifier onlyParticipant(uint256 escrowId) {
    require(
        msg.sender == escrows[escrowId].buyer ||
        msg.sender == escrows[escrowId].seller ||
        msg.sender == escrows[escrowId].arbitrator,
        "Not a participant"
    );
    _;
}

modifier validEscrow(uint256 escrowId) {
    require(escrowId < escrowCounter, "Invalid escrow ID");
    _;
}
```

### Frontend Architecture

#### Component Structure
```
src/
├── components/
│   ├── MainInterface.jsx      // Main dashboard
│   ├── EscrowList.jsx         // Transaction list
│   ├── EscrowDetails.jsx      // Individual escrow view
│   ├── CreateEscrow.jsx       // Creation form
│   ├── Header.jsx             // Navigation
│   └── Footer.jsx             // Footer info
├── config/
│   ├── contractConfig.js      // Contract addresses & ABIs
│   └── walletConfig.js        // Wallet connection setup
├── hooks/
│   └── useContract.js         // Contract interaction hook
├── utils/
│   └── contractHelpers.js     // Utility functions
└── providers/
    └── AppKitProvider.jsx     // Wallet provider setup
```

#### State Management

```javascript
// Using React hooks and Wagmi for blockchain state
const { address, isConnected } = useAccount();
const { data: walletClient } = useWalletClient();
const publicClient = usePublicClient();
const chainId = useChainId();

// Contract instance creation
const getContractInstance = () => {
  const config = getContractConfig(chainId);
  return getContract({
    address: config.address,
    abi: CONTRACT_ABI,
    client: walletClient
  });
};
```

## Smart Contract API

### Core Functions

#### FHEVM Version Functions

**Create Escrow**
```solidity
function createEscrow(
    address _seller,
    address _arbitrator,
    externalEuint64 calldata _encryptedAmount,
    string calldata _description,
    uint256 _timeout
) external returns (uint256 escrowId);
```
- Creates new escrow with encrypted amount
- Returns unique escrow ID
- Emits `EscrowCreated` event

**Fund Escrow**
```solidity
function fundEscrow(
    uint256 escrowId,
    externalEuint64 calldata _encryptedAmount
) external payable;
```
- Funds escrow with ETH
- Verifies encrypted amount matches
- Transitions to `Funded` state

**Sign Approval**
```solidity
function signApproval(
    uint256 escrowId,
    externalEbool calldata _approval
) external;
```
- Records encrypted approval from participant
- Updates signature count if approval is true
- Automatically executes if 2/3 signatures collected

#### Simple Version Functions

**Create and Fund Escrow**
```solidity
function createEscrow(
    address _seller,
    address _arbitrator,
    string calldata _description,
    uint256 _timeout
) external payable returns (uint256 escrowId);
```
- Single transaction creation and funding
- Amount taken from `msg.value`
- Immediately ready for signatures

**Sign Approval**
```solidity
function signApproval(uint256 escrowId) external;
```
- Public signature approval
- Automatically executes escrow when 2/3 reached

**Emergency Refund**
```solidity
function emergencyRefund(uint256 escrowId) external;
```
- Buyer-only function after timeout
- Returns funds if no resolution reached

### View Functions

#### Get Escrow Details
```solidity
function getEscrowDetails(uint256 escrowId) 
    external view returns (
        address buyer,
        address seller,
        address arbitrator,
        EscrowState state,
        string memory description,
        uint256 createdAt,
        uint256 timeout,
        uint256 signatureCount,
        uint256 amount  // Only in simple version
    );
```

#### Check Signature Status
```solidity
function hasUserSigned(uint256 escrowId, address user) 
    external view returns (bool);
```

#### Get Encrypted Amount (FHEVM only)
```solidity
function getEncryptedAmount(uint256 escrowId) 
    external view onlyParticipant(escrowId) returns (euint64);
```

## Frontend Integration

### Wallet Connection

#### Setup WalletConnect
```javascript
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';

const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId: 'YOUR_PROJECT_ID',
  networks: [sepolia],
  metadata: {
    name: 'SafeEscrow Platform',
    description: 'Privacy-preserving escrow platform',
    url: 'https://safeescrow.vercel.app',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  }
});
```

#### Connection Hook
```javascript
const WalletConnection = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  
  return (
    <div>
      {isConnected ? (
        <p>Connected: {shortenAddress(address)}</p>
      ) : (
        <button onClick={() => connect({ connector: connectors[0] })}>
          Connect Wallet
        </button>
      )}
    </div>
  );
};
```

### Contract Interaction

#### Create Escrow (Simple Version)
```javascript
const createEscrow = async (formData) => {
  try {
    const contract = getContractInstance();
    const amount = parseEther(formData.amount);
    const timeout = calculateTimeout(formData.timeoutDays);
    
    const tx = await contract.write.createEscrow([
      formData.seller,
      formData.arbitrator,
      formData.description,
      BigInt(timeout)
    ], {
      value: amount,
      gas: 300000n
    });
    
    const receipt = await publicClient.waitForTransactionReceipt({ 
      hash: tx 
    });
    
    // Extract escrow ID from events
    const escrowId = extractEscrowIdFromReceipt(receipt);
    return { tx, escrowId };
  } catch (error) {
    console.error('Failed to create escrow:', error);
    throw error;
  }
};
```

#### Sign Approval
```javascript
const signApproval = async (escrowId) => {
  try {
    const contract = getContractInstance();
    const tx = await contract.write.signApproval([BigInt(escrowId)], {
      gas: 200000n
    });
    
    return tx;
  } catch (error) {
    console.error('Failed to sign approval:', error);
    throw error;
  }
};
```

#### Load User Escrows
```javascript
const loadUserEscrows = async () => {
  try {
    const config = getContractConfig(chainId);
    const totalEscrows = await publicClient.readContract({
      address: config.address,
      abi: CONTRACT_ABI,
      functionName: 'escrowCounter'
    });
    
    const userEscrows = [];
    for (let i = 0; i < Number(totalEscrows); i++) {
      const details = await publicClient.readContract({
        address: config.address,
        abi: CONTRACT_ABI,
        functionName: 'getEscrowDetails',
        args: [BigInt(i)]
      });
      
      // Check if user is participant
      if (isUserParticipant(details, address)) {
        userEscrows.push({
          id: i,
          ...formatEscrowData(details)
        });
      }
    }
    
    return userEscrows.reverse(); // Newest first
  } catch (error) {
    console.error('Failed to load escrows:', error);
    throw error;
  }
};
```

## Development Workflow

### Local Development Setup

#### Environment Configuration
```bash
# Create environment file
cp .env.example .env

# Configure with your settings
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
VITE_SIMPLE_CONTRACT_ADDRESS=0x0CE9a43Cebb0D1b92421F05b338Efd2Af507bb38
VITE_DEFAULT_ARBITRATOR=0xD3d3d1e0a499CaFd2641452f1207Dfe2C5e1DFe8
```

#### Smart Contract Development
```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run local network
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy-simple.js --network localhost

# Run contract tests
npx hardhat test
```

#### Frontend Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Contract Deployment

#### Deploy to Sepolia
```bash
# Deploy simple version
npx hardhat run scripts/deploy-simple.js --network sepolia

# Deploy FHEVM version
npx hardhat run scripts/deploy-fhe-escrow.js --network sepolia

# Verify contract
npx hardhat verify <contract-address> --network sepolia
```

#### Update Configuration
```javascript
// Update src/config/contractConfig.js
export const CONTRACT_CONFIG = {
  11155111: { // Sepolia
    address: 'YOUR_DEPLOYED_ADDRESS',
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY',
    version: 'simple'
  }
};
```

## Testing Guide

### Smart Contract Testing

#### Unit Tests
```javascript
// test/SimpleEscrow.test.js
describe("SimpleEscrow", function () {
  let escrow, owner, buyer, seller, arbitrator;
  
  beforeEach(async function () {
    [owner, buyer, seller, arbitrator] = await ethers.getSigners();
    const SimpleEscrow = await ethers.getContractFactory("SimpleEscrow");
    escrow = await SimpleEscrow.deploy();
  });
  
  it("Should create escrow correctly", async function () {
    const amount = ethers.parseEther("1");
    const description = "Test escrow";
    const timeout = 604800; // 7 days
    
    await expect(
      escrow.connect(buyer).createEscrow(
        seller.address,
        arbitrator.address,
        description,
        timeout,
        { value: amount }
      )
    ).to.emit(escrow, "EscrowCreated");
  });
});
```

#### Integration Tests
```bash
# Test complete escrow lifecycle
npm run test:integration

# Test with different scenarios
npm run test:scenarios
```

### Frontend Testing

#### Component Tests
```javascript
// __tests__/EscrowList.test.jsx
import { render, screen } from '@testing-library/react';
import EscrowList from '../src/components/EscrowList';

test('renders escrow list', () => {
  render(<EscrowList />);
  expect(screen.getByText('My Escrow Transactions')).toBeInTheDocument();
});
```

#### End-to-End Tests
```javascript
// e2e/complete-flow.spec.js
import { test, expect } from '@playwright/test';

test('complete escrow flow', async ({ page }) => {
  await page.goto('http://localhost:5174');
  
  // Connect wallet
  await page.click('[data-testid="connect-wallet"]');
  
  // Create escrow
  await page.fill('[data-testid="seller-address"]', '0x...');
  await page.fill('[data-testid="amount"]', '0.1');
  await page.click('[data-testid="create-escrow"]');
  
  // Verify creation
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

## Troubleshooting

### Common Issues

#### Contract Deployment Fails
```bash
# Check network configuration
npx hardhat verify --list-networks

# Verify RPC endpoint
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  YOUR_RPC_URL

# Check account balance
npx hardhat run scripts/check-balance.js --network sepolia
```

#### Frontend Connection Issues
```javascript
// Debug wallet connection
const { address, isConnected, isConnecting, isDisconnected } = useAccount();
console.log('Wallet state:', { address, isConnected, isConnecting, isDisconnected });

// Check network
const chainId = useChainId();
console.log('Current chain:', chainId);
```

#### Transaction Failures
```javascript
// Add better error handling
try {
  const tx = await contract.write.createEscrow([...args], { gas: 300000n });
} catch (error) {
  if (error.message.includes('insufficient funds')) {
    throw new Error('Insufficient ETH balance');
  } else if (error.message.includes('user rejected')) {
    throw new Error('Transaction cancelled by user');
  } else {
    throw new Error(`Transaction failed: ${error.message}`);
  }
}
```

### Performance Optimization

#### Bundle Size Optimization
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          web3: ['viem', 'wagmi', '@tanstack/react-query']
        }
      }
    }
  }
});
```

#### RPC Rate Limiting
```javascript
// Implement request caching
const cache = new Map();

const cachedRequest = async (key, request) => {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const result = await request();
  cache.set(key, result);
  setTimeout(() => cache.delete(key), 30000); // 30s cache
  
  return result;
};
```

---

## Additional Resources

### Smart Contract Security
- [Consensys Security Best Practices](https://consensys.net/diligence/blog/)
- [OpenZeppelin Security Guidelines](https://docs.openzeppelin.com/contracts/)
- [Slither Static Analysis](https://github.com/crytic/slither)

### Zama FHEVM Resources
- [Official Documentation](https://docs.zama.ai/)
- [FHEVM Examples](https://docs.zama.ai/protocol/examples)
- [Community Discord](https://discord.com/invite/zama)

### React/Web3 Development
- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [WalletConnect Documentation](https://docs.walletconnect.com/)

---

*This documentation is continuously updated as the project evolves. For the latest information, always refer to the source code and commit history.*