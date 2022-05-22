import { useCallback, useEffect, useState } from "react";
import useWalletConnection from "./useWalletConnection";
import BN from "bignumber.js";
import { useToast } from "@chakra-ui/react";
import { useCazzPay } from "./useCazzPay";

interface Pair {
    pairAddr: string;
    otherTokenAddr: string;
    otherTokenName: string;
    otherTokenSymbol: string;
}

export const usePayWithCrypto = () => {

    // For connection with wallet
    const { isConnected } = useWalletConnection();

    // Pair selected for payment
    const [pairSelectedForPayment, setPairSelectedForPayment] = useState<Pair | null>(null);

    // For token price
    const [tokenSelectedForPaymentPriceAtomic, setTokenSelectedForPaymentPriceAtomic] = useState<string>("0");

    // For num of tokens to pay with
    const [numOfTokensToPayWith, setNumOfTokensToPayWith] = useState<string>("0");

    // For fiat to be paid
    const [fiatToBePaid, setFiatToBePaid] = useState<string>("0");

    // For what should be constant
    const [whatChanged, setWhatChanged] = useState<"tokenAmt" | "fiatAmt">("tokenAmt");

    // For slippage
    const [maxSlippage, setMaxSlippage] = useState<string>("0");

    // For payment progress
    const [paymentInProgress, setPaymentInProgress] = useState<boolean>(false);

    // For toast
    const toast = useToast();

    // To track if payment is done
    const [paymentDone, setPaymentDone] = useState<boolean>(false);

    // For CazzPay functions
    const { getPriceOfTokenWithSymbol, buyWithCryptoToken, cazzPayContractConnected } = useCazzPay();

    // Store transaction hash
    const [transactionHash, setTransactionHash] = useState<string>("");

    // For token price update
    const [priceUpdateTimer, setPriceUpdateTimer] = useState<NodeJS.Timer>();
    useEffect(() => {
        (async () => {
            if (isConnected && !!pairSelectedForPayment) {

                // Clear previous timer
                !!priceUpdateTimer && clearInterval(priceUpdateTimer);

                // Update price now
                setTokenSelectedForPaymentPriceAtomic(
                    (await getPriceOfTokenWithSymbol(pairSelectedForPayment.otherTokenSymbol))?.toString() || "0"
                );

                // Set timer to keep updating price
                const newPriceUpdateTimer = setInterval(async () => {
                    // FETCH TOKEN PRICE
                    setTokenSelectedForPaymentPriceAtomic(
                        (await getPriceOfTokenWithSymbol(pairSelectedForPayment.otherTokenSymbol))?.toString() || "0"
                    );
                }, 10 * 1000);
                setPriceUpdateTimer(newPriceUpdateTimer);

                return () => { clearInterval(newPriceUpdateTimer); }
            }
        })()
    }, [pairSelectedForPayment, isConnected])

    // For fiat amt calculation
    useEffect(() => {
        if (whatChanged === "tokenAmt") {
            const newFiatToBePaid = (new BN(tokenSelectedForPaymentPriceAtomic))
                .multipliedBy(numOfTokensToPayWith)
                .div((new BN(10).pow(18)))
                .toFixed(2);
            setFiatToBePaid(newFiatToBePaid);
        }
    }, [tokenSelectedForPaymentPriceAtomic, numOfTokensToPayWith, whatChanged])

    // For token amt calculation
    useEffect(() => {
        if (whatChanged === "fiatAmt") {
            const newNumOfTokensToPayWith = (new BN(fiatToBePaid))
                .multipliedBy((new BN(10).pow(18)))
                .div(tokenSelectedForPaymentPriceAtomic)
                .toFixed(2);
            setNumOfTokensToPayWith(newNumOfTokensToPayWith.toString());
        }
    }, [fiatToBePaid, tokenSelectedForPaymentPriceAtomic, whatChanged]);

    // Function to handle payment
    const handlePayment = useCallback(async (sellerId: string) => {
        if (!!pairSelectedForPayment) {
            setPaymentInProgress(true);

            const details = await buyWithCryptoToken(
                sellerId,
                pairSelectedForPayment.otherTokenAddr as string,
                numOfTokensToPayWith,
                maxSlippage,
                fiatToBePaid
            );
            setTransactionHash(details?.transactionHash || "");

            setPaymentDone(true);
            setPaymentInProgress(false);
        }
    }, [pairSelectedForPayment, numOfTokensToPayWith, maxSlippage, fiatToBePaid, cazzPayContractConnected]);

    const makeAnotherPayment = useCallback(() => {
        setNumOfTokensToPayWith("0");
        setFiatToBePaid("0");
        setWhatChanged("tokenAmt");
        setMaxSlippage("0");
        setPaymentDone(false);
    }, []);

    // Return
    return {
        pairSelectedForPayment,
        setPairSelectedForPayment,
        tokenSelectedForPaymentPriceAtomic,
        numOfTokensToPayWith,
        setNumOfTokensToPayWith,
        fiatToBePaid,
        setFiatToBePaid,
        setWhatChanged,
        maxSlippage,
        setMaxSlippage,
        handlePayment,
        paymentInProgress,
        paymentDone,
        makeAnotherPayment,
        transactionHash
    }
}