const { ethers } = require("hardhat");
const { FhevmInstance } = require("fhevmjs");

/**
 * Example usage of FHEEscrow contract with homomorphic encryption
 */
class FHEEscrowClient {
  constructor(contractAddress, signer) {
    this.contractAddress = contractAddress;
    this.signer = signer;
    this.fhevmInstance = null;
    this.contract = null;
  }

  async initialize() {
    // Initialize FHEVM instance for encryption
    this.fhevmInstance = await FhevmInstance.create({
      chainId: 31337, // Hardhat local network
      publicKeyVerifyingContract: "0x...", // FHEVM public key contract
    });

    // Get contract instance
    const FHEEscrow = await ethers.getContractFactory("FHEEscrow");
    this.contract = FHEEscrow.attach(this.contractAddress).connect(this.signer);
  }

  /**
   * Create a new escrow with encrypted amount
   */
  async createEscrow(sellerAddress, arbitratorAddress, amount, description, timeoutDays) {
    try {
      // Encrypt the amount using FHEVM
      const encryptedAmount = this.fhevmInstance.encrypt64(amount);
      
      const tx = await this.contract.createEscrow(
        sellerAddress,
        arbitratorAddress,
        encryptedAmount,
        description,
        timeoutDays * 24 * 60 * 60 // Convert days to seconds
      );

      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "EscrowCreated");
      const escrowId = event.args.escrowId;

      console.log(`Escrow created with ID: ${escrowId}`);
      return escrowId;
    } catch (error) {
      console.error("Error creating escrow:", error);
      throw error;
    }
  }

  /**
   * Fund an escrow
   */
  async fundEscrow(escrowId, amount) {
    try {
      // Encrypt the amount for verification
      const encryptedAmount = this.fhevmInstance.encrypt64(amount);
      
      const tx = await this.contract.fundEscrow(escrowId, encryptedAmount, {
        value: ethers.utils.parseEther(amount.toString())
      });

      await tx.wait();
      console.log(`Escrow ${escrowId} funded successfully`);
    } catch (error) {
      console.error("Error funding escrow:", error);
      throw error;
    }
  }

  /**
   * Sign approval for escrow completion
   */
  async signApproval(escrowId, approve = true) {
    try {
      // Encrypt the approval decision
      const encryptedApproval = this.fhevmInstance.encrypt_bool(approve);
      
      const tx = await this.contract.signApproval(escrowId, encryptedApproval);
      await tx.wait();
      
      console.log(`Approval ${approve ? 'granted' : 'denied'} for escrow ${escrowId}`);
    } catch (error) {
      console.error("Error signing approval:", error);
      throw error;
    }
  }

  /**
   * Request refund with encrypted reason
   */
  async requestRefund(escrowId, reason) {
    try {
      // Encrypt the refund reason (boolean for simplicity)
      const encryptedReason = this.fhevmInstance.encrypt_bool(true);
      
      const tx = await this.contract.requestRefund(escrowId, encryptedReason);
      await tx.wait();
      
      console.log(`Refund requested for escrow ${escrowId}`);
    } catch (error) {
      console.error("Error requesting refund:", error);
      throw error;
    }
  }

  /**
   * Get escrow details (public information)
   */
  async getEscrowDetails(escrowId) {
    try {
      const details = await this.contract.getEscrowDetails(escrowId);
      
      return {
        buyer: details.buyer,
        seller: details.seller,
        arbitrator: details.arbitrator,
        state: details.state,
        description: details.description,
        createdAt: new Date(details.createdAt.toNumber() * 1000),
        timeout: details.timeout.toNumber(),
        signatureCount: details.signatureCount.toNumber()
      };
    } catch (error) {
      console.error("Error getting escrow details:", error);
      throw error;
    }
  }

  /**
   * Get encrypted amount (only for participants)
   */
  async getEncryptedAmount(escrowId) {
    try {
      const publicKey = this.fhevmInstance.getPublicKey();
      const encryptedAmount = await this.contract.getEncryptedAmount(escrowId, publicKey);
      
      // Decrypt the amount client-side
      const amount = this.fhevmInstance.decrypt(encryptedAmount);
      return amount;
    } catch (error) {
      console.error("Error getting encrypted amount:", error);
      throw error;
    }
  }

  /**
   * Emergency refund after timeout
   */
  async emergencyRefund(escrowId) {
    try {
      const tx = await this.contract.emergencyRefund(escrowId);
      await tx.wait();
      
      console.log(`Emergency refund processed for escrow ${escrowId}`);
    } catch (error) {
      console.error("Error processing emergency refund:", error);
      throw error;
    }
  }
}

/**
 * Example usage scenario
 */
async function exampleUsage() {
  const [buyer, seller, arbitrator] = await ethers.getSigners();
  
  // Deploy contract
  const FHEEscrow = await ethers.getContractFactory("FHEEscrow");
  const contract = await FHEEscrow.deploy();
  await contract.deployed();
  
  console.log("Contract deployed at:", contract.address);

  // Initialize clients for each participant
  const buyerClient = new FHEEscrowClient(contract.address, buyer);
  const sellerClient = new FHEEscrowClient(contract.address, seller);
  const arbitratorClient = new FHEEscrowClient(contract.address, arbitrator);

  await buyerClient.initialize();
  await sellerClient.initialize();
  await arbitratorClient.initialize();

  try {
    // Step 1: Buyer creates escrow
    console.log("\n=== Creating Escrow ===");
    const escrowId = await buyerClient.createEscrow(
      seller.address,
      arbitrator.address,
      1000, // 1000 wei (encrypted)
      "Purchase of digital goods",
      7 // 7 days timeout
    );

    // Step 2: Buyer funds the escrow
    console.log("\n=== Funding Escrow ===");
    await buyerClient.fundEscrow(escrowId, 1000);

    // Step 3: Get escrow details
    console.log("\n=== Escrow Details ===");
    const details = await buyerClient.getEscrowDetails(escrowId);
    console.log("Escrow Details:", details);

    // Step 4: Seller approves the transaction
    console.log("\n=== Seller Approval ===");
    await sellerClient.signApproval(escrowId, true);

    // Step 5: Buyer approves the transaction
    console.log("\n=== Buyer Approval ===");
    await buyerClient.signApproval(escrowId, true);

    console.log("\n=== Escrow Complete ===");
    console.log("Transaction completed with privacy-preserving 2/3 multisig!");

  } catch (error) {
    console.error("Example failed:", error);
  }
}

module.exports = {
  FHEEscrowClient,
  exampleUsage
};

// Run example if called directly
if (require.main === module) {
  exampleUsage()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}