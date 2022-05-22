import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { usePaypal } from "../../../../../hooks/usePaypal";
import { getAllTransactionsUnderSeller } from "../../../../../lib/graphql";
import { TransactionExtended } from "../../../../../types/graph";

const PAGE_SIZE = 7;

export const useTransactionsTable = () => {
    // For paypal auth info
    const { paypalState } = usePaypal();

    // For toast
    const toast = useToast();

    // For auto-update
    const [shouldAutoUpdate, setShouldAutoUpdate] = useState<boolean>(true);

    // For pagination
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);

    // To store transactions
    const [transactionsReceived, setSransactionsReceived] = useState<Array<TransactionExtended>>([]);

    // To store if table is being updated
    const [isTableBeingUpdated, setIsTableBeingUpdated] = useState<boolean>(false);

    // Function to update table rows
    const updateTableData = useCallback(async (pageNum: number) => {
        setIsTableBeingUpdated(true);
        
        const totalTransactionsNumResp = await axios.get("/api/sellers/getTotalTransactionsNum", {
            params: {
                id: paypalState?.userInfo?.id
            }
        });

        // Set total num of pages
        const totalTransactionsNum = totalTransactionsNumResp.data as number;
        setTotalPages(Math.ceil(totalTransactionsNum / PAGE_SIZE));

        // Set transactions data
        const allTransactions = await getAllTransactionsUnderSeller(paypalState?.userInfo?.id as string, pageNum, PAGE_SIZE);
        const allTransactionsExtended: Array<TransactionExtended> = [];

        const tokenAddrToDetailsMap: {
            [tokenAddr: string]: {
                decimals: number,
                symbol: string,
                name: string
            }
        } = {};

        for await (let transaction of allTransactions) {

            const { tokenUsedForPurchaseContractAddr } = transaction;

            if (!(tokenUsedForPurchaseContractAddr in tokenAddrToDetailsMap)) {
                const tokenDetailsResp = await axios.get("/api/sellers/getTokenInfo", {
                    params: {
                        tokenContractAddr: tokenUsedForPurchaseContractAddr
                    },
                    responseType: "json"
                });
                const { name, symbol, decimals } = tokenDetailsResp.data;
                tokenAddrToDetailsMap[tokenUsedForPurchaseContractAddr] = {
                    decimals, name, symbol
                }
            }

            allTransactionsExtended.push({
                ...transaction,
                tokenUsedForPurchaseDecimals: tokenAddrToDetailsMap[tokenUsedForPurchaseContractAddr].decimals,
                tokenUsedForPurchaseSymbol: tokenAddrToDetailsMap[tokenUsedForPurchaseContractAddr].symbol,
                tokenUsedForPurchaseName: tokenAddrToDetailsMap[tokenUsedForPurchaseContractAddr].name,
            });
        }

        setSransactionsReceived(allTransactionsExtended);
        setIsTableBeingUpdated(false);
    }, [paypalState?.userInfo]);

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
    }, [page, shouldAutoUpdate, paypalState?.userInfo]);

    // Keep transactions table updated if page changes
    useEffect(() => {
        (async () => {
            await updateTableData(page);
        })();
    }, [page, paypalState?.userInfo]);

    // Return
    return {
        shouldAutoUpdate,
        setShouldAutoUpdate,
        transactionsReceived,
        totalPages,
        setPage,
        page,
        isTableBeingUpdated
    }
}