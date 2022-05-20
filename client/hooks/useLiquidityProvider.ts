import { useToast } from "@chakra-ui/react";
import { useCallback, useState } from "react"
import { usePaypal } from "./usePaypal";
import useWalletConnection from "./useWalletConnection";


export const useLiquidityProvider = () => {

    // For CZP dialog visible state
    const [buyCzpDialogVisible, setBuyCzpDialogVisible] = useState<boolean>(false);

    // Buy czp progress
    const [buyCzpProgress, setBuyCzpProgress] = useState<boolean>(false);

    // For toast
    const toast = useToast();

    // For paypal logged in state
    const { paypalState } = usePaypal();

    // For wallet connection
    const { } = useWalletConnection();

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
    }, []);

    return {
        handleBuyCzp,
        buyCzpDialogVisible,
        setBuyCzpDialogVisible,
        buyCzpProgress,
        czpBuyAmt,
        setCzpBuyAmt
    }
}