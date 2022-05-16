import { ethers } from "hardhat";
import { CazzPay, CazzPayToken, UniswapFactory, UniswapRouter } from "../typechain";
import { TestCoin } from "../typechain/TestCoin";
import { WETH } from "../typechain/WETH";
import { WrapperBuilder } from "redstone-evm-connector";
import { BigNumber } from "ethers";

// For Chai
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { CreatedPairWithCzpAndOtherTokenEvent } from "../typechain/CazzPay";
const { assert, expect } = chai.use(chaiAsPromised);

describe("CazzPay should function correctly", async () => {

    let czpTokenContract: CazzPayToken;
    let testCoinContract: TestCoin;
    let wethContract: WETH;
    let uniswapFactoryContract: UniswapFactory;
    let uniswapRouterContract: UniswapRouter;
    let cazzPayContract: CazzPay;
    let cazzPayContractRedstoneWrapped: CazzPay;

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
        cazzPayContract = await (await (await ethers.getContractFactory("CazzPay")).deploy(uniswapFactoryContract.address, uniswapRouterContract.address, czpTokenContract.address, wethContract.address, 100, "0xFE71e9691B9524BC932C23d0EeD5c9CE41161884")).deployed();
        cazzPayContractRedstoneWrapped = WrapperBuilder
            .mockLite(cazzPayContract)
            .using({ ETH: 2000, CZP: 1, TST: 10, WETH: 2000 });
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
        const ethPriceInCzp = await cazzPayContractRedstoneWrapped.getPriceOfTokenInCzpWithTokenSymbol("ETH");
        assert.isTrue(BigNumber.isBigNumber(ethPriceInCzp), "CazzPayOracle did not return valid data!");
        assert.isTrue(ethPriceInCzp.eq(ethers.utils.parseEther("2000")), "Token price came incorrect!");
    });

    it("CazzPay should correctly create a pair, and should return it on querying", async () => {
        const { otherTokenContractAddr, pairAddr } = await createPair();
        assert.equal(otherTokenContractAddr, testCoinContract.address, "Other token contract address is not correct!");
        assert.isString(pairAddr, "Invalid pair address returned!");

        expect(cazzPayContract.getCzpAndOtherTokenPoolAddr(testCoinContract.address)).eventually.equal(pairAddr, "Incorrect pair address on query!");
    });

    //////////////////////////
    // HELPERS
    //////////////////////////

    const createPair = async () => {
        const tx = await cazzPayContract.createPairWithCzpAndOtherToken(testCoinContract.address);
        const rcpt = await tx.wait();
        const { pairAddr, otherTokenContractAddr } = (rcpt?.events?.find(({ event }) => (event === "CreatedPairWithCzpAndOtherToken")) as CreatedPairWithCzpAndOtherTokenEvent).args;
        return { pairAddr, otherTokenContractAddr };
    }
});