import { ethers } from "hardhat";
import { CazzPay, CazzPayToken, IERC20, UniswapFactory, UniswapRouter, UniswapV2Factory, UniswapV2Router02 } from "../typechain";
import { TestCoin } from "../typechain/TestCoin";
import { WrapperBuilder } from "redstone-evm-connector";
import { BigNumber, Contract, Signer } from "ethers";
import UniswapFactoryArtifact from "@uniswap/v2-core/build/UniswapV2Factory.json";
import UniswapRouterArtifact from "@uniswap/v2-periphery/build/UniswapV2Router02.json";
import UniswapWETHArtifact from "@uniswap/v2-periphery/build/WETH9.json";

// For Chai
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { AddedLiquidityToCzpAndOtherTokenPairEvent, CreatedPairWithCzpAndOtherTokenEvent } from "../typechain/CazzPay";
const { assert, expect } = chai.use(chaiAsPromised);

describe("CazzPay should function correctly", async () => {

    let czpTokenContract: CazzPayToken;
    let testCoinContract: TestCoin;
    let wethContract: IERC20;
    let uniswapFactoryContract: UniswapFactory;
    let uniswapRouterContract: UniswapRouter;
    let cazzPayContract: CazzPay;
    let cazzPayContractRedstoneWrapped: CazzPay;
    let signers: Array<Signer>;

    ///////////////////////////////
    // BEFORE HOOKS
    ///////////////////////////////
    before(async () => {
        // Deploy CZP
        czpTokenContract = await (await (await ethers.getContractFactory("CazzPayToken")).deploy(ethers.utils.parseEther("10000000"))).deployed();

        // Deploy TestCoin
        testCoinContract = await (await (await ethers.getContractFactory("TestCoin")).deploy(ethers.utils.parseEther("10000000"))).deployed();

        // Deploy WETH
        wethContract = await (await (await ethers.getContractFactoryFromArtifact({
            _format: "",
            abi: UniswapWETHArtifact.abi,
            bytecode: UniswapWETHArtifact.bytecode,
            contractName: "WETH9",
            deployedBytecode: UniswapWETHArtifact.evm.deployedBytecode.object,
            deployedLinkReferences: UniswapWETHArtifact.evm.deployedBytecode.linkReferences,
            linkReferences: UniswapWETHArtifact.evm.bytecode.linkReferences,
            sourceName: ""
        })).deploy()).deployed() as IERC20;

        // Get signers
        signers = await ethers.getSigners();
    });

    beforeEach(async () => {
        // Deploy Uniswap's contracts
        uniswapFactoryContract = await (await (await ethers.getContractFactoryFromArtifact({
            _format: "",
            abi: UniswapFactoryArtifact.abi,
            bytecode: UniswapFactoryArtifact.bytecode,
            contractName: "UniswapV2Factory",
            deployedBytecode: UniswapFactoryArtifact.evm.deployedBytecode.object,
            deployedLinkReferences: UniswapFactoryArtifact.evm.deployedBytecode.linkReferences,
            linkReferences: UniswapFactoryArtifact.evm.bytecode.linkReferences,
            sourceName: ""
        })).deploy(await signers[0].getAddress())).deployed() as UniswapV2Factory;

        uniswapRouterContract = await (await (await ethers.getContractFactoryFromArtifact({
            _format: "",
            abi: UniswapRouterArtifact.abi,
            bytecode: UniswapRouterArtifact.bytecode,
            contractName: "UniswapV2Router02",
            deployedBytecode: UniswapRouterArtifact.evm.deployedBytecode.object,
            deployedLinkReferences: UniswapRouterArtifact.evm.deployedBytecode.linkReferences,
            linkReferences: UniswapRouterArtifact.evm.bytecode.linkReferences,
            sourceName: ""
        })).deploy(uniswapFactoryContract.address, wethContract.address)).deployed() as UniswapV2Router02;

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

    it("CazzPay should correctly create a pair", async () => {
        const { otherTokenContractAddr, pairAddr } = await createPair();
        assert.equal(otherTokenContractAddr, testCoinContract.address, "Other token contract address is not correct!");
        assert.isString(pairAddr, "Invalid pair address returned!");
    });

    it("CazzPay should correctly return pairs on querying", async () => {
        const { pairAddr: czpAndTestCoinPairAddrExpected } = await createPair();
        expect(cazzPayContract.getCzpAndOtherTokenPoolAddr(testCoinContract.address)).eventually.equal(czpAndTestCoinPairAddrExpected, "Incorrect pair address on query!");

        const { pairAddr: czpAndWethPairAddrExpected } = await createPair(wethContract);
        const allPairs = await cazzPayContract.getAllPairsWithCzpAndOtherToken();
        assert.lengthOf(allPairs, 2, "Incorrect number of pairs returned!");
        assert.equal(allPairs[0], czpAndTestCoinPairAddrExpected, "Incorrect pair address returned!");
        assert.equal(allPairs[1], czpAndWethPairAddrExpected, "Incorrect pair address returned!");
    });

    it("CazzPay should handle CZP-OtherToken liquidity addition correctly", async () => {
        const czpLiquidityToProvide = "100";
        const tstLiquidityToProvide = "10";

        await createPair();
        const { czpAmtAdded, otherTokenAmtAdded, liquidityTokensMinted } = await addLiquidityToCzpAndTst(czpLiquidityToProvide, tstLiquidityToProvide);

        assert.isTrue(czpAmtAdded.eq(ethers.utils.parseEther(czpLiquidityToProvide)), "Incorrect amount of $CZP liquidity provided!");
        assert.isTrue(otherTokenAmtAdded.eq(ethers.utils.parseEther(tstLiquidityToProvide)), "Incorrect amount of $TST liquidity provided!");
        assert.isTrue(isValueInPercRange(liquidityTokensMinted, BigNumber.from("31622776601700000000"), 2), "Incorrect number of LP tokens minted!");
    });

    it("CazzPay should handle CZP-ETH liquidity addition correctly", async () => {
        const czpLiquidityToProvide = "2025";
        const ethLiquidityToProvide = "1";

        const { czpAmtAdded, otherTokenAmtAdded, liquidityTokensMinted } = await addLiquidityToCzpAndEth(czpLiquidityToProvide, ethLiquidityToProvide);

        assert.isTrue(czpAmtAdded.eq(ethers.utils.parseEther(czpLiquidityToProvide)), "Incorrect amount of $CZP liquidity provided!");
        assert.isTrue(otherTokenAmtAdded.eq(ethers.utils.parseEther(ethLiquidityToProvide)), "Incorrect amount of $TST liquidity provided!");
        assert.isTrue(isValueInPercRange(liquidityTokensMinted, BigNumber.from("45000000000000000000"), 2), "Incorrect number of LP tokens minted!");
    });

    //////////////////////////
    // HELPERS
    //////////////////////////

    const createPair = async (otherTokenContract: Contract = testCoinContract) => {
        const tx = await cazzPayContract.createPairWithCzpAndOtherToken(otherTokenContract.address);
        const rcpt = await tx.wait();
        const { pairAddr, otherTokenContractAddr } = (rcpt?.events?.find(({ event }) => (event === "CreatedPairWithCzpAndOtherToken")) as CreatedPairWithCzpAndOtherTokenEvent).args;
        return { pairAddr, otherTokenContractAddr };
    }

    const isValueInPercRange = (valActual: BigNumber, valExpected: BigNumber, rangePerc: number) => {
        const upperVal = valExpected.add(BigNumber.from(valExpected).mul(rangePerc).div(100));
        const lowerVal = valExpected.sub(BigNumber.from(valExpected).mul(rangePerc).div(100));
        return (
            valActual.lte(upperVal) && valActual.gte(lowerVal)
        );
    }

    const getValIncreased = (val: BigNumber, reductionPerc: number) => {
        return val.add(BigNumber.from(val).mul(reductionPerc).div(100));
    }

    const getValReduced = (val: BigNumber, reductionPerc: number) => {
        return val.sub(BigNumber.from(val).mul(reductionPerc).div(100));
    }

    const getDeadline = () => {
        return BigNumber.from((Date.now() / 1000).toFixed() + 120);
    }

    const addLiquidityToCzpAndTst = async (czpLiquidityToProvide: string, tstLiquidityToProvide: string) => {
        const czpLiquidityToProvideParsed = ethers.utils.parseEther(czpLiquidityToProvide);
        const tstLiquidityToProvideParsed = ethers.utils.parseEther(tstLiquidityToProvide);

        await czpTokenContract.connect(signers[0]).approve(cazzPayContract.address, czpLiquidityToProvideParsed);
        await testCoinContract.connect(signers[0]).approve(cazzPayContract.address, tstLiquidityToProvideParsed);

        const txn = await cazzPayContract.addLiquidityToCzpAndOtherTokenPair(testCoinContract.address, czpLiquidityToProvideParsed, tstLiquidityToProvideParsed, getValReduced(czpLiquidityToProvideParsed, 2), getValReduced(tstLiquidityToProvideParsed, 2), getDeadline());
        const { events } = await txn.wait();

        const { otherTokenAmtAdded, czpAmtAdded, otherTokenContractAddr, liquidityProviderAddr, liquidityTokensMinted } = (events?.find(({ event }) => (event === "AddedLiquidityToCzpAndOtherTokenPair")) as AddedLiquidityToCzpAndOtherTokenPairEvent)?.args;

        return {
            otherTokenAmtAdded,
            czpAmtAdded,
            otherTokenContractAddr,
            liquidityProviderAddr,
            liquidityTokensMinted
        }
    }

    const addLiquidityToCzpAndEth = async (czpLiquidityToProvide: string, ethLiquidityToProvide: string) => {
        const czpLiquidityToProvideParsed = ethers.utils.parseEther(czpLiquidityToProvide);
        const ethLiquidityToProvideParsed = ethers.utils.parseEther(ethLiquidityToProvide);

        await czpTokenContract.connect(signers[0]).approve(cazzPayContract.address, czpLiquidityToProvideParsed);

        const txn = await cazzPayContract.connect(signers[0]).addLiquidityToCzpAndEthPair(czpLiquidityToProvideParsed, getValReduced(czpLiquidityToProvideParsed, 2), getValReduced(ethLiquidityToProvideParsed, 2), getDeadline(), { value: ethLiquidityToProvideParsed });
        const { events } = await txn.wait();

        const { otherTokenAmtAdded, czpAmtAdded, otherTokenContractAddr, liquidityProviderAddr, liquidityTokensMinted } = (events?.find(({ event }) => (event === "AddedLiquidityToCzpAndOtherTokenPair")) as AddedLiquidityToCzpAndOtherTokenPairEvent)?.args;

        return {
            otherTokenAmtAdded,
            czpAmtAdded,
            otherTokenContractAddr,
            liquidityProviderAddr,
            liquidityTokensMinted
        }
    }
});