const hre = require("hardhat");

async function main() {
  // Get factory contract address from command line arguments
  const factoryAddress = process.argv[2];

  if (!factoryAddress) {
    console.error("Usage: npx hardhat run scripts/verifyFactory.js --network <network> <factoryAddress>");
    process.exit(1);
  }

  console.log("Verifying factory contract:", factoryAddress);

  try {
    await hre.run("verify:verify", {
      address: factoryAddress,
      constructorArguments: [], // Factory has no constructor arguments
      contract: "contracts/Erc20TokenFactory.sol:Erc20TokenFactory"
    });
    
    console.log("Factory contract verified successfully!");
  } catch (error) {
    console.error("Verification failed:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
