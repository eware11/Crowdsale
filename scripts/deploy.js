const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`🚀 Deploying contracts with account: ${deployer.address}`);

  // 1. Deploy the ERC-20 Token contract
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy("EWARE Token", "EWR", ethers.utils.parseEther("1000000")); // 1 million tokens
  await token.deployed();
  console.log(`✅ Token deployed at: ${token.address}`);

  // 2. Deploy the Crowdsale contract
  const price = ethers.utils.parseEther("0.01"); // 0.01 ETH per token
  const maxTokens = ethers.utils.parseEther("100000"); // Cap sale at 100k tokens
  const allowMintingOn = Math.floor(Date.now() / 1000) + 60; // Start minting 1 minute from now
  const isSaleClosed = false;

  const Crowdsale = await ethers.getContractFactory("Crowdsale");
  const crowdsale = await Crowdsale.deploy(
    token.address,
    price,
    maxTokens,
    allowMintingOn,
    isSaleClosed
  );
  await crowdsale.deployed();
  console.log(`✅ Crowdsale deployed at: ${crowdsale.address}`);

  // 3. Transfer tokens to the Crowdsale contract
  const transferAmount = ethers.utils.parseEther("100000"); // send 100k tokens to sale
  const tx = await token.transfer(crowdsale.address, transferAmount);
  await tx.wait();
  console.log(`🎁 Transferred ${ethers.utils.formatEther(transferAmount)} tokens to Crowdsale`);

  console.log("🎉 Deployment complete!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});