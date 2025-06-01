const hre = require("hardhat");

async function main() {
  // Get contract address from command line arguments
  const contractAddress = process.argv[2];
  const name = process.argv[3];
  const symbol = process.argv[4];
  const decimals = parseInt(process.argv[5]);
  const initialSupply = process.argv[6];
  const owner = process.argv[7];
  const isMintable = process.argv[8] === 'true';
  const isBurnable = process.argv[9] === 'true';

  if (!contractAddress || !name || !symbol || !decimals || !initialSupply || !owner) {
    console.error("Usage: npx hardhat run scripts/verify.js --network <network> <contractAddress> <name> <symbol> <decimals> <initialSupply> <owner> <isMintable> <isBurnable>");
    process.exit(1);
  }

  console.log("Verifying contract:", contractAddress);
  console.log("Constructor arguments:", {
    name,
    symbol,
    decimals,
    initialSupply,
    owner,
    isMintable,
    isBurnable
  });

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [
        name,
        symbol,
        decimals,
        initialSupply,
        owner,
        isMintable,
        isBurnable
      ],
      contract: "contracts/ERC20Custom.sol:ERC20Custom"
    });
    
    console.log("Contract verified successfully!");
  } catch (error) {
    console.error("Verification failed:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
