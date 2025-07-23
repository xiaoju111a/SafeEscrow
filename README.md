# SafeEscrow Platform

A privacy-preserving escrow platform built with Zama's Fully Homomorphic Encryption Virtual Machine (FHEVM) technology, enabling secure multi-party transactions with encrypted amounts and approval states.

## 🔐 Privacy-First Escrow

SafeEscrow leverages **Zama's FHEVM** to provide unprecedented privacy protection for escrow transactions while maintaining full functionality and transparency where needed.

## ✨ Features

### Core Functionality
- **2/3 Multi-Signature Escrow**: Secure transactions requiring 2 out of 3 parties (buyer, seller, arbitrator)
- **Privacy Protection**: Transaction amounts and approval states encrypted using Zama's FHE technology
- **Dispute Resolution**: Built-in arbitration mechanism for handling transaction disputes
- **Timeout Protection**: Emergency refund mechanism for buyers after timeout periods
- **Real-time Status**: Live transaction monitoring and status updates

### Privacy Features (Powered by Zama FHEVM)
- **Encrypted Amounts**: Transaction values hidden from public view using homomorphic encryption
- **Private Approvals**: Signature states encrypted to prevent front-running and manipulation
- **Confidential Disputes**: Dispute reasons and arbitration decisions kept private
- **Zero-Knowledge Proofs**: Verify transaction validity without revealing sensitive data

## 🏗 Architecture

### Smart Contract Versions

#### 1. FHEVM Version (Privacy-Preserving)
- **Technology**: Zama FHEVM v0.7
- **Contract**: `FHEEscrow.sol`
- **Network**: Requires FHEVM-compatible testnet
- **Features**: Full homomorphic encryption for amounts and approvals
- **Status**: Deployed and ready for FHEVM environment

#### 2. Simplified Version (Demonstration)
- **Technology**: Standard Solidity
- **Contract**: `SimpleEscrow.sol`
- **Network**: Sepolia Testnet
- **Features**: All escrow logic without encryption (for testing/demo)
- **Status**: Fully functional on standard networks

### Technology Stack

#### Frontend
- **React 18** - Modern UI framework
- **Viem** - Ethereum interaction library
- **Wagmi** - React hooks for Ethereum
- **CSS3** - Custom responsive styling

#### Blockchain
- **Solidity ^0.8.24** - Smart contract language
- **Zama FHEVM v0.7** - Fully homomorphic encryption
- **Hardhat** - Development environment
- **Sepolia Testnet** - Testing network

#### Privacy Technology
- **Zama FHEVM** - Fully Homomorphic Encryption Virtual Machine
- **FHE Library** - Encrypted computation primitives
- **TFHE Operations** - Threshold FHE for multi-party computation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MetaMask or compatible Ethereum wallet
- Sepolia testnet ETH for transactions

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd escrow-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Add your private key and RPC URLs
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   ```
   http://localhost:5174
   ```

### Smart Contract Deployment

#### Deploy Simplified Version (Standard Networks)
```bash
npx hardhat run scripts/deploy-simple.js --network sepolia
```

#### Deploy FHEVM Version (FHEVM Networks)
```bash
npx hardhat run scripts/deploy-fhe-escrow.js --network fhevm-testnet
```

## 🔧 Configuration

### Network Configuration
```javascript
// src/config/contractConfig.js
export const CONTRACT_CONFIG = {
  11155111: { // Sepolia
    address: '0x0CE9a43Cebb0D1b92421F05b338Efd2Af507bb38',
    version: 'simple'
  }
}
```

### Environment Variables
```bash
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=your_alchemy_or_infura_url
FHEVM_RPC_URL=zama_fhevm_network_url
```

## 📖 Usage Guide

### Creating an Escrow

1. **Connect Wallet**: Connect your MetaMask to Sepolia testnet
2. **Fill Details**: 
   - Enter seller address
   - Specify amount in ETH
   - Add transaction description
   - Set timeout period
3. **Create & Fund**: Single transaction creates and funds the escrow
4. **Monitor**: Track status in "My Escrows" tab

### Managing Escrows

#### For Buyers
- **Sign Approval**: Confirm receipt of goods/services
- **Request Refund**: Initiate refund with arbitrator help
- **Emergency Refund**: Claim refund after timeout (if applicable)

#### For Sellers
- **Sign Approval**: Confirm completion of service
- **Dispute**: Raise disputes for arbitration

#### For Arbitrators
- **Review Disputes**: Examine dispute cases
- **Make Decisions**: Cast deciding vote in 2/3 multisig
- **Resolve Conflicts**: Help parties reach fair resolution

## 🛡 Security Features

### Multi-Signature Security
- **2/3 Threshold**: Requires 2 out of 3 parties to execute
- **Role Separation**: Clear distinction between buyer, seller, arbitrator
- **No Single Point of Failure**: No single party can control funds

### Privacy Protection (FHEVM)
```solidity
// Example: Encrypted amount storage
euint64 encryptedAmount = FHE.fromExternal(amountInput);

// Example: Private approval verification
ebool buyerApproval = FHE.fromExternal(approvalInput);
ebool isApproved = FHE.decrypt(buyerApproval);
```

### Access Control
- **Participant-only Operations**: Critical functions restricted to involved parties
- **State Validation**: Comprehensive state checking before operations
- **Reentrancy Protection**: Guards against reentrancy attacks

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm test

# Integration tests
npx hardhat test

# Local blockchain testing
npm run test:local
```

### Test Scenarios
- ✅ Escrow creation and funding
- ✅ Multi-party signature verification
- ✅ Dispute resolution workflow
- ✅ Timeout and emergency refund
- ✅ Privacy preservation (FHEVM)

## 📊 Contract Information

### Deployed Contracts

| Version | Network | Address | Status |
|---------|---------|---------|---------|
| FHEVM v0.7 | Sepolia | `0xF3E8B6944f5B2961705b2aDcaD6D4E2389ec2893` | Ready for FHEVM |
| Simple v1.0 | Sepolia | `0x0CE9a43Cebb0D1b92421F05b338Efd2Af507bb38` | Fully Functional |

### Contract Features Comparison

| Feature | FHEVM Version | Simple Version |
|---------|---------------|----------------|
| Amount Privacy | ✅ Encrypted | ❌ Public |
| Approval Privacy | ✅ Encrypted | ❌ Public |
| Multi-signature | ✅ Yes | ✅ Yes |
| Dispute Resolution | ✅ Yes | ✅ Yes |
| Timeout Protection | ✅ Yes | ✅ Yes |
| Network Compatibility | FHEVM Only | Any EVM |

## 🔮 Zama FHEVM Integration

### What is FHEVM?
Zama's Fully Homomorphic Encryption Virtual Machine (FHEVM) enables computation on encrypted data without decryption, providing unprecedented privacy for blockchain applications.

### Implementation Details

#### Encrypted Data Types
```solidity
import "@fhevm/solidity/contracts/FHE.sol";

// Encrypted 64-bit unsigned integer for amounts
euint64 private encryptedAmount;

// Encrypted boolean for approval states
ebool private buyerApproval;
ebool private sellerApproval;
ebool private arbitratorDecision;
```

#### Privacy-Preserving Operations
```solidity
// Create encrypted amount from user input
function createEscrow(
    address _seller,
    address _arbitrator, 
    externalEuint64 calldata _encryptedAmount,
    string calldata _description,
    uint256 _timeout
) external {
    // Convert external encrypted input to internal encrypted type
    euint64 amount = FHE.fromExternal(_encryptedAmount);
    
    // Store encrypted amount (never revealed publicly)
    escrows[escrowCounter].encryptedAmount = amount;
}
```

#### Encrypted Approval System
```solidity
function signApproval(
    uint256 escrowId,
    externalEbool calldata _approval
) external onlyParticipant(escrowId) {
    // Convert and store encrypted approval
    ebool approval = FHE.fromExternal(_approval);
    
    if (msg.sender == escrows[escrowId].buyer) {
        escrows[escrowId].buyerApproval = approval;
    }
    // Additional logic for seller and arbitrator...
}
```

### Privacy Benefits
1. **Amount Confidentiality**: Transaction amounts remain private
2. **Approval Privacy**: Prevents front-running and manipulation
3. **Dispute Privacy**: Confidential arbitration process
4. **Metadata Protection**: Additional transaction details encrypted

### FHEVM Migration Path
The project supports both encrypted (FHEVM) and standard versions:

1. **Development**: Use simplified version for rapid iteration
2. **Testing**: Validate logic on standard testnets
3. **Production**: Deploy FHEVM version for privacy-critical applications

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Zama FHEVM Documentation**: [https://docs.zama.ai/](https://docs.zama.ai/)
- **FHEVM Examples**: [https://docs.zama.ai/protocol/examples](https://docs.zama.ai/protocol/examples)
- **Live Demo**: [Deploy URL]
- **Contract Explorer**: [Sepolia Etherscan](https://sepolia.etherscan.io/address/0x0CE9a43Cebb0D1b92421F05b338Efd2Af507bb38)

---

**Built with ❤️ using Zama's FHEVM technology for privacy-preserving smart contracts**

*This project demonstrates the power of fully homomorphic encryption in creating truly private decentralized applications while maintaining full functionality and user experience.*