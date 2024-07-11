
const hre = require("hardhat");

//Token deployed to: 0x1b4158e52C2DFEEE4F79696a699d178F6840cDc9//crowdsale address 0xB03C7Cb0bAa0633d96C5a1EF5b11CF98BdD84D56
//Crowdsale deployed to: 0x2C1089981d04d60ba855F93aA9B3f85f6cF89778
async function main() {
  const NAME = 'Dapp University'
  const SYMBOL = 'DAPP'
  const MAX_SUPPLY = '1000000'
  const PRICE = ethers.utils.parseUnits('0.025', 'ether')
  const MINT_TIME = (Date.now() + 60000).toString().slice(0, 10)

  // Deploy Token
  const Token = await hre.ethers.getContractFactory("Token")
  const token = await Token.deploy(NAME, SYMBOL, MAX_SUPPLY)
  await token.deployed()

  console.log(`Token deployed to: ${token.address}\n`)

  // Deploy Crowdsale
  const Crowdsale = await hre.ethers.getContractFactory("Crowdsale")
  const crowdsale = await Crowdsale.deploy(token.address, PRICE, ethers.utils.parseUnits(MAX_SUPPLY, 'ether'), MINT_TIME)
  await crowdsale.deployed();

  console.log(`Crowdsale deployed to: ${crowdsale.address}\n`)

  const transaction = await token.transfer(crowdsale.address, ethers.utils.parseUnits(MAX_SUPPLY, 'ether'))
  await transaction.wait()

  console.log(`Tokens transferred to Crowdsale\n`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});