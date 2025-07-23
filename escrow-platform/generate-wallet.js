import { ethers } from 'ethers';

// Generate a new random wallet
const wallet = ethers.Wallet.createRandom();

console.log('=== NEW ETHEREUM WALLET ===');
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
console.log('Mnemonic:', wallet.mnemonic.phrase);
console.log('==============================');
console.log('');
console.log('IMPORTANT: Save these credentials securely!');
console.log('Send Sepolia ETH to the address above for deployment.');