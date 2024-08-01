import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

let owner: any;
let buyer1: any;
let buyer2: any;
let buyer3: any;
let HenloToken: any;
let HenloTokenAddress: any;
let Presale: any;
let PresaleAddress: any;
let presaleRate: number; 
let presaleMinContribution: any ;
let presaleMaxContribution: any;
let presaleDuration: any;

describe("Create Initial Contracts of all types", function () {
  it("get accounts", async function () {
    [owner, buyer1, buyer2, buyer3] =
      await ethers.getSigners();
    console.log("\tAccount address\t", await owner.getAddress());
  });
  it("should deploy Henlo Token Contract", async function () {
    const instanceFeeToken = await ethers.getContractFactory("henlo");
    HenloToken = await instanceFeeToken.deploy();
    HenloTokenAddress = await HenloToken.getAddress();
    console.log("\tFeeToken Contract deployed at:", HenloTokenAddress);
  });
  it("should deploy Presale Contract", async function () {
    presaleRate = 100 ;
    presaleMinContribution = ethers.parseEther("1");
    presaleMaxContribution = ethers.parseEther("100");
    presaleDuration = 3600 * 24 * 10;

    const instanceCollection = await ethers.getContractFactory("HENLOPresale");
    Presale = await instanceCollection.deploy(HenloTokenAddress, presaleRate, presaleMinContribution, presaleMaxContribution, presaleDuration );
    PresaleAddress = await Presale.getAddress();
    console.log("\tPresale Contract deployed at:", PresaleAddress);
  });
});

describe("Send Token to presale contract", async function(){
  it("send", async function(){
    await HenloToken.transfer(PresaleAddress, ethers.parseEther("100000000"));
    expect(await HenloToken.balanceOf(PresaleAddress)).to.equal(ethers.parseEther("100000000"));
  })
})

describe("buyers buy this token", async function(){
    it("buyer1 buys this", async function(){
        await Presale.connect(buyer1).buyTokens({value: ethers.parseEther("10")});
        const value = ethers.parseEther("10") * BigInt(presaleRate);
        expect(await HenloToken.balanceOf(buyer1)).to.equal(value);
        expect(await ethers.provider.getBalance(PresaleAddress)).to.equal(ethers.parseEther("10"));
    })
    it("buyer2 buys this", async function(){
        await Presale.connect(buyer2).buyTokens({value: ethers.parseEther("20")});
        const value = ethers.parseEther("20") * BigInt(presaleRate);
        expect(await HenloToken.balanceOf(buyer2)).to.equal(value);
        expect(await ethers.provider.getBalance(PresaleAddress)).to.equal(ethers.parseEther("30"));
    })
    it("buyer1 buys this", async function(){
        await Presale.connect(buyer3).buyTokens({value: ethers.parseEther("30")});
        const value = ethers.parseEther("30") * BigInt(presaleRate);
        expect(await HenloToken.balanceOf(buyer3)).to.equal(value);
        expect(await ethers.provider.getBalance(PresaleAddress)).to.equal(ethers.parseEther("60"));
    })
})

describe("test withdraw funds", async function(){
    it("owner withdraw funds", async function(){
        await Presale.withdrawFunds() ;
        expect(await ethers.provider.getBalance(PresaleAddress)).to.equal(ethers.parseEther("0"));
    })
})

describe("test withdrawTokens", async function(){
    it("owner withdrawTokens", async function(){
        const beforeBalance = await HenloToken.balanceOf(owner) ;
        await Presale.withdrawTokens(ethers.parseEther("20"));
        const afterBalance = await HenloToken.balanceOf(owner) ;
        expect(afterBalance - beforeBalance).to.equal(ethers.parseEther("20"));
    })
})

describe("test extendPresale", async function(){
    it("owner extendPresale", async function(){
        const extendTime = 10000 ;
        const currentEndTime = await Presale.presaleEndTime();
        await Presale.extendPresale(BigInt(extendTime));
        expect(await Presale.presaleEndTime()).to.equal(currentEndTime + BigInt(extendTime))
    })
})
