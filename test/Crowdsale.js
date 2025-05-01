const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => ethers.utils.parseUnits(n.toString(), "ether");
const ether = tokens;

describe("Crowdsale", () => {
  let token, crowdsale, deployer, buyer, requester;

  const PRICE = ether(1);
  const MAX_TOKENS = ether(50);
  const IS_SALE_CLOSED = false;
  const ALLOW_MINTING_ON = (Date.now() + 120000).toString().slice(0, 10);

  beforeEach(async () => {
    [deployer, buyer, requester] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    token = await Token.connect(deployer).deploy("EWare", "EW", "1000000");

    const Crowdsale = await ethers.getContractFactory("Crowdsale");
    crowdsale = await Crowdsale.connect(deployer).deploy(
      token.address,
      PRICE,
      MAX_TOKENS,
      ALLOW_MINTING_ON
    );

    await token.connect(deployer).transfer(crowdsale.address, tokens(1000000));
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

    it("sets the maximum tokens an address can own", async () => {
      expect(await crowdsale.maxTokens()).to.equal(ether(50));
    });

    it("sets the ico start date/time", async () => {
      expect(await crowdsale.allowMintingOn()).to.equal(ALLOW_MINTING_ON);
    });

    it("starts off closed until start date/time is reached", async () => {
      expect(await crowdsale.isSaleClosed()).to.equal(true);
    });
  });

  describe("User requests Whitelist", () => {
    const fee = ethers.utils.parseEther("0.01"); // example fee
    const name = "Alice";
    const email = "alice@example.com";
    const website = "https://example.com";
    const message = "Please whitelist me";
    
    beforeEach(async () => {
      await crowdsale.connect(requester).requestWhitelist(
        message,
        name,
        email,
        website,
        fee,
        { value: fee }
      );
    })
    it("reverts if the user has already requested to be on the whitelist", async () => {
      await expect(
        crowdsale.connect(requester).requestWhitelist(
          message,
          name,
          email,
          website,
          fee,
          { value: fee }
        )
      ).to.be.revertedWith("Already requested");
    });

    it('Requires user paid application fee', async () => {
      expect(await crowdsale.paidApplication(user1).to.equal(true));
    });

      it('Creates a pending whitelist request', async () => {
        expect(await crowdsale.pendingRequests(user1).to.equal(true));
      });

      it('Saves proposal/request details', async () => {
        expect(await crowdsale.createProposal.to.equal(NAME, EMAIL, WEBSITE, MESSAGE, false))
      });

      it('emits whitelist requested event', async () => {
        expect(await crowdsale.WhitelistRequested.to.equal(user1, EMAIL))
      });
    });

  describe('View whitelist proposal', () => {
    it('Returns the proposal and the address it was created by', async () => {
      expect(await crowdsale.viewWhitelistProposal.to.equal(user1.name, user1.email, user1.website, 
        user1.message, true));
    });
  });

  describe("Adds user to whitelist", () => {
    it('Requires the user hasnt already been added to whitelist', async () => {
    });

    it('Requires user paid application fee', async () => {
    });

    it('Approves whitelist request', async () => {
    });

    it('Emits whitelist approved event', async () => {
    });
  });

  describe("Removes user from whitelist", () => {
    it('Removes user from whitelist', async () => {
      expect(await crowdsale.whitelist[user1].to.equal(false))
    });

  });

  describe("Rejects whitelist request", () => {
    it('Requires user has a pending request', async () => {
    });

    it('Changes pending request status to false', async () => {
    });

    it('Updates rejected requests mapping', async () => {
    });

    it('Emits request rejected event', async () => {
    });
  });

  describe("Setting max tokens per user", () => {
    it('Requires that only the owner can set this amount', async () => {
    });

    it('Sets max token amount per user', async () => {
    });

  });

  describe("Buying Tokens", () => {
    let transaction = tokens(10);
    let amount = tokens(10);

    describe("Success", () => {
      beforeEach(async () => {
        transaction = await crowdsale
          .connect(user1)
          .buyTokens(amount, { value: ether(10) });
        result = await transaction.wait();
      });

      it("transfers tokens", async () => {
        expect(await token.balanceOf(crowdsale.address)).to.equal(
          tokens(999990)
        );
        expect(await token.balanceOf(user1.address)).to.equal(amount);
      });

      it("updates contracts ether balance", async () => {
        expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(
          amount
        );
      });

      it("updates tokensSold", async () => {
        expect(await crowdsale.tokensSold()).to.equal(amount);
      });

      it("emits a buy event", async () => {
        console.log(result);
        // --> https://hardhat.org/hardhat-chai-matchers/docs/reference#.emit
        await expect(transaction)
          .to.emit(crowdsale, "Buy")
          .withArgs(amount, user1.address);
      });
    });

    describe("Failure", () => {
      it("rejects insufficient ETH", async () => {
        await expect(
          crowdsale.connect(user1).buyTokens(tokens(10), { value: 0 })
        ).to.be.reverted;
      });
    });
  });

  describe("Sending ETH", () => {
    let transaction, result;
    let amount = ether(10);

    describe("Success", () => {
      beforeEach(async () => {
        transaction = await user1.sendTransaction({
          to: crowdsale.address,
          value: amount,
        });
        result = await transaction.wait();
      });

      it("updates contracts ether balance", async () => {
        expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(
          amount
        );
      });

      it("updates user token balance", async () => {
        expect(await token.balanceOf(user1.address)).to.equal(amount);
      });
    });
  });

  describe("Updating Price", () => {
    let transaction, result;
    let price = ether(2);

    describe("Success", () => {
      beforeEach(async () => {
        transaction = await crowdsale.connect(deployer).setPrice(ether(2));
        result = await transaction.wait();
      });

      it("updates the price", async () => {
        expect(await crowdsale.price()).to.equal(ether(2));
      });
    });

    describe("Failure", () => {
      it("prevents non-owner from updating price", async () => {
        await expect(crowdsale.connect(user1).setPrice(price)).to.be.reverted;
      });
    });
  });

  describe("Pausing crowdsales", () => {
      it('Requires the user hasnt already requested to be on whitelist', async () => {
      });

      it('Requires user paid application fee', async () => {
      });

      it('Creates a pending whitelist request', async () => {
      });

      it('Saves proposal/request details', async () => {
      });

      it('emits whitelist requested event', async () => {
      });
  });

  describe("Finalzing Sale", () => {
    let transaction, result;
    let amount = tokens(10);
    let value = ether(10);


    describe("Success", () => {
      beforeEach(async () => {
        transaction = await crowdsale
          .connect(user1)
          .buyTokens(amount, { value: value });
        result = await transaction.wait();

        transaction = await crowdsale.connect(deployer).finalize();
        result = await transaction.wait();
      });

      it("transfers remaining tokens to owner", async () => {
        expect(await token.balanceOf(crowdsale.address)).to.equal(0);
        expect(await token.balanceOf(deployer.address)).to.equal(
          tokens(999990)
        );
      });

      it("transfers ETH balance to owner", async () => {
        expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(0);
      });

      it("emits Finalize event", async () => {
        // --> https://hardhat.org/hardhat-chai-matchers/docs/reference#.emit
        await expect(transaction)
          .to.emit(crowdsale, "Finalize")
          .withArgs(amount, value);
      });
    });

    describe("Failure", () => {
      it("prevents non-owner from finalizing", async () => {
        await expect(crowdsale.connect(user1).finalize()).to.be.reverted;
      });
    });
  });

  });
