import { BigNumber, ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import useWalletConnection from "./useWalletConnection";
import CazzPayArtifact from "../contracts/CazzPay.json";
import CazzPayTokenArtifact from "../contracts/CazzPayToken.json";
import { CazzPay, CazzPayToken, ERC20 } from "../typechain";
import { WrapperBuilder } from "redstone-evm-connector";
import { AddedLiquidityToCzpAndOtherTokenPairEvent, BoughtWithCryptoEvent, CreatedPairWithCzpAndOtherTokenEvent, TokensSwappedEvent, WithdrawnLiquidityFromCzpAndOtherTokenPairEvent } from "../typechain/CazzPay";
import { UniswapPair, UniswapPairInfo, UniswapV2PairContract } from "../types/pair";
import UniswapPairArtifact from "@uniswap/v2-core/build/UniswapV2Pair.json";
import ERC20Artifact from "@uniswap/v2-core/build/ERC20.json";
import BN from "bignumber.js";
import axios, { AxiosResponse } from "axios";
import { useToast } from "@chakra-ui/react";
import { MockableContract } from "redstone-evm-connector/lib/utils/v2/impl/builder/MockableEthersContractWrapperBuilder";

/////////////////////////////
// CONSTANT FUNCS
/////////////////////////////
const getDeadline = () => {
    return BigNumber.from((Date.now() / 1000).toFixed() + 120);
};

const getValIncreased = (val: string | number, percIncrease: string | number) => (
    (new BN(val)).plus(
        new BN(val).multipliedBy(percIncrease).div(100)
    ).toString()
);

const getValDecreased = (val: string | number, percDecrease: string | number) => (
    (new BN(val)).minus(
        new BN(val).multipliedBy(percDecrease).div(100)
    ).toString()
);

const sleep = (sleepDurationInSecs: number) => (new Promise((resolve) => {
    setTimeout(resolve, sleepDurationInSecs * 1000);
}));


/////////////////////////////
// HOOKS
/////////////////////////////
export const useCazzPay = () => {

    const { providerWrapped, signer } = useWalletConnection();
    const toast = useToast();

    ///////////////////////////
    // VALUES
    ///////////////////////////

    const [cazzPayContract, setCazzPayContract] = useState<CazzPay | null>(null);
    const [cazzPayContractConnected, setCazzPayContractConnected] = useState<CazzPay | null>(null);
    const [cazzPayContractRedstoneWrapped, setCazzPayContractRedstoneWrapped] = useState<MockableContract<CazzPay> | null>(null);
    const [cazzPayTokenContract, setCazzPayTokenContract] = useState<CazzPayToken | null>(null);
    const [cazzPayTokenContractConnected, setCazzPayTokenContractConnected] = useState<CazzPayToken | null>(null);

    ///////////////////////////
    // EFFECTS
    ///////////////////////////

    useEffect(() => {
        if (!!providerWrapped && !!signer) {
            // Make new instances of CazzPayContract
            const newCazzPayContract = new ethers.Contract(process.env.NEXT_PUBLIC_CAZZPAY_CONTRACT_ADDR as string, CazzPayArtifact.abi, providerWrapped) as CazzPay;
            const newCazzPayContractConnected = newCazzPayContract.connect(signer);
            const newCazzPayContractRedstoneWrapped = WrapperBuilder
                .mockLite(newCazzPayContractConnected)
                .using({
                    ETH: 2000,
                    CZP: 1,
                    TST: 10,
                    WETH: 2000
                });

            // Make new instances of CZP contract
            const newCazzPayTokenContract = new ethers.Contract(process.env.NEXT_PUBLIC_CZP_CONTRACT_ADDR as string, CazzPayTokenArtifact.abi, providerWrapped) as CazzPayToken;
            const newCazzPayTokenContractConnected = newCazzPayTokenContract.connect(signer);

            // Set new contracts
            setCazzPayContract(newCazzPayContract);
            setCazzPayContractConnected(newCazzPayContractConnected);
            setCazzPayContractRedstoneWrapped(newCazzPayContractRedstoneWrapped);
            setCazzPayTokenContract(newCazzPayTokenContract);
            setCazzPayTokenContractConnected(newCazzPayTokenContractConnected);
        } else {
            setCazzPayContract(null);
            setCazzPayContractConnected(null);
            setCazzPayContractRedstoneWrapped(null);
            setCazzPayTokenContract(null);
            setCazzPayTokenContractConnected(null);
        }
    }, [providerWrapped, signer]);

    ///////////////////////////
    // FUNCTIONS
    ///////////////////////////

    const getPriceOfTokenWithSymbol = useCallback(async (tokenSymbol: string) => {
        if (!!cazzPayContractRedstoneWrapped) {
            return await cazzPayContractRedstoneWrapped.getPriceOfTokenInCzpWithTokenSymbol(tokenSymbol);
        }
    }, [cazzPayContractRedstoneWrapped]);

    const getPriceOfTokenWithAddress = useCallback(async (tokenAddress: string) => {
        if (!!cazzPayContractRedstoneWrapped) {
            return await cazzPayContractRedstoneWrapped.getPriceOfTokenInCzpWithTokenAddress(tokenAddress);
        }
    }, [cazzPayContractRedstoneWrapped]);

    const createPairWithCzpAndOtherToken = useCallback(async (
        otherTokenAddress: string
    ) => {
        if (!!cazzPayContractConnected) {
            try {
                const txn = await cazzPayContractConnected.createPairWithCzpAndOtherToken(
                    otherTokenAddress
                );
                const { events } = await txn.wait();
                const { pairAddr, otherTokenContractAddr } = (
                    events?.find(
                        ({ event }) => event === "CreatedPairWithCzpAndOtherToken"
                    ) as CreatedPairWithCzpAndOtherTokenEvent
                )?.args;

                toast({
                    status: "success",
                    title: "Pair created",
                    position: "bottom"
                });

                return {
                    pairAddr,
                    otherTokenContractAddr,
                };
            } catch (e: any) {
                toast({
                    status: "error",
                    title: "Failed to create pair",
                    description: e?.message,
                    position: "bottom"
                });
            }
        }
    }, [cazzPayContractConnected, toast]);

    const createPairWithCzpAndEth = useCallback(async () => {
        if (!!cazzPayContractConnected) {
            try {
                const tx = await cazzPayContractConnected.createPairWithCzpAndEth();
                const { events } = await tx.wait();
                const { pairAddr, otherTokenContractAddr } = (
                    events?.find(
                        ({ event }) => event === "CreatedPairWithCzpAndOtherToken"
                    ) as CreatedPairWithCzpAndOtherTokenEvent
                )?.args;

                toast({
                    status: "success",
                    title: "Pair created",
                    position: "bottom"
                });

                return {
                    pairAddr,
                    otherTokenContractAddr,
                };
            } catch (e: any) {
                toast({
                    status: "error",
                    title: "Failed to create pair",
                    description: e?.message,
                    position: "bottom"
                });
            }
        }
    }, [cazzPayContractConnected, toast]);

    const getCzpAndOtherTokenPairAddr = useCallback(async (
        otherTokenAddress: string
    ) => {
        if (!!cazzPayContract) {
            return await cazzPayContract.getCzpAndOtherTokenPairAddr(otherTokenAddress);
        }
    }, [cazzPayContract]);

    const getCzpAndOtherTokenPair = useCallback(async (
        otherTokenAddress: string
    ): Promise<(UniswapPair & UniswapPairInfo) | undefined> => {
        if (!!cazzPayContractConnected) {
            const pairAddr = await cazzPayContractConnected.getCzpAndOtherTokenPairAddr(otherTokenAddress);

            const pairContract = new ethers.Contract(pairAddr, UniswapPairArtifact.abi, providerWrapped) as UniswapV2PairContract;

            // Get other token address
            const [token0Addr, token1Addr, reserves, liquidity, liquidityTotal] = await Promise.all([
                pairContract.token0(),
                pairContract.token1(),
                pairContract.getReserves(),
                pairContract.balanceOf(await cazzPayContractConnected.signer.getAddress()),
                pairContract.totalSupply()
            ]);

            let otherTokenAddr: string, otherTokenReserve: BigNumber, czpReserve: BigNumber;
            if (token0Addr.toLowerCase() === process.env.NEXT_PUBLIC_CZP_CONTRACT_ADDR?.toLowerCase()) {
                otherTokenAddr = token1Addr;
                otherTokenReserve = reserves._reserve1;
                czpReserve = reserves._reserve0;
            } else {
                otherTokenAddr = token0Addr;
                otherTokenReserve = reserves._reserve0;
                czpReserve = reserves._reserve1;
            }

            // Get other token details
            const otherTokenContract = new ethers.Contract(otherTokenAddr, ERC20Artifact.abi, providerWrapped) as ERC20;
            const [otherTokenName, otherTokenSymbol, otherTokenDecimals] = await Promise.all([
                otherTokenContract.name(),
                otherTokenContract.symbol(),
                otherTokenContract.decimals()
            ]);

            return {
                pairAddr,
                otherTokenAddr,
                otherTokenName,
                otherTokenSymbol,
                otherTokenDecimals,
                liquidityAtomic: liquidity.toString(),
                liquidityCzp: (new BN(liquidity.toString()))
                    .div(liquidityTotal.toString())
                    .multipliedBy(czpReserve.toString())
                    .toFixed(0),
                liquidityOtherTokenAtomic: (new BN(liquidity.toString()))
                    .div(liquidityTotal.toString())
                    .multipliedBy(otherTokenReserve.toString())
                    .toFixed(0),
                reserveCzpAtomic: czpReserve.toString(),
                reserveOtherTokenAtomic: otherTokenReserve.toString()
            }
        }
    }, [cazzPayContractConnected]);

    const getAllPairsAddrsWithCzpAndOtherToken = useCallback(async (
    ) => {
        if (!!cazzPayContract) {
            return await cazzPayContract.getAllPairsWithCzpAndOtherToken();
        }
    }, [cazzPayContract]);

    const getAllPairsWithCzpAndOtherToken = useCallback(async () => {
        if (!!cazzPayContract && !!providerWrapped) {
            const pairAddrs = await cazzPayContract.getAllPairsWithCzpAndOtherToken();
            const pairs: Array<UniswapPair> = [];

            // Find all pair details
            for await (let pairAddr of pairAddrs) {
                const pairContract = new ethers.Contract(pairAddr, UniswapPairArtifact.abi, providerWrapped) as UniswapV2PairContract;

                // Get other token address
                const [token0Addr, token1Addr] = await Promise.all([
                    pairContract.token0(),
                    pairContract.token1()
                ]);
                let otherTokenAddr;
                if (token0Addr.toLowerCase() === process.env.NEXT_PUBLIC_CZP_CONTRACT_ADDR) {
                    otherTokenAddr = token0Addr;
                } else {
                    otherTokenAddr = token1Addr;
                }

                // Get other token details
                const otherTokenContract = new ethers.Contract(otherTokenAddr, ERC20Artifact.abi, providerWrapped) as ERC20;
                const [otherTokenName, otherTokenSymbol, otherTokenDecimals] = await Promise.all([
                    otherTokenContract.name(),
                    otherTokenContract.symbol(),
                    otherTokenContract.decimals()
                ]);

                // Store results
                pairs.push({
                    pairAddr,
                    otherTokenAddr,
                    otherTokenName,
                    otherTokenSymbol,
                    otherTokenDecimals
                });
            }

            return pairs;
        }
    }, [cazzPayContract, providerWrapped]);

    const addLiquidityToCzpAndOtherTokenPair = useCallback(async (
        otherTokenAddress: string,
        czpAmountToDeposit: string,
        otherTokenAmountToDeposit: string,
        czpSlippagePerc: string,
        otherTokenSlippagePerc: string
    ) => {
        if (!!cazzPayContractConnected && !!signer && !!cazzPayTokenContractConnected) {
            try {
                const otherTokenContract = new ethers.Contract(otherTokenAddress, ERC20Artifact.abi, signer) as ERC20;

                // Calculate and parse token amounts
                const parsedCzpAmount = ethers.utils.parseEther(czpAmountToDeposit);
                const parsedOtherTokenAmount = ethers.utils.parseUnits(
                    otherTokenAmountToDeposit,
                    (await otherTokenContract.decimals())
                );
                const parsedCzpMinAmount = getValDecreased(parsedCzpAmount.toString(), czpSlippagePerc);
                const parsedOtherTokenMinAmount = getValDecreased(parsedOtherTokenAmount.toString(), otherTokenSlippagePerc);

                // Approve tokens
                const [approveTxCazzPay, approveTxOtherToken] = await Promise.all([
                    cazzPayTokenContractConnected.approve(cazzPayContractConnected.address, parsedCzpAmount),
                    otherTokenContract.approve(cazzPayContractConnected.address, parsedOtherTokenAmount)
                ]);
                await Promise.all([
                    approveTxCazzPay.wait(),
                    approveTxOtherToken.wait()
                ]);

                // Perform transactions
                const tx = await cazzPayContractConnected
                    .addLiquidityToCzpAndOtherTokenPair(
                        otherTokenAddress,
                        parsedCzpAmount,
                        parsedOtherTokenAmount,
                        parsedCzpMinAmount,
                        parsedOtherTokenMinAmount,
                        getDeadline()
                    );
                const { events } = await tx.wait();
                const {
                    otherTokenAmtAdded,
                    czpAmtAdded,
                    otherTokenContractAddr,
                    liquidityProviderAddr,
                    liquidityTokensMinted,
                } = (
                    events?.find(
                        ({ event }) => event === "AddedLiquidityToCzpAndOtherTokenPair"
                    ) as AddedLiquidityToCzpAndOtherTokenPairEvent
                )?.args;

                toast({
                    status: "success",
                    title: "Liquidity added",
                    position: "bottom"
                });

                return {
                    otherTokenAmtAdded,
                    czpAmtAdded,
                    otherTokenContractAddr,
                    liquidityProviderAddr,
                    liquidityTokensMinted,
                };
            } catch (e: any) {
                toast({
                    status: "error",
                    title: "Failed to add liquidity",
                    description: e?.message,
                    position: "bottom"
                });
            }
        }
    }, [cazzPayContractConnected, signer, cazzPayTokenContractConnected, toast]);

    const addLiquidityToCzpAndEthPair = useCallback(async (
        czpAmountToDeposit: string,
        ethAmountToDeposit: string,
        czpSlippagePerc: string,
        ethSlippagePerc: string
    ) => {
        if (!!cazzPayTokenContractConnected && !!signer && !!cazzPayContractConnected) {

            try {
                const parsedCzpAmount = ethers.utils.parseEther(czpAmountToDeposit);
                const parsedEthAmount = ethers.utils.parseEther(ethAmountToDeposit);
                const parsedCzpMinAmount = getValDecreased(parsedCzpAmount.toString(), czpSlippagePerc);
                const parsedEthMinAmount = getValDecreased(parsedEthAmount.toString(), ethSlippagePerc);

                const approveTx = await cazzPayTokenContractConnected.approve(cazzPayContractConnected.address, parsedCzpAmount);
                await approveTx.wait();

                const tx = await cazzPayContractConnected
                    .addLiquidityToCzpAndEthPair(
                        czpAmountToDeposit,
                        parsedCzpMinAmount,
                        parsedEthMinAmount,
                        getDeadline(),
                        { value: parsedEthAmount }
                    );
                const { events } = await tx.wait();
                const {
                    otherTokenAmtAdded,
                    czpAmtAdded,
                    otherTokenContractAddr,
                    liquidityProviderAddr,
                    liquidityTokensMinted,
                } = (
                    events?.find(
                        ({ event }) => event === "AddedLiquidityToCzpAndOtherTokenPair"
                    ) as AddedLiquidityToCzpAndOtherTokenPairEvent
                )?.args;

                toast({
                    status: "success",
                    title: "Liquidity added",
                    position: "bottom"
                });

                return {
                    otherTokenAmtAdded,
                    czpAmtAdded,
                    otherTokenContractAddr,
                    liquidityProviderAddr,
                    liquidityTokensMinted,
                };

            } catch (e: any) {
                toast({
                    status: "error",
                    title: "Failed to add liquidity",
                    description: e?.message,
                    position: "bottom"
                });
            }
        }
    }, [cazzPayTokenContractConnected, signer, cazzPayContractConnected, toast]);

    const withdrawLiquidityForCzpAndOtherToken = useCallback(async (
        otherTokenAddress: string,
        liquidityToWithdraw: string,
        minCzpToReceive: string,
        minOtherTokenToReceive: string
    ) => {

        if (!!cazzPayContractConnected && !!signer) {

            try {
                const pairTokenAddress = await cazzPayContractConnected.getCzpAndOtherTokenPairAddr(
                    otherTokenAddress
                );
                const pairContract = new ethers.Contract(pairTokenAddress, UniswapPairArtifact.abi, signer) as UniswapV2PairContract;
                const otherTokenContract = new ethers.Contract(otherTokenAddress, ERC20Artifact.abi, signer) as ERC20;
                const minCzpToReceiveParsed = ethers.utils.parseEther(minCzpToReceive);
                const minOtherTokenToReceiveParsed = ethers.utils.parseUnits(minOtherTokenToReceive, await otherTokenContract.decimals());
                const liquidityToWithdrawParsed = ethers.utils.parseUnits(liquidityToWithdraw, 18);

                // Approve liquidity transfer
                const approveTx = await pairContract.approve(cazzPayContractConnected.address, liquidityToWithdrawParsed);
                await approveTx.wait();

                // Perform tx
                const tx = await cazzPayContractConnected
                    .withdrawLiquidityForCzpAndOtherToken(
                        otherTokenAddress,
                        liquidityToWithdrawParsed,
                        minCzpToReceiveParsed,
                        minOtherTokenToReceiveParsed,
                        getDeadline()
                    );
                const { events } = await tx.wait();
                const { czpAmtWithdrawn, otherTokenAmtWithdrawn, liquidityTokensSubmitted } =
                    (
                        events?.find(
                            ({ event }) => event === "WithdrawnLiquidityFromCzpAndOtherTokenPair"
                        ) as WithdrawnLiquidityFromCzpAndOtherTokenPairEvent
                    ).args;

                toast({
                    status: "success",
                    title: "Liquidity withdrawn",
                    position: "bottom"
                });

                return {
                    czpAmtWithdrawn,
                    otherTokenAmtWithdrawn,
                    liquidityTokensSubmitted
                };
            } catch (e: any) {
                toast({
                    status: "error",
                    title: "Failed to withdraw",
                    description: e?.message,
                    position: "bottom"
                });
            }
        }
    }, [cazzPayContractConnected, signer, toast]);

    const withdrawLiquidityForCzpAndEth = useCallback(async (
        liquidityToWithdraw: string,
        minCzpToReceive: string,
        minEthToReceive: string
    ) => {
        if (!!cazzPayContractConnected && !!signer) {

            try {
                const pairTokenAddress = await cazzPayContractConnected.getCzpAndOtherTokenPairAddr(
                    process.env.NEXT_PUBLIC_WETH_CONTRACT_ADDR as string
                );
                const pairContract = new ethers.Contract(pairTokenAddress, UniswapPairArtifact.abi, signer) as UniswapV2PairContract;
                const minCzpToReceiveParsed = ethers.utils.parseEther(minCzpToReceive);
                const minEthToReceiveParsed = ethers.utils.parseEther(minEthToReceive);
                const liquidityToWithdrawParsed = ethers.utils.parseUnits(liquidityToWithdraw, 18);

                // Approve liquidity transfer
                const approveTx = await pairContract.approve(cazzPayContractConnected.address, liquidityToWithdrawParsed);
                await approveTx.wait();

                // Perform transaction
                const tx = await cazzPayContractConnected
                    .withdrawLiquidityForCzpAndEth(
                        liquidityToWithdrawParsed,
                        minCzpToReceiveParsed,
                        minEthToReceiveParsed,
                        getDeadline()
                    );
                const { events } = await tx.wait();
                const {
                    czpAmtWithdrawn,
                    otherTokenAmtWithdrawn: ethTokenAmtWithdrawn,
                    liquidityTokensSubmitted,
                } = (
                    events?.find(
                        ({ event }) => event === "WithdrawnLiquidityFromCzpAndOtherTokenPair"
                    ) as WithdrawnLiquidityFromCzpAndOtherTokenPairEvent
                ).args;

                toast({
                    status: "success",
                    title: "Liquidity withdrawn",
                    position: "bottom"
                });

                return {
                    czpAmtWithdrawn,
                    ethTokenAmtWithdrawn,
                    liquidityTokensSubmitted,
                };
            } catch (e: any) {
                toast({
                    status: "error",
                    title: "Failed to withdraw",
                    description: e?.message,
                    position: "bottom"
                });
            }
        }
    }, [cazzPayContractConnected, signer]);

    const buyWithCryptoToken = useCallback(async (
        recipientAccountIdToPay: string,
        otherTokenAddress: string,
        otherTokenAmount: string,
        otherTokenSlippage: string,
        fiatAmtToPay: string
    ) => {

        if (!!signer && !!cazzPayContractConnected) {

            try {
                const otherTokenContract = new ethers.Contract(otherTokenAddress, ERC20Artifact.abi, signer) as ERC20;
                const parsedFiatAmt = ethers.utils.parseEther(fiatAmtToPay);
                const otherTokenAmountMax = getValIncreased(otherTokenAmount, otherTokenSlippage);
                const otherTokenAmountMaxParsed = ethers.utils.parseUnits(otherTokenAmountMax, await otherTokenContract.decimals());

                // Approve token transfer
                const approveTxn = await otherTokenContract.connect(signer).approve(cazzPayContractConnected.address, otherTokenAmountMaxParsed);
                await approveTxn.wait();
                toast({
                    status: "info",
                    title: "Approved tokens",
                    position: "bottom"
                });

                // Perform transaction
                const tx = await cazzPayContractConnected
                    .buyWithCryptoToken(
                        recipientAccountIdToPay,
                        otherTokenAddress,
                        otherTokenAmountMaxParsed,
                        parsedFiatAmt,
                        getDeadline()
                    );
                const { events, transactionHash } = await tx.wait();
                const buyEvent = events?.find(
                    ({ event }) => event === "BoughtWithCrypto"
                ) as BoughtWithCryptoEvent;
                const {
                    payerWalletAddr,
                    recipientAccountId,
                    cazzPayTransactionId,
                    tokenAmtUsedForPurchased,
                    tokenUsedForPurchaseContractAddr,
                    fiatAmountPaid,
                    fiatAmountToPayToSeller,
                } = buyEvent?.args;

                // Keep sending verification request to backend until it succeeds
                const maxTries = 3;
                let res: AxiosResponse<any, any> | null = null;

                for (let currTry = 0; currTry < maxTries; currTry++) {
                    toast({
                        status: "loading",
                        title: currTry === 0 ? "Verifying transaction..." : "Re-attempting verification...",
                        position: "bottom"
                    });

                    await sleep((currTry + 1) * 5);

                    try {
                        res = await axios.get("/api/sellers/confirmPurchase", {
                            params: {
                                cazzPayTransactionId: cazzPayTransactionId.toString()
                            }
                        });
                    } catch { }

                    if (res?.status === 200) {
                        break;
                    }
                }

                if (res?.status === 200) {
                    toast({
                        status: "success",
                        title: "Transfer confirmed",
                        position: "bottom"
                    });

                    return {
                        payerWalletAddr,
                        recipientAccountId,
                        cazzPayTransactionId,
                        tokenAmtUsedForPurchased,
                        tokenUsedForPurchaseContractAddr,
                        fiatAmountPaid,
                        fiatAmountToPayToSeller,
                        transactionHash
                    };
                } else {
                    throw Error(res?.data);
                }
            } catch (e: any) {
                toast({
                    status: "error",
                    title: "Transfer failed",
                    description: e?.data,
                    position: "bottom"
                });
            }
        }
    }, [cazzPayContractConnected, signer, toast]);

    const buyWithEth = useCallback(async (
        recipientAccountIdToPay: string,
        ethAmtToPay: string,
        fiatAmtToPay: string
    ) => {

        if (!!signer && !!cazzPayContractConnected) {

            try {
                const ethAmtToPayParsed = ethers.utils.parseEther(ethAmtToPay);
                const fiatAmtToPayParsed = ethers.utils.parseEther(fiatAmtToPay);

                // Execute transaction
                const tx = await cazzPayContractConnected.buyWithEth(
                    recipientAccountIdToPay,
                    fiatAmtToPayParsed,
                    getDeadline(),
                    {
                        value: ethAmtToPayParsed
                    }
                );

                const { events } = await tx.wait();
                const buyEvent = events?.find(
                    ({ event }) => event === "BoughtWithCrypto"
                ) as BoughtWithCryptoEvent;
                const {
                    payerWalletAddr,
                    recipientAccountId,
                    cazzPayTransactionId,
                    tokenAmtUsedForPurchased,
                    tokenUsedForPurchaseContractAddr,
                    fiatAmountPaid,
                    fiatAmountToPayToSeller,
                } = buyEvent?.args;

                // Send verification request to backend
                const res = await axios.get("/api/sellers/confirmPurchase", {
                    params: {
                        cazzPayTransactionId
                    }
                });

                if (res.status === 200) {
                    toast({
                        status: "success",
                        title: "Transfer confirmed",
                        position: "bottom"
                    });

                    return {
                        payerWalletAddr,
                        recipientAccountId,
                        cazzPayTransactionId,
                        tokenAmtUsedForPurchased,
                        tokenUsedForPurchaseContractAddr,
                        fiatAmountPaid,
                        fiatAmountToPayToSeller,
                    };
                } else {
                    throw Error(res.data);
                }
            } catch (e: any) {
                toast({
                    status: "error",
                    title: "Transfer failed",
                    description: e?.data,
                    position: "bottom"
                });
            }
        }
    }, [cazzPayContractConnected, signer, toast]);

    const swapOtherTokensForCzp = useCallback(async (
        otherTokenContractAddress: string,
        otherTokenAmtToSwap: string,
        czpToGet: string,
        czpSlippagePerc: string
    ) => {

        if (!!signer && !!cazzPayContractConnected) {
            try {
                const otherTokenContract = new ethers.Contract(otherTokenContractAddress, ERC20Artifact.abi, signer) as ERC20;
                const otherTokenAmtToSwapParsed = ethers.utils.parseUnits(otherTokenAmtToSwap, await otherTokenContract.decimals());
                const czpAmtToGetMinParsed = getValDecreased(ethers.utils.parseEther(czpToGet).toString(), czpSlippagePerc);

                // Approve token transfer
                const approveTx = await otherTokenContract.connect(signer).approve(cazzPayContractConnected.address, otherTokenAmtToSwapParsed);
                await approveTx.wait();

                // Perform transaction
                const tx = await cazzPayContractConnected.swapOtherTokensForCzp(
                    otherTokenContractAddress,
                    otherTokenAmtToSwapParsed,
                    czpAmtToGetMinParsed,
                    getDeadline()
                );

                const { events } = await tx.wait();
                const {
                    inputTokenAmt,
                    inputTokenContractAddr,
                    outputTokenAmt,
                    outputTokenContractAddr,
                } = (
                    events?.find(({ event }) => event === "TokensSwapped") as TokensSwappedEvent
                )?.args;

                toast({
                    status: "success",
                    title: "Swap successful",
                    position: "bottom"
                });

                return {
                    inputTokenAmt,
                    inputTokenContractAddr,
                    outputTokenAmt,
                    outputTokenContractAddr,
                };
            } catch (e: any) {
                toast({
                    status: "error",
                    title: "Swap failed",
                    description: e?.message,
                    position: "bottom"
                });
            }
        }
    }, [cazzPayContractConnected, signer, toast]);

    const swapCzpForOtherTokens = useCallback(async (
        otherTokenAddress: string,
        czpAmtToSwap: string,
        otherTokenAmt: string,
        otherTokenSlippagePerc: string
    ) => {
        if (!!signer && !!cazzPayContractConnected && !!cazzPayTokenContractConnected) {
            try {
                const otherTokenContract = new ethers.Contract(otherTokenAddress, ERC20Artifact.abi, signer) as ERC20;
                const otherTokenAmtToGetParsed = ethers.utils.parseUnits(otherTokenAmt, await otherTokenContract.decimals());
                const otherTokenMinAmtToGetParsed = getValDecreased(otherTokenAmtToGetParsed.toString(), otherTokenSlippagePerc);
                const czpAmtToSwapParsed = ethers.utils.parseEther(czpAmtToSwap);

                // Approve CZP transfer
                const approveTx = await cazzPayTokenContractConnected.approve(cazzPayContractConnected.address, czpAmtToSwapParsed);
                await approveTx.wait();

                // Perform transaction
                const tx = await cazzPayContractConnected.swapCzpForOtherTokens(
                    otherTokenAddress,
                    czpAmtToSwapParsed,
                    otherTokenMinAmtToGetParsed,
                    getDeadline()
                );
                const { events } = await tx.wait();
                const {
                    inputTokenAmt,
                    inputTokenContractAddr,
                    outputTokenAmt,
                    outputTokenContractAddr,
                } = (
                    events?.find(({ event }) => event === "TokensSwapped") as TokensSwappedEvent
                )?.args;

                toast({
                    status: "success",
                    title: "Swap successful",
                    position: "bottom"
                });

                return {
                    inputTokenAmt,
                    inputTokenContractAddr,
                    outputTokenAmt,
                    outputTokenContractAddr,
                };
            } catch (e: any) {
                toast({
                    status: "error",
                    title: "Swap failed",
                    description: e?.message,
                    position: "bottom"
                });
            }
        }
    }, [signer, cazzPayContractConnected, cazzPayTokenContractConnected, toast]);

    const storeSellerInfo = useCallback(async (name: string, email: string, id: string) => {
        const res = await axios.get("/api/sellers/storeSellerInfo", {
            params: {
                name,
                email,
                id
            }
        });
        if (res.status === 500) {
            throw Error(res.data);
        } else {
            return res.data;
        }
    }, []);

    return {
        cazzPayContract,
        cazzPayContractConnected,
        cazzPayContractRedstoneWrapped,
        cazzPayTokenContract,
        cazzPayTokenContractConnected,
        getPriceOfTokenWithAddress,
        getPriceOfTokenWithSymbol,
        createPairWithCzpAndOtherToken,
        createPairWithCzpAndEth,
        getCzpAndOtherTokenPair,
        getCzpAndOtherTokenPairAddr,
        getAllPairsAddrsWithCzpAndOtherToken,
        getAllPairsWithCzpAndOtherToken,
        addLiquidityToCzpAndOtherTokenPair,
        addLiquidityToCzpAndEthPair,
        withdrawLiquidityForCzpAndOtherToken,
        withdrawLiquidityForCzpAndEth,
        buyWithCryptoToken,
        buyWithEth,
        swapOtherTokensForCzp,
        swapCzpForOtherTokens,
        storeSellerInfo
    }
}