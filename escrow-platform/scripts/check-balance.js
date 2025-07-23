const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  const balance = await signer.provider.getBalance(signer.address);
  
  console.log("Address:", signer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  console.log("Balance (wei):", balance.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });