import { useToast } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

const PAGE_SIZE = 7;

// DUMMY DATA
const dummyTransactions = new Array<number>(50)
    .fill(0)
    .map((_, index) => ({
        id: index.toString(),
        payerWalletAddr: "0xC3c46F581A44989A02Eca7828467E369B90cb3fa",
        recipientSeller: {
            email: "sohail@email.com",
            name: "Sohail Saha",
            id: "RANDOM_ID"
        },
        tokenUsedForPurchaseContractAddr: "",
        tokenUsedForPurchaseDigits: 18,
        tokenUsedForPurchaseSymbol: "ETH",
        tokenUsedForPurchaseName: "Ethers",
        tokenAmtUsedForPurchased: "50300000000000000000",
        fiatAmountPaid: "20000000000000000000",
        fiatAmountToPayToSeller: "19900000000000000000",
        confirmed: true,
        timestampOfConfirmation: (Date.now() / 1000) + (60 * index)
    }))
    .reverse();
dummyTransactions.unshift({
    id: dummyTransactions.length.toString(),
    payerWalletAddr: "0xC3c46F581A44989A02Eca7828467E369B90cb3fa",
    recipientSeller: {
        email: "sohail@email.com",
        name: "Sohail Saha",
        id: "RANDOM_ID"
    },
    tokenUsedForPurchaseContractAddr: "",
    tokenUsedForPurchaseDigits: 18,
    tokenUsedForPurchaseSymbol: "ETH",
    tokenUsedForPurchaseName: "Ethers",
    tokenAmtUsedForPurchased: "50300000000000000000",
    fiatAmountPaid: "20000000000000000000",
    fiatAmountToPayToSeller: "19900000000000000000",
    confirmed: false,
    timestampOfConfirmation: (Date.now() / 1000)
});

export const useTransactionsTable = () => {
    // For toast
    const toast = useToast();

    // For auto-update
    const [shouldAutoUpdate, setShouldAutoUpdate] = useState<boolean>(true);

    // For pagination
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);

    // To store transactions
    const [transactionsReceived, setSransactionsReceived] = useState<typeof dummyTransactions>([]);

    // Function to update table rows
    const updateTableData = useCallback(async (pageNum: number) => {
        setTotalPages(Math.ceil(dummyTransactions.length / PAGE_SIZE));
        setSransactionsReceived(dummyTransactions.slice(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE));
    }, []);

    // Update data periodically if needed
    const [updateTimer, setUpdateTimer] = useState<NodeJS.Timer | null>(null);
    useEffect(() => {
        clearInterval(updateTimer as NodeJS.Timer);

        const newUpdateTimer = setInterval(async () => {
            if (shouldAutoUpdate) {
                await updateTableData(page);
                toast({
                    status: "info",
                    title: "Data refreshed!",
                    position: "bottom"
                });
            }
        }, 30 * 1000);
        setUpdateTimer(newUpdateTimer);

        return () => { clearInterval(newUpdateTimer as NodeJS.Timer); }
    }, [page, shouldAutoUpdate]);

    // Keep transactions table updated if page changes
    useEffect(() => {
        (async () => {
            await updateTableData(page);
        })();
    }, [page]);

    // Return
    return {
        shouldAutoUpdate,
        setShouldAutoUpdate,
        transactionsReceived,
        totalPages,
        setPage,
        page
    }
}