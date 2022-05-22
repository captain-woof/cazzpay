import { useToast } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react"
import { UniswapPair, UniswapPairInfo, UniswapV2PairContract } from "../types/pair";
import { usePaypal } from "./usePaypal";
import useWalletConnection from "./useWalletConnection";
import BN from "bignumber.js";
import { useCazzPay } from "./useCazzPay";
import UniswapPairArtifact from "@uniswap/v2-core/build/UniswapV2Pair.json";
import { ethers } from "ethers";

export const useLiquidityProvider = () => {

    // For toast
    const toast = useToast();

    // For paypal logged in state
    const { paypalState } = usePaypal();

    // For wallet connection
    const { isConnected, providerWrapped } = useWalletConnection();

    // For CazzPay
    const { getCzpAndOtherTokenPair, getPriceOfTokenWithSymbol, withdrawLiquidityForCzpAndOtherToken, addLiquidityToCzpAndOtherTokenPair } = useCazzPay();


    ////////////////////////
    // FOR BUYING CZP
    ////////////////////////

    // For CZP dialog visible state
    const [buyCzpDialogVisible, setBuyCzpDialogVisible] = useState<boolean>(false);

    // For CZP buy amount
    const [czpBuyAmt, setCzpBuyAmt] = useState<string>("0");

    ////////////////////////
    // FOR LIQUIDITY OPS
    ////////////////////////

    // For selecting pair to view and work with
    const [pairSelected, setPairSelected] = useState<UniswapPair | null>(null);

    // Pair dialog visible
    const [pairDialogVisible, setPairDialogVisible] = useState<boolean>(false);

    // Pair information
    const [pairInfo, setPairInfo] = useState<UniswapPairInfo | null>(null);

    // Pair info progress
    const [pairInfoProgress, setPairInfoProgress] = useState<boolean>(false);

    // Liquidity to withdraw
    const [liquidityToWithdraw, setLiquidityToWithdraw] = useState<string>("");

    // Min CZP to withdrawr
    const [minCzpToWithdraw, setMinCzpToWithdraw] = useState<string>("");

    // Min other token to withdrawr
    const [minOtherTokenToWithdraw, setMinOtherTokenToWithdraw] = useState<string>("");

    // For withdraw progress
    const [liquidityWithdrawProgress, setLiquidityWithdrawProgress] = useState<boolean>(false);

    // For CZP price
    const [czpPriceAtomic, setCzpPriceAtomic] = useState<string>("0");

    // For other token price
    const [otherTokenPriceAtomic, setOtherTokenPriceAtomic] = useState<string>("0");

    // For CZP to deposit
    const [czpToDeposit, setCzpToDeposit] = useState<string>("0");

    // For other to deposit
    const [otherTokenToDeposit, setOtherTokenToDeposit] = useState<string>("0");

    // For CZP slippage
    const [czpToDepositSlippage, setCzpToDepositSlippage] = useState<string>("0");

    // For other slippage
    const [otherTokenToDepositSlippage, setOtherTokenToDepositSlippage] = useState<string>("0");

    // For adding liquidity progress
    const [addLiquidityProgress, setAddLiquidityProgress] = useState<boolean>(false);

    // For what should be constant
    const [whatChanged, setWhatChanged] = useState<"czpAmt" | "otherTokenAmt">("czpAmt");

    // Show pair dialog when a pair is selected
    useEffect(() => {
        setPairDialogVisible(!!pairSelected);
    }, [pairSelected])

    // Update pair display information when a pair is selected
    useEffect(() => {
        (async () => {
            if (!!pairSelected && isConnected) {
                try {
                    setPairInfoProgress(true);

                    // Get pair details
                    const details = await getCzpAndOtherTokenPair(pairSelected.otherTokenAddr);
                    setPairInfo({
                        liquidityAtomic: details?.liquidityAtomic || "0",
                        liquidityCzp: details?.liquidityCzp || "0",
                        liquidityOtherTokenAtomic: details?.liquidityOtherTokenAtomic || "0",
                        reserveCzpAtomic: details?.reserveCzpAtomic || "0",
                        reserveOtherTokenAtomic: details?.reserveOtherTokenAtomic || "0"
                    });
                } catch (e) {
                    console.error(e);
                    toast({
                        status: "error",
                        position: "bottom",
                        title: "Could not fetch pair details"
                    });
                } finally {
                    setPairInfoProgress(false);
                }
            }
        })()
    }, [pairSelected, isConnected]);

    // For token price update
    const [priceUpdateTimer, setPriceUpdateTimer] = useState<NodeJS.Timer>();
    useEffect(() => {
        (async () => {
            if (isConnected && !!pairSelected) {

                // Clear previous timer
                !!priceUpdateTimer && clearInterval(priceUpdateTimer);

                //Update price now
                const [newCzpPriceAtomic, newOtherTokenPriceAtomic] = await Promise.all([
                    getPriceOfTokenWithSymbol("CZP"),
                    getPriceOfTokenWithSymbol(pairSelected.otherTokenSymbol)
                ]);
                setCzpPriceAtomic(newCzpPriceAtomic?.toString() || "0");
                setOtherTokenPriceAtomic(newOtherTokenPriceAtomic?.toString() || "0");

                // Set timer to keep updating price
                const newPriceUpdateTimer = setInterval(async () => {
                    const [newCzpPriceAtomic, newOtherTokenPriceAtomic] = await Promise.all([
                        getPriceOfTokenWithSymbol("CZP"),
                        getPriceOfTokenWithSymbol(pairSelected.otherTokenSymbol)
                    ]);
                    setCzpPriceAtomic(newCzpPriceAtomic?.toString() || "0");
                    setOtherTokenPriceAtomic(newOtherTokenPriceAtomic?.toString() || "0");
                }, 10 * 1000);
                setPriceUpdateTimer(newPriceUpdateTimer);

                return () => { clearInterval(newPriceUpdateTimer); }
            }
        })();
    }, [pairSelected, isConnected]);

    // For CZP amt calculation
    useEffect(() => {
        if (whatChanged === "otherTokenAmt") {
            const newCzpToDeposit = (new BN(otherTokenToDeposit))
                .multipliedBy(
                    (new BN(otherTokenPriceAtomic)).div(czpPriceAtomic)
                )
                .toFixed(2);
            setCzpToDeposit(newCzpToDeposit);
        }
    }, [otherTokenPriceAtomic, czpPriceAtomic, whatChanged, otherTokenToDeposit]);

    // For token amt calculation
    useEffect(() => {
        if (whatChanged === "czpAmt") {
            const newOtherTokenToDeposit = (new BN(czpToDeposit))
                .multipliedBy(
                    (new BN(czpPriceAtomic)).div(otherTokenPriceAtomic)
                )
                .toFixed(2);
            setOtherTokenToDeposit(newOtherTokenToDeposit);
        }
    }, [otherTokenPriceAtomic, czpPriceAtomic, whatChanged, czpToDeposit]);



    // Function to add liquidity
    const handleAddLiquidity = useCallback(async () => {
        if (!!pairSelected) {
            setAddLiquidityProgress(true);

            // ADD LIQUDITY
            await addLiquidityToCzpAndOtherTokenPair(
                pairSelected.otherTokenAddr,
                czpToDeposit,
                otherTokenToDeposit,
                czpToDepositSlippage,
                otherTokenToDepositSlippage
            );

            setPairSelected(null);
            setCzpToDeposit("0");
            setOtherTokenToDeposit("0");
            setCzpToDepositSlippage("0");
            setOtherTokenToDepositSlippage("0");

            setAddLiquidityProgress(false);
        }
    }, [pairSelected, czpToDeposit, otherTokenToDeposit, czpToDepositSlippage, otherTokenToDepositSlippage]);

    // Function to withdraw liquidity
    const handleWithdrawLiquidity = useCallback(async () => {
        if (!!pairSelected) {
            setLiquidityWithdrawProgress(true);

            // WITHDRAW LIQUIDITY
            await withdrawLiquidityForCzpAndOtherToken(
                pairSelected.otherTokenAddr,
                liquidityToWithdraw,
                minCzpToWithdraw,
                minOtherTokenToWithdraw
            );

            setPairSelected(null);
            setMinCzpToWithdraw("");
            setMinOtherTokenToWithdraw("");
            setLiquidityToWithdraw("");

            setLiquidityWithdrawProgress(false);
        }
    }, [pairSelected, liquidityToWithdraw, minCzpToWithdraw, minOtherTokenToWithdraw]);

    return {
        buyCzpDialogVisible,
        setBuyCzpDialogVisible,
        czpBuyAmt,
        setCzpBuyAmt,
        pairSelected,
        setPairSelected,
        pairDialogVisible,
        setPairDialogVisible,
        pairInfo,
        pairInfoProgress,
        liquidityToWithdraw,
        setLiquidityToWithdraw,
        minCzpToWithdraw,
        setMinCzpToWithdraw,
        minOtherTokenToWithdraw,
        setMinOtherTokenToWithdraw,
        handleWithdrawLiquidity,
        liquidityWithdrawProgress,
        czpPriceAtomic,
        otherTokenPriceAtomic,
        czpToDeposit,
        setCzpToDeposit,
        otherTokenToDeposit,
        setOtherTokenToDeposit,
        czpToDepositSlippage,
        setCzpToDepositSlippage,
        otherTokenToDepositSlippage,
        setOtherTokenToDepositSlippage,
        addLiquidityProgress,
        handleAddLiquidity,
        setWhatChanged
    }
}