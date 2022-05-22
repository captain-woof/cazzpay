import { Box, Button, Checkbox, IconButton, Spinner, Table, TableCaption, TableContainer, Tbody, Td, Th, Thead, Tooltip, Tr, useBreakpointValue, useTheme } from "@chakra-ui/react";
import { ethers } from "ethers";
import { useTransactionsTable } from "./useTransactionsTable";
import { FiCheck as CheckMarkIcon } from "react-icons/fi";
import { MdNavigateNext as NextIcon, MdNavigateBefore as PreviousIcon } from "react-icons/md";
import { DateTime } from "luxon";
import ReactPaginate from 'react-paginate';
import BN from "bignumber.js";

export default function TransactionsReceivedTable() {

    // For table
    const { setPage, setShouldAutoUpdate, shouldAutoUpdate, totalPages, transactionsReceived, page, isTableBeingUpdated } = useTransactionsTable();

    // For theme
    const theme = useTheme();

    // Pagination button size
    const paginationButtonSize = useBreakpointValue({
        base: "sm",
        md: "md"
    });

    return (
        <>
            <TableContainer marginTop={8}>
                <Table variant='striped' colorScheme="blue" position="relative">

                    {/* Table caption */}
                    <TableCaption placement="top" fontSize="2xl" textAlign="start" padding={0} marginBottom={4}>
                        Transactions received from customers
                    </TableCaption>

                    {/* Table headers */}
                    <Thead>
                        <Tr>
                            <Th /><Th /><Th /><Th /><Th />
                            <Th>
                                <Checkbox isChecked={shouldAutoUpdate} onChange={(e) => { setShouldAutoUpdate(e.target.checked); }} colorScheme="blue" marginLeft="auto" display="flex" fontWeight={400} fontFamily={theme.fonts.body}>
                                    Auto-refresh
                                </Checkbox>
                            </Th>
                        </Tr>

                        <Tr>
                            <Th fontSize="md" fontWeight={400}>ID</Th>
                            <Th fontSize="md" fontWeight={400}>Customer wallet</Th>
                            <Th fontSize="md" fontWeight={400} isNumeric>Paid amount</Th>
                            <Th fontSize="md" fontWeight={400} isNumeric>Fiat received (USD)</Th>
                            <Th fontSize="md" fontWeight={400}>Confirmed</Th>
                            <Th fontSize="md" fontWeight={400}>Timestamp</Th>
                        </Tr>
                    </Thead>

                    {/* Table rows */}
                    <Tbody>

                        {isTableBeingUpdated &&
                            <Spinner color="blue.400" position="absolute" size="xl" top="50%" left="50%" translateX="-50%" translateY="-50%" zIndex={10} thickness='4px' speed='0.65s' emptyColor='gray.200' />
                        }

                        {transactionsReceived.map(({ id, payerWalletAddr, tokenAmtUsedForPurchased, tokenUsedForPurchaseDecimals: tokenUsedForPurchaseDigits, tokenUsedForPurchaseSymbol, fiatAmountToPayToSeller, confirmed, timestampOfConfirmation }) => (
                            <Tr key={id} opacity={isTableBeingUpdated ? 0.7 : 1}>
                                <Td>{id}</Td>
                                <Tooltip label={payerWalletAddr}>
                                    <Td>{`${payerWalletAddr.slice(0, 6)}...${payerWalletAddr.slice(payerWalletAddr.length - 4)}`}</Td>
                                </Tooltip>
                                <Tooltip label={`${ethers.utils.formatUnits(tokenAmtUsedForPurchased, tokenUsedForPurchaseDigits)} (${tokenUsedForPurchaseSymbol})`}>
                                    <Td isNumeric>{new BN(ethers.utils.formatUnits(tokenAmtUsedForPurchased, tokenUsedForPurchaseDigits)).toFixed(3)} ({tokenUsedForPurchaseSymbol})</Td>
                                </Tooltip>
                                <Td isNumeric>{ethers.utils.formatEther(fiatAmountToPayToSeller).toString()}</Td>
                                <Td>{confirmed ? <CheckMarkIcon size={24} /> : <Spinner color='blue.400' />}</Td>
                                <Td>{confirmed ? DateTime.fromSeconds(parseInt(timestampOfConfirmation.toString())).toLocaleString(DateTime.DATETIME_MED) : ""}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>

            </TableContainer>

            {/* Pagination */}
            <Box width="full" marginTop={4} marginBottom={8}>
                <ReactPaginate breakLabel="..." onPageChange={({ selected }) => { setPage(selected) }} marginPagesDisplayed={1} pageRangeDisplayed={1} pageCount={totalPages} renderOnZeroPageCount={() => null} pageLabelBuilder={(pageNumber) => (
                    <Button variant={page === pageNumber - 1 ? "solid" : "outline"} colorScheme="blue" size={paginationButtonSize}>
                        {pageNumber}
                    </Button>
                )} containerClassName="react-paginate-container" nextLabel={
                    <IconButton isRound colorScheme="blue" variant="outline" aria-label="Next page" icon={<NextIcon size={24} />} size={paginationButtonSize} />
                } previousLabel={
                    <IconButton isRound colorScheme="blue" variant="outline" aria-label="Previous page" icon={<PreviousIcon size={24} />} size={paginationButtonSize} />
                } />
            </Box>
        </>
    )
}