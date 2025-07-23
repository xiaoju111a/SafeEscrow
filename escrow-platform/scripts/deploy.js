const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying FHEEscrow contract...");

  // Deploy the contract
  const FHEEscrow = await ethers.getContractFactory("FHEEscrow");
  const fheEscrow = await FHEEscrow.deploy();

  await fheEscrow.waitForDeployment();

  const contractAddress = await fheEscrow.getAddress();
  console.log("FHEEscrow deployed to:", contractAddress);
  
  // Verify the deployment
  console.log("\nVerifying deployment...");
  const counter = await fheEscrow.escrowCounter();
  console.log("Initial escrow counter:", counter.toString());

  console.log("\nDeployment completed successfully!");
  console.log("Contract address:", contractAddress);
  console.log("Network:", hre.network.name);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });