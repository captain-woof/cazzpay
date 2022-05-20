import { Button, Flex, FormControl, FormHelperText, FormLabel, Grid, Heading, Input, Modal, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import { ethers } from "ethers";
import { Dispatch, SetStateAction } from "react";
import { UniswapPair, UniswapPairInfo } from "../../../../types/pair";
import BN from "bignumber.js";
import useWalletConnection from "../../../../hooks/useWalletConnection";
import { IoWallet as WalletIcon } from "react-icons/io5";

interface IPairDialog {
    pairSelected: UniswapPair | null;
    pairDialogVisible: boolean;
    setPairSelected: Dispatch<SetStateAction<UniswapPair | null>>;
    pairInfo: UniswapPairInfo | null;
    pairInfoProgress: boolean;
    liquidityToWithdraw: string;
    minCzpToWithdraw: string;
    minOtherTokenToWithdraw: string;
    setLiquidityToWithdraw: Dispatch<SetStateAction<string>>;
    setMinCzpToWithdraw: Dispatch<SetStateAction<string>>;
    setMinOtherTokenToWithdraw: Dispatch<SetStateAction<string>>;
    liquidityWithdrawProgress: boolean;
    handleWithdrawLiquidity: () => Promise<void>;
}

export default function PairDialog({ pairDialogVisible, pairSelected, setPairSelected, pairInfo, pairInfoProgress, liquidityToWithdraw, minCzpToWithdraw, minOtherTokenToWithdraw, setLiquidityToWithdraw, setMinCzpToWithdraw, setMinOtherTokenToWithdraw, handleWithdrawLiquidity, liquidityWithdrawProgress }: IPairDialog) {

    // For Wallet connection
    const { isConnected, isConnecting, showConnectDialog, disconnect } = useWalletConnection();

    return (
        <Modal isOpen={pairDialogVisible} onClose={() => {
            setPairSelected(null);
        }}>

            <ModalOverlay />

            <ModalContent>

                {/* Header */}
                <ModalHeader>{pairSelected?.otherTokenSymbol}-CZP pair</ModalHeader>

                {/* Close button */}
                <ModalCloseButton />

                {pairInfoProgress ? <Spinner colorScheme="blue" /> :
                    <>
                        {/* Pair info */}
                        <Grid templateColumns="repeat(2, 1fr)">

                            {/* Other token */}
                            <Flex flexDirection="column" alignItems="center" padding={2}>
                                {/* Symbol */}
                                <Heading fontSize="5xl">{pairSelected?.otherTokenSymbol}</Heading>

                                {/* Name */}
                                <Heading fontSize="xl">{pairSelected?.otherTokenName}</Heading>

                                {/* Liquidity provided / Reserve */}
                                <Text marginTop={2}>
                                    {ethers.utils.formatUnits(pairInfo?.liquidityOtherTokenAtomic || "0", pairSelected?.otherTokenDigits)} / {ethers.utils.formatUnits(pairInfo?.reserveOtherTokenAtomic || "0", pairSelected?.otherTokenDigits)} ({(new BN(pairInfo?.liquidityOtherTokenAtomic || "0").div(pairInfo?.reserveOtherTokenAtomic || "1").multipliedBy(100).toFixed(2))}%)
                                </Text>
                                <Text fontSize="sm" fontWeight={500} color="gray.500">
                                    (Your share / Reserve)
                                </Text>
                            </Flex>

                            {/* CZP */}
                            <Flex flexDirection="column" alignItems="center" padding={2}>
                                {/* Symbol */}
                                <Heading fontSize="5xl" color="blue.400">CZP</Heading>

                                {/* Name */}
                                <Heading fontSize="xl">CazzPay Token</Heading>

                                {/* Liquidity provided / Reserve */}
                                <Text marginTop={2}>
                                    {ethers.utils.formatUnits(pairInfo?.liquidityCzp || "0", 18)} / {ethers.utils.formatUnits(pairInfo?.reserveCzpAtomic || "0", 18)} ({(new BN(pairInfo?.liquidityCzp || "0").div(pairInfo?.reserveCzpAtomic || "1").multipliedBy(100).toFixed(2))}%)
                                </Text>
                                <Text fontSize="sm" fontWeight={500} color="gray.500">
                                    (Your share / Reserve)
                                </Text>
                            </Flex>
                        </Grid>

                        {/* Connect wallet button */}
                        <Button marginTop={4} isLoading={isConnecting} loadingText="Connecting" onClick={!isConnected ? showConnectDialog : disconnect} display="flex" marginX="auto" rightIcon={<WalletIcon size={24} />} colorScheme="blue" variant="outline">
                            {isConnected ? "Connected" : "Connect wallet"}
                        </Button>

                        {/* Tabs - deposit/withdraw liquidity */}
                        <Tabs isFitted marginTop={4} paddingX="6">

                            <TabList>
                                <Tab>Deposit</Tab>
                                <Tab>Withdraw</Tab>
                            </TabList>

                            <TabPanels>

                                {/* For deposit */}
                                <TabPanel>
                                    Deposit
                                </TabPanel>

                                {/* For withdraw */}
                                <TabPanel>

                                    {/* Liquidity to withdraw */}
                                    <FormControl marginTop={2}>
                                        <FormLabel htmlFor="liquidity-to-withdraw">
                                            Liquidity to withdraw
                                        </FormLabel>
                                        <Input id="liquidity-to-withdraw" name="liquidity-to-withdraw" value={liquidityToWithdraw} onChange={(e) => { setLiquidityToWithdraw(e.target.value) }} colorScheme="blue" type="number" placeholder="XXX.XX" />
                                        <FormHelperText>You have: {ethers.utils.formatUnits(pairInfo?.liquidityAtomic || "0", 18)}</FormHelperText>
                                    </FormControl>

                                    {/* Min other token */}
                                    <FormControl marginTop={8}>
                                        <FormLabel htmlFor="min-other-token-to-withdraw">
                                            Minimum ${pairSelected?.otherTokenSymbol} to withdraw
                                        </FormLabel>
                                        <Input id="min-other-token-to-withdraw" name="min-other-token-to-withdraw" value={minOtherTokenToWithdraw} onChange={(e) => { setMinOtherTokenToWithdraw(e.target.value) }} colorScheme="blue" type="number" placeholder="XXX.XX" />
                                        <FormHelperText>If the value is lower than this, your liquidity won&apos;t be withdrawn.</FormHelperText>
                                    </FormControl>

                                    {/* Min CZP */}
                                    <FormControl marginTop={8}>
                                        <FormLabel htmlFor="min-czp-to-withdraw">
                                            Minimum $CZP to withdraw
                                        </FormLabel>
                                        <Input id="min-czp-to-withdraw" name="min-czp-to-withdraw" value={minCzpToWithdraw} onChange={(e) => { setMinCzpToWithdraw(e.target.value) }} colorScheme="blue" type="number" placeholder="XXX.XX" />
                                        <FormHelperText>If the value is lower than this, your liquidity won&apos;t be withdrawn.</FormHelperText>
                                    </FormControl>

                                    {/* Withdraw button */}
                                    <Button colorScheme="blue" onClick={handleWithdrawLiquidity} display="flex" marginLeft="auto" marginTop={8} isLoading={liquidityWithdrawProgress} loadingText="Withdrawing" disabled={!(isConnected && !!minCzpToWithdraw && !!minOtherTokenToWithdraw && !!liquidityToWithdraw)}>
                                        Withdraw
                                    </Button>

                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </>
                }


            </ModalContent>

        </Modal>
    )
}