const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying FHEEscrow contract...");

  // Get the contract factory
  const FHEEscrow = await ethers.getContractFactory("FHEEscrow");

  // Deploy the contract with gas settings
  const fheEscrow = await FHEEscrow.deploy({
    gasLimit: 3000000,
    gasPrice: ethers.parseUnits("20", "gwei")
  });
  await fheEscrow.waitForDeployment();

  const address = await fheEscrow.getAddress();
  console.log("FHEEscrow deployed to:", address);

  // Verify the contract if on a supported network
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await fheEscrow.deploymentTransaction().wait(6);

    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.error("Verification failed:", error);
    }
  }

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });