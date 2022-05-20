import { useToast } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react"
import { UniswapPair, UniswapPairInfo } from "../types/pair";
import { usePaypal } from "./usePaypal";
import useWalletConnection from "./useWalletConnection";
import BN from "bignumber.js";

export const useLiquidityProvider = () => {

    // For toast
    const toast = useToast();

    // For paypal logged in state
    const { paypalState } = usePaypal();

    // For wallet connection
    const { isConnected } = useWalletConnection();


    ////////////////////////
    // FOR BUYING CZP
    ////////////////////////

    // For CZP dialog visible state
    const [buyCzpDialogVisible, setBuyCzpDialogVisible] = useState<boolean>(false);

    // Buy czp progress
    const [buyCzpProgress, setBuyCzpProgress] = useState<boolean>(false);

    // For CZP buy amount
    const [czpBuyAmt, setCzpBuyAmt] = useState<string>("0");

    // Function to buy CZP
    const handleBuyCzp = useCallback(async () => {
        try {
            setBuyCzpProgress(true);

            // TODO
            window.alert("TODO: BUY CZP");

            setCzpBuyAmt("");
            setBuyCzpDialogVisible(false);
            toast({
                position: "bottom",
                status: "success",
                title: "Purchase successful"
            });
        } catch (e: any) {
            toast({
                position: "bottom",
                status: "error",
                title: e?.message || "Unexpected error! Please try again."
            });
        } finally {
            setBuyCzpProgress(false);
        }
    }, [toast]);

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
        if (!!pairSelected) {
            // TODO: FETCH PAIR INFO FROM ADDR
            try {
                setPairInfoProgress(true);

                setPairInfo({
                    liquidityAtomic: "100000000000000000000",
                    liquidityCzp: "100000000000000000000",
                    liquidityOtherTokenAtomic: "10000000000000000000",
                    reserveCzpAtomic: "1000000000000000000000",
                    reserveOtherTokenAtomic: "230000000000000000000"
                });
            } catch {

            } finally {
                setPairInfoProgress(false);
            }
        }
    }, [pairSelected]);

    // For token price update
    const [priceUpdateTimer, setPriceUpdateTimer] = useState<NodeJS.Timer>();
    useEffect(() => {
        if (isConnected && !!pairSelected) {

            // Clear previous timer
            !!priceUpdateTimer && clearInterval(priceUpdateTimer);

            // TODO: Update price now
            setCzpPriceAtomic("10000000000000000000");
            setOtherTokenPriceAtomic("1000000000000000000000");

            // Set timer to keep updating price
            const newPriceUpdateTimer = setInterval(() => {
                // TODO: FETCH TOKEN PRICE
                setCzpPriceAtomic("10000000000000000000");
                setOtherTokenPriceAtomic("1000000000000000000000");
            }, 10 * 1000);
            setPriceUpdateTimer(newPriceUpdateTimer);

            return () => { clearInterval(newPriceUpdateTimer); }
        }
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
        try {
            setAddLiquidityProgress(true);

            //TODO: WITHDRAW LIQUIDITY
            window?.alert("TODO: ADD LIQUIDITY");

            toast({
                position: "bottom",
                status: "success",
                title: "Liquidity added"
            });
            setPairSelected(null);
            setCzpToDeposit("0");
            setOtherTokenToDeposit("0");
            setCzpToDepositSlippage("0");
            setOtherTokenToDepositSlippage("0");
        } catch (e: any) {
            toast({
                position: "bottom",
                status: "error",
                title: e?.message || "Unexpected error! Please try again."
            });
        } finally {
            setAddLiquidityProgress(false);
        }
    }, [toast]);

    // Function to withdraw liquidity
    const handleWithdrawLiquidity = useCallback(async () => {
        try {
            setLiquidityWithdrawProgress(true);

            //TODO: WITHDRAW LIQUIDITY
            window?.alert("TODO: WITHDRAW LIQUIDITY");

            toast({
                position: "bottom",
                status: "success",
                title: "Liquidity withdrawn"
            });
            setPairSelected(null);
            setMinCzpToWithdraw("");
            setMinOtherTokenToWithdraw("");
            setLiquidityToWithdraw("");
        } catch (e: any) {
            toast({
                position: "bottom",
                status: "error",
                title: e?.message || "Unexpected error! Please try again."
            });
        } finally {
            setLiquidityWithdrawProgress(false);
        }
    }, [toast]);

    return {
        handleBuyCzp,
        buyCzpDialogVisible,
        setBuyCzpDialogVisible,
        buyCzpProgress,
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