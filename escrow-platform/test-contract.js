const { ethers } = require('ethers');
require('dotenv').config();

// Contract configuration
const CONTRACT_ADDRESS = '0xF3E8B6944f5B2961705b2aDcaD6D4E2389ec2893';
const RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/0DcboKiqUgcUdLlt7CCTanGQ54wRACdS';

// Simple ABI for testing
const CONTRACT_ABI = [
  "function escrowCounter() view returns (uint256)",
  "function createEscrow(address _seller, address _arbitrator, bytes32 _encryptedAmountHandle, bytes _encryptedAmountProof, string _description, uint256 _timeout) returns (uint256)"
];

async function testContract() {
  try {
    // Setup provider
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // Test with a private key if available
    let wallet;
    if (process.env.PRIVATE_KEY) {
      wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      console.log('Using wallet:', wallet.address);
    } else {
      console.log('No private key found, only testing read functions');
    }
    
    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet || provider);
    
    // Test read function
    console.log('\n=== Testing escrowCounter ===');
    const counter = await contract.escrowCounter();
    console.log('Current escrow counter:', counter.toString());
    
    if (wallet) {
      console.log('\n=== Testing createEscrow ===');
      
      // Test parameters
      const sellerAddress = '0x742deff9e0fd0983f2d662c0b7eb9cc5a3c7b4a5'; // Example address
      const arbitratorAddress = '0xD3d3d1e0a499CaFd2641452f1207Dfe2C5e1DFe8'; // From config
      const encryptedAmountHandle = '0x0000000000000000000000000000000000000000000000000000000000000001'; // Mock
      const encryptedAmountProof = '0x' + '00'.repeat(64); // Mock 64-byte proof
      const description = 'Test escrow transaction';
      const timeout = 604800; // 7 days in seconds
      
      try {
        // Estimate gas first
        const gasEstimate = await contract.createEscrow.estimateGas(
          sellerAddress,
          arbitratorAddress, 
          encryptedAmountHandle,
          encryptedAmountProof,
          description,
          timeout
        );
        console.log('Gas estimate:', gasEstimate.toString());
        
        // Call with gas limit
        const tx = await contract.createEscrow(
          sellerAddress,
          arbitratorAddress,
          encryptedAmountHandle, 
          encryptedAmountProof,
          description,
          timeout,
          { gasLimit: gasEstimate + 50000n }
        );
        
        console.log('Transaction sent:', tx.hash);
        console.log('Waiting for confirmation...');
        
        const receipt = await tx.wait();
        console.log('Transaction confirmed!');
        console.log('Gas used:', receipt.gasUsed.toString());
        
      } catch (error) {
        console.error('createEscrow failed:', error.message);
        if (error.data) {
          console.error('Error data:', error.data);
        }
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testContract();