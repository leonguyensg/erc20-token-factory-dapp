const { expect } = require("chai");
const { ethers: ethersHH } = require("hardhat");
const { ethers } = require("ethers");

describe("Erc20TokenFactory & ERC20Custom", function () {
  let factory, owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethersHH.getSigners();
    const Factory = await ethersHH.getContractFactory("Erc20TokenFactory");
    factory = await Factory.deploy();
  });

  it("should create a mintable and burnable token and allow mint/burn", async function () {
    const tx = await factory.createToken(
      owner.address,
      "TestToken",
      "TTK",
      18,
      ethers.parseEther("1000"),
      true,
      true
    );
    const receipt = await tx.wait();
    const tokenAddress = receipt.logs[0].address;
    const Token = await ethersHH.getContractFactory("ERC20Custom");
    const token = Token.attach(tokenAddress);

    expect(await token.totalSupply()).to.equal(ethers.parseEther("1000"));
    expect(await token.balanceOf(owner.address)).to.equal(ethers.parseEther("1000"));

    // Mint
    await token.mint(user1.address, ethers.parseEther("100"));
    expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("100"));

    // Burn
    await token.burn(user1.address, ethers.parseEther("50"));
    expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("50"));
  });

  it("should not allow mint if isMintable is false", async function () {
    const tx = await factory.createToken(
      owner.address,
      "NoMint",
      "NM",
      18,
      ethers.parseEther("1000"),
      false,
      true
    );
    const receipt = await tx.wait();
    const tokenAddress = receipt.logs[0].address;
    const Token = await ethersHH.getContractFactory("ERC20Custom");
    const token = Token.attach(tokenAddress);
    await expect(token.mint(user1.address, 1)).to.be.revertedWith("Minting is disabled");
  });

  it("should not allow burn if isBurnable is false", async function () {
    const tx = await factory.createToken(
      owner.address,
      "NoBurn",
      "NB",
      18,
      ethers.parseEther("1000"),
      true,
      false
    );
    const receipt = await tx.wait();
    const tokenAddress = receipt.logs[0].address;
    const Token = await ethersHH.getContractFactory("ERC20Custom");
    const token = Token.attach(tokenAddress);
    await expect(token.burn(owner.address, 1)).to.be.revertedWith("Burning is disabled");
  });

  it("should only allow owner to mint or burn", async function () {
    const tx = await factory.createToken(
      owner.address,
      "OwnerOnly",
      "OWN",
      18,
      ethers.parseEther("1000"),
      true,
      true
    );
    const receipt = await tx.wait();
    const tokenAddress = receipt.logs[0].address;
    const Token = await ethersHH.getContractFactory("ERC20Custom");
    const token = Token.attach(tokenAddress);
    await expect(token.connect(user1).mint(user1.address, 1)).to.be.revertedWith("Not owner");
    await expect(token.connect(user1).burn(owner.address, 1)).to.be.revertedWith("Not owner");
  });

  it("should allow transfer between accounts", async function () {
    const tx = await factory.createToken(
      owner.address,
      "TransferToken",
      "TRF",
      18,
      ethers.parseEther("1000"),
      true,
      true
    );
    const receipt = await tx.wait();
    const tokenAddress = receipt.logs[0].address;
    const Token = await ethersHH.getContractFactory("ERC20Custom");
    const token = Token.attach(tokenAddress);

    // Transfer from owner to user1
    await token.transfer(user1.address, ethers.parseEther("200"));
    expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("200"));
    expect(await token.balanceOf(owner.address)).to.equal(ethers.parseEther("800"));
  });

  it("should allow approve and transferFrom", async function () {
    const tx = await factory.createToken(
      owner.address,
      "ApproveToken",
      "APR",
      18,
      ethers.parseEther("1000"),
      true,
      true
    );
    const receipt = await tx.wait();
    const tokenAddress = receipt.logs[0].address;
    const Token = await ethersHH.getContractFactory("ERC20Custom");
    const token = Token.attach(tokenAddress);

    // Owner approve user1 to spend 300 tokens
    await token.approve(user1.address, ethers.parseEther("300"));
    expect(await token.allowance(owner.address, user1.address)).to.equal(ethers.parseEther("300"));

    // user1 transferFrom owner to user2
    await token.connect(user1).transferFrom(owner.address, user2.address, ethers.parseEther("150"));
    expect(await token.balanceOf(user2.address)).to.equal(ethers.parseEther("150"));
    expect(await token.balanceOf(owner.address)).to.equal(ethers.parseEther("850"));
    expect(await token.allowance(owner.address, user1.address)).to.equal(ethers.parseEther("150"));
  });
});
