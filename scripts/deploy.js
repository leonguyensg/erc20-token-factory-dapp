// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  const balance = await deployer.provider.getBalance(deployer.address);
  const { formatEther } = require("ethers");
  console.log("Account balance:", formatEther(balance));

  const Factory = await ethers.getContractFactory("Erc20TokenFactory");
  const factory = await Factory.deploy();
  
  await factory.waitForDeployment();
  console.log("Erc20TokenFactory deployed to:", await factory.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
