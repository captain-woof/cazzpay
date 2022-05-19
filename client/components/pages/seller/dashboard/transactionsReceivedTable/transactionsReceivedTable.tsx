import { Box, Button, ButtonGroup, Checkbox, IconButton, Spinner, Table, TableCaption, TableContainer, Tbody, Td, Th, Thead, Tooltip, Tr, useTheme } from "@chakra-ui/react";
import { ethers } from "ethers";
import { usePaypal } from "../../../../../hooks/usePaypal";
import { useTransactionsTable } from "./useTransactionsTable";
import { FiCheck as CheckMarkIcon } from "react-icons/fi";
import { MdNavigateNext as NextIcon, MdNavigateBefore as PreviousIcon } from "react-icons/md";
import { DateTime } from "luxon";
import ReactPaginate from 'react-paginate';

export default function TransactionsReceivedTable() {

    // For paypal auth info
    const { paypalState } = usePaypal();

    // For table
    const { setPage, setShouldAutoUpdate, shouldAutoUpdate, totalPages, transactionsReceived, page } = useTransactionsTable();

    // For theme
    const theme = useTheme();

    return (
        <TableContainer marginTop={8}>
            <Table variant='striped' colorScheme="blue">

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
                    {transactionsReceived.map(({ id, payerWalletAddr, tokenAmtUsedForPurchased, tokenUsedForPurchaseDigits, tokenUsedForPurchaseSymbol, fiatAmountToPayToSeller, confirmed, timestampOfConfirmation }) => (
                        <Tr key={id}>
                            <Td>{id}</Td>
                            <Tooltip label={payerWalletAddr}>
                                <Td>{`${payerWalletAddr.slice(0, 6)}...${payerWalletAddr.slice(payerWalletAddr.length - 4)}`}</Td>
                            </Tooltip>
                            <Td isNumeric>{ethers.utils.formatUnits(tokenAmtUsedForPurchased, tokenUsedForPurchaseDigits).toString()} ({tokenUsedForPurchaseSymbol})</Td>
                            <Td isNumeric>{ethers.utils.formatEther(fiatAmountToPayToSeller).toString()}</Td>
                            <Td>{confirmed ? <CheckMarkIcon size={24} /> : <Spinner color='blue.400' />}</Td>
                            <Td>{DateTime.fromSeconds(timestampOfConfirmation as number).toLocaleString(DateTime.DATETIME_MED)}</Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            {/* Pagination */}
            <Box width="full" marginTop={4}>
                <ReactPaginate breakLabel="..." onPageChange={({ selected }) => { setPage(selected) }} marginPagesDisplayed={2} pageRangeDisplayed={1} pageCount={totalPages} renderOnZeroPageCount={() => null} pageLabelBuilder={(pageNumber) => (
                    <Button variant={page === pageNumber - 1 ? "solid" : "outline"} colorScheme="blue">
                        {pageNumber}
                    </Button>
                )} containerClassName="react-paginate-container" nextLabel={
                    <IconButton isRound colorScheme="blue" variant="outline" aria-label="Next page" icon={<NextIcon size={24} />} />
                } previousLabel={
                    <IconButton isRound colorScheme="blue" variant="outline" aria-label="Previous page" icon={<PreviousIcon size={24} />} />
                } />
            </Box>

        </TableContainer>
    )
}