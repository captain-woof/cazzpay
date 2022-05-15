import { ethers } from "hardhat";
import { CazzPayOracle } from "../typechain";
import { WrapperBuilder } from "redstone-evm-connector";
import { assert } from "chai";
import { BigNumber } from "ethers";

describe("PriceOracle feeds", async () => {

  // CONSTANTS
  let cazzPayOracleContract: CazzPayOracle;

  // BEFORE HOOK
  before(async () => {
    const cazzPayOracleContractFactory = await ethers.getContractFactory("CazzPayOracle");
    cazzPayOracleContract = await cazzPayOracleContractFactory.deploy();
    await cazzPayOracleContract.deployed();
    cazzPayOracleContract = WrapperBuilder
      .wrapLite(cazzPayOracleContract)
      .usingPriceFeed("redstone", { asset: "ETH" });
  });

  // TESTS
  it("PriceOracle should return price feeds correctly", async () => {
    const ethPrice = await cazzPayOracleContract.getPriceOfTokenInCzp("ETH");
    assert.isTrue(BigNumber.isBigNumber(ethPrice), "ETH Price came incorrect!");
    console.log(`ETH PRICE: ${ethPrice.div(BigNumber.from(10).pow(18)).toString()}`);
  });

});