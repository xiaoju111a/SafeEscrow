// FHEEscrow Contract Configuration
export const CONTRACT_CONFIG = {
  // Sepolia Testnet - Simple Version (Fully Functional)
  11155111: {
    address: '0x0CE9a43Cebb0D1b92421F05b338Efd2Af507bb38',
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/0DcboKiqUgcUdLlt7CCTanGQ54wRACdS',
    version: 'simple',
    description: 'Simplified escrow contract - all features available'
  },
  // Localhost (for development)
  31337: {
    address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Default Hardhat deployment address
    rpcUrl: 'http://127.0.0.1:8545'
  }
}

// Contract ABI - Simple Version (Fully Functional)
export const CONTRACT_ABI = [
  // View functions
  {
    "inputs": [],
    "name": "escrowCounter",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "escrowId", "type": "uint256"}],
    "name": "getEscrowDetails",
    "outputs": [
      {"internalType": "address", "name": "buyer", "type": "address"},
      {"internalType": "address", "name": "seller", "type": "address"},
      {"internalType": "address", "name": "arbitrator", "type": "address"},
      {"internalType": "enum SimpleEscrow.EscrowState", "name": "state", "type": "uint8"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
      {"internalType": "uint256", "name": "timeout", "type": "uint256"},
      {"internalType": "uint256", "name": "signatureCount", "type": "uint256"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "escrowId", "type": "uint256"},
      {"internalType": "address", "name": "user", "type": "address"}
    ],
    "name": "hasUserSigned",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Write functions - Simplified Version
  {
    "inputs": [
      {"internalType": "address", "name": "_seller", "type": "address"},
      {"internalType": "address", "name": "_arbitrator", "type": "address"},
      {"internalType": "string", "name": "_description", "type": "string"},
      {"internalType": "uint256", "name": "_timeout", "type": "uint256"}
    ],
    "name": "createEscrow",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "escrowId", "type": "uint256"}],
    "name": "signApproval",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "escrowId", "type": "uint256"}],
    "name": "disputeEscrow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "escrowId", "type": "uint256"}],
    "name": "emergencyRefund",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "escrowId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "buyer", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "seller", "type": "address"},
      {"indexed": false, "internalType": "address", "name": "arbitrator", "type": "address"}
    ],
    "name": "EscrowCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "escrowId", "type": "uint256"}
    ],
    "name": "EscrowFunded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "escrowId", "type": "uint256"}
    ],
    "name": "EscrowCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "escrowId", "type": "uint256"}
    ],
    "name": "EscrowDisputed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "escrowId", "type": "uint256"}
    ],
    "name": "EscrowCancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "escrowId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "signer", "type": "address"}
    ],
    "name": "SignatureAdded",
    "type": "event"
  }
]

// Escrow states mapping
export const ESCROW_STATES = {
  0: 'Created',
  1: 'Funded', 
  2: 'Completed',
  3: 'Disputed',
  4: 'Cancelled'
}

// Default arbitrator for platform (should be configurable)
export const DEFAULT_ARBITRATOR = '0xD3d3d1e0a499CaFd2641452f1207Dfe2C5e1DFe8'

// Helper function to get contract config for current network
export const getContractConfig = (chainId) => {
  return CONTRACT_CONFIG[chainId] || CONTRACT_CONFIG[11155111] // Default to Sepolia
}