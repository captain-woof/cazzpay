import { ethers } from "hardhat";
import { CazzPay, CazzPayToken, UniswapFactory, UniswapRouter } from "../typechain";
import { TestCoin } from "../typechain/TestCoin";
import { WETH } from "../typechain/WETH";
import { WrapperBuilder } from "redstone-evm-connector";
import { BigNumber } from "ethers";

// For Chai
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
const { assert, expect } = chai.use(chaiAsPromised);

describe("CazzPay should function correctly", async () => {

    let czpTokenContract: CazzPayToken;
    let testCoinContract: TestCoin;
    let wethContract: WETH;
    let uniswapFactoryContract: UniswapFactory;
    let uniswapRouterContract: UniswapRouter;
    let cazzPayContract: CazzPay;

    ///////////////////////////////
    // BEFORE HOOK
    ///////////////////////////////
    before(async () => {
        // Deploy CZP
        czpTokenContract = await (await (await ethers.getContractFactory("CazzPayToken")).deploy(ethers.utils.parseEther("10000000"))).deployed();

        // Deploy TestCoin
        testCoinContract = await (await (await ethers.getContractFactory("TestCoin")).deploy(ethers.utils.parseEther("10000000"))).deployed();

        // Deploy WETH
        wethContract = await (await (await ethers.getContractFactory("WETH")).deploy()).deployed();

        // Deploy Uniswap's contracts
        uniswapFactoryContract = await (await (await ethers.getContractFactory("UniswapFactory")).deploy()).deployed();
        uniswapRouterContract = await (await (await ethers.getContractFactory("UniswapRouter")).deploy(uniswapFactoryContract.address, wethContract.address)).deployed();

        // Deploy CazzPay
        cazzPayContract = await (await (await ethers.getContractFactory("CazzPay")).deploy(uniswapFactoryContract.address, uniswapRouterContract.address, czpTokenContract.address, wethContract.address, 100)).deployed();
        cazzPayContract = WrapperBuilder
            .wrapLite(cazzPayContract)
            .usingPriceFeed("redstone", { asset: "ETH" });
    });

    ///////////////////////////////
    // TESTS
    ///////////////////////////////

    it("All contracts must deploy", async () => {
        assert.isString(czpTokenContract.address, "CZP token contract could not be deployed!");
        assert.isString(testCoinContract.address, "TST token contract could not be deployed!");
        assert.isString(wethContract.address, "WETH token contract could not be deployed!");
        assert.isString(uniswapFactoryContract.address, "UniswapFactory contract could not be deployed!");
        assert.isString(uniswapRouterContract.address, "UniswapRouter contract could not be deployed!");
        assert.isString(cazzPayContract.address, "CazzPay contract could not be deployed!");
    });

    it("CazzPayOracle should work correctly", async () => {
        const ethPriceInCzp = await cazzPayContract.getPriceOfTokenInCzpWithTokenSymbol("ETH");
        assert.isTrue(BigNumber.isBigNumber(ethPriceInCzp), "CazzPayOracle did not return valid data!");
    });
});