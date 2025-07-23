const { ethers } = require("hardhat");

async function main() {
  console.log("部署SimpleEscrow合约 (简化版，用于Sepolia测试)...");

  // Deploy the contract
  const SimpleEscrow = await ethers.getContractFactory("SimpleEscrow");
  const simpleEscrow = await SimpleEscrow.deploy();

  await simpleEscrow.waitForDeployment();

  const contractAddress = await simpleEscrow.getAddress();
  console.log("SimpleEscrow deployed to:", contractAddress);
  
  // Verify the deployment
  console.log("\n验证部署...");
  const counter = await simpleEscrow.escrowCounter();
  console.log("初始托管计数器:", counter.toString());

  console.log("\n部署完成!");
  console.log("合约地址:", contractAddress);
  console.log("网络:", hre.network.name);
  console.log("特点: 非加密版本，可在标准Sepolia网络上正常工作");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });