import { useToast } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react"
import { UniswapPair, UniswapPairInfo } from "../types/pair";
import { usePaypal } from "./usePaypal";
import useWalletConnection from "./useWalletConnection";

export const useLiquidityProvider = () => {

    // For toast
    const toast = useToast();

    // For paypal logged in state
    const { paypalState } = usePaypal();

    // For wallet connection
    const { } = useWalletConnection();


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
        liquidityWithdrawProgress
    }
}