const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => ethers.utils.parseUnits(n.toString(), "ether");
const ether = tokens;

describe("Crowdsale", () => {
  let token, crowdsale, deployer, buyer, accounts;

  // Constants
  const TOKEN_NAME = "EWare";
  const TOKEN_SYMBOL = "EW";
  const TOTAL_SUPPLY = tokens(1000000);
  const TOKEN_PRICE = ether(1);
  const MAX_TOKENS_SOLD = tokens(100000);
  const MAX_TOKENS_PER_WALLET = tokens(1000);
  const SALE_OPEN = Math.floor(new Date("2025-05-31").getTime() / 1000);
  const SALE_CLOSED = Math.floor(new Date("2025-08-31").getTime() / 1000);
  const IS_SALE_OPEN = false;
  const APPLICATION_FEE = ether(0.01);

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    buyer = accounts[1];

    const Token = await ethers.getContractFactory("Token");
    token = await Token.connect(deployer).deploy(TOKEN_NAME, TOKEN_SYMBOL, TOTAL_SUPPLY);
    await token.deployed();

    const Crowdsale = await ethers.getContractFactory("Crowdsale")
    crowdsale = await Crowdsale.connect(deployer).deploy(
      token.address,              // Token _token
      TOKEN_PRICE,                // uint256 _price
      MAX_TOKENS_SOLD,            // uint256 _maxTokensSold
      MAX_TOKENS_PER_WALLET,      // uint256 _maxTokensPerWallet
      SALE_OPEN,                  // uint _saleOpen
      SALE_CLOSED,                // uint _saleClosed
      0,                          // uint _tokensSold (initially 0)
      APPLICATION_FEE,            // uint _applicationFee
      IS_SALE_OPEN                // bool _status
    );
    
    await crowdsale.deployed();

    // Transfer tokens to the crowdsale contract
    await token.connect(deployer).transfer(crowdsale.address, TOTAL_SUPPLY);
  });

  describe("Deployment", () => {
    it("sets the owner", async () => {
      expect(await crowdsale.owner()).to.equal(deployer.address);
    });

    it("returns the token address", async () => {
      expect(await crowdsale.token()).to.equal(token.address);
    });

    it("sets token price", async () => {
      expect(await crowdsale.price()).to.equal(ether(1));
    });

    it("sets the maximum tokens the crowdsale can sell", async () => {
      expect(await crowdsale.maxTokensSold()).to.equal(MAX_TOKENS_SOLD);
    });

    it("sets the maximum tokens an address can own", async () => {
      expect(await crowdsale.maxTokensPerWallet()).to.equal(MAX_TOKENS_PER_WALLET);
    });

    it("sets the ico start date/time", async () => {
      expect(await crowdsale.saleOpen()).to.equal(SALE_OPEN);
    });

    it("sets the ico close date/time", async () => {
      expect(await crowdsale.saleClosed()).to.equal(SALE_CLOSED);
    });

    it("sets the open or closed status of the crowdsale", async () => {
      expect(await crowdsale.openStatus()).to.equal(IS_SALE_OPEN);
    });
    
    it("sets the application fee", async () => {
      expect(await crowdsale.applicationFee()).to.equal(APPLICATION_FEE);
    });
  });  

  describe('the owner can adjust the application fee', () => {
    let transaction, result, newFee
    
    beforeEach(async () => {
      newFee = ethers.utils.parseEther('.05')
      transaction = await crowdsale.connect(deployer).changeApplicationFee(newFee)
      result = await transaction.wait()
    })

    it("allows the owner to call the function", async () => {
      await expect(crowdsale.connect(deployer).changeApplicationFee(newFee)).to.not.be.reverted;
    });

    it("reverts if not the owner", async () => {
      await expect(crowdsale.connect(buyer).changeApplicationFee(newFee)).to.be.revertedWith('Must be the owner!');
    });
    
    it('updates the price', async () => {
      expect(await crowdsale.applicationFee()).to.equal(newFee);
    });

  });
  
  describe('Paying the whitelist application fee', () => {
    beforeEach(async () => {
      transaction = await crowdsale.payApplicationFee()
      result = await transaction.wait()
    })

    it('Requires the right amount of ether is sent to the crowdsale to cover the application fee', async () => {
    expect(await crowdsale.payApplicationFee()).to.be.equal(APPLICATION_FEE)
    });

    it('Updates user paid fee status to true', async () => {
    expect(await crowdsale.userPaidFee()).to.be.equal(user1, true)
    });
    


  });

});


