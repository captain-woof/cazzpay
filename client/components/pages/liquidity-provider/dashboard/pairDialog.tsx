import { Button, Flex, FormControl, FormHelperText, FormLabel, Grid, Heading, Input, Modal, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Radio, RadioGroup, Spinner, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import { ethers } from "ethers";
import { Dispatch, SetStateAction } from "react";
import { UniswapPair, UniswapPairInfo } from "../../../../types/pair";
import BN from "bignumber.js";
import useWalletConnection from "../../../../hooks/useWalletConnection";
import { MdSend as SendIcon } from "react-icons/md";

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
    czpPriceAtomic: string;
    otherTokenPriceAtomic: string;
    czpToDeposit: string;
    setCzpToDeposit: Dispatch<SetStateAction<string>>;
    otherTokenToDeposit: string;
    setOtherTokenToDeposit: Dispatch<SetStateAction<string>>;
    czpToDepositSlippage: string;
    setCzpToDepositSlippage: Dispatch<SetStateAction<string>>;
    otherTokenToDepositSlippage: string;
    setOtherTokenToDepositSlippage: Dispatch<SetStateAction<string>>;
    addLiquidityProgress: boolean;
    handleAddLiquidity: () => Promise<void>;
    setWhatChanged: Dispatch<SetStateAction<"czpAmt" | "otherTokenAmt">>;
}

export default function PairDialog({ pairDialogVisible, pairSelected, setPairSelected, pairInfo, pairInfoProgress, liquidityToWithdraw, minCzpToWithdraw, minOtherTokenToWithdraw, setLiquidityToWithdraw, setMinCzpToWithdraw, setMinOtherTokenToWithdraw, handleWithdrawLiquidity, liquidityWithdrawProgress, czpPriceAtomic, czpToDeposit, czpToDepositSlippage, otherTokenPriceAtomic, otherTokenToDeposit, otherTokenToDepositSlippage, setCzpToDeposit, setCzpToDepositSlippage, setOtherTokenToDeposit, setOtherTokenToDepositSlippage, addLiquidityProgress, setWhatChanged, handleAddLiquidity }: IPairDialog) {

    // For Wallet connection
    const { isConnected } = useWalletConnection();

    return (
        <Modal isCentered={!isConnected} isOpen={pairDialogVisible} onClose={() => {
            setPairSelected(null);
        }}>

            <ModalOverlay />

            <ModalContent>

                {/* Header */}
                <ModalHeader>{pairSelected?.otherTokenSymbol}-CZP pair</ModalHeader>

                {/* Close button */}
                <ModalCloseButton />

                {pairInfoProgress ? <Spinner color="blue.400" position="absolute" size="xl" top="50%" left="50%" translateX="-50%" translateY="-50%" zIndex={10} thickness='4px' speed='0.65s' emptyColor='gray.200' /> :
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
                                <Text marginTop={2} fontSize="sm" textAlign="center">
                                    {(new BN(ethers.utils.formatUnits(pairInfo?.liquidityOtherTokenAtomic || "0", pairSelected?.otherTokenDecimals))).toFixed(3)} / {(new BN(ethers.utils.formatUnits(pairInfo?.reserveOtherTokenAtomic || "0", pairSelected?.otherTokenDecimals))).toFixed(3)}
                                    <br />
                                    ({(new BN(pairInfo?.liquidityOtherTokenAtomic || "0").div(pairInfo?.reserveOtherTokenAtomic || "1").multipliedBy(100).toFixed(2))}%)
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
                                <Text marginTop={2} fontSize="sm" textAlign="center">
                                    {(new BN(ethers.utils.formatUnits(pairInfo?.liquidityCzp || "0", 18))).toFixed(3)} / {(new BN(ethers.utils.formatUnits(pairInfo?.reserveCzpAtomic || "0", 18))).toFixed(3)}
                                    <br />
                                    ({(new BN(pairInfo?.liquidityCzp || "0").div(pairInfo?.reserveCzpAtomic || "1").multipliedBy(100).toFixed(2))}%)
                                </Text>
                                <Text fontSize="sm" fontWeight={500} color="gray.500">
                                    (Your share / Reserve)
                                </Text>
                            </Flex>
                        </Grid>

                        {/* Tabs - deposit/withdraw liquidity */}
                        <Tabs isFitted marginTop={4} paddingX="6">

                            <TabList>
                                <Tab>Deposit</Tab>
                                <Tab>Withdraw</Tab>
                            </TabList>

                            <TabPanels>

                                {/* For deposit */}
                                <TabPanel>

                                    {/* Conversion */}
                                    <Heading textAlign="center" marginTop={6}>
                                        1 ${pairSelected?.otherTokenSymbol} = <Text as="span" color="blue.400">{(new BN(otherTokenPriceAtomic)).div(czpPriceAtomic).toFixed(2)} $CZP</Text>
                                    </Heading>

                                    {/* Other token amt to deposit */}
                                    <FormControl marginTop={6} isDisabled={!(isConnected && !!pairSelected)}>
                                        <FormLabel htmlFor="other-token-to-deposit">
                                            ${pairSelected?.otherTokenSymbol} amount to deposit
                                        </FormLabel>
                                        <Input id="other-token-to-deposit" name="other-token-to-deposit" value={otherTokenToDeposit} onChange={(e) => { setWhatChanged("otherTokenAmt"); setOtherTokenToDeposit(e.target.value) }} colorScheme="blue" type="number" placeholder="XXX.XX" />
                                        <FormHelperText>${pairSelected?.otherTokenSymbol} to add to this pair as liquidity</FormHelperText>
                                    </FormControl>

                                    {/* Other token Slippage */}
                                    <FormControl marginTop={8} isDisabled={!(isConnected && !!pairSelected)}>
                                        <FormLabel htmlFor="other-token-max-slippage-percentage">${pairSelected?.otherTokenSymbol} max slippage</FormLabel>

                                        <RadioGroup id="other-token-max-slippage-percentage" name="other-token-max-slippage-percentage" onChange={setOtherTokenToDepositSlippage} value={otherTokenToDepositSlippage} colorScheme="blue">
                                            <Stack direction='row' spacing={{ base: 2, md: 6 }} justifyContent={{ base: "center", md: "flex-start" }}>
                                                {["0", "2", "5", "10", "20"].map((perc) => (
                                                    <Radio key={perc} value={perc}>{perc}%</Radio>
                                                ))}
                                            </Stack>
                                        </RadioGroup>

                                        <FormHelperText>Any remaining tokens would be immediately refunded.</FormHelperText>
                                    </FormControl>

                                    {/* CZP amt to deposit */}
                                    <FormControl marginTop={8} isDisabled={!(isConnected && !!pairSelected)}>
                                        <FormLabel htmlFor="czp-to-deposit">
                                            $CZP amount to deposit
                                        </FormLabel>
                                        <Input id="czp-to-deposit" name="czp-to-deposit" value={czpToDeposit} onChange={(e) => { setWhatChanged("czpAmt"); setCzpToDeposit(e.target.value) }} colorScheme="blue" type="number" placeholder="XXX.XX" />
                                        <FormHelperText>$CZP to add to this pair as liquidity</FormHelperText>
                                    </FormControl>

                                    {/* Other token Slippage */}
                                    <FormControl marginTop={8} isDisabled={!(isConnected && !!pairSelected)}>
                                        <FormLabel htmlFor="czp-max-slippage-percentage">$CZP max slippage</FormLabel>

                                        <RadioGroup id="czp-max-slippage-percentage" name="czp-max-slippage-percentage" onChange={setCzpToDepositSlippage} value={czpToDepositSlippage} colorScheme="blue">
                                            <Stack direction='row' spacing={{ base: 2, md: 6 }} justifyContent={{ base: "center", md: "flex-start" }}>
                                                {["0", "2", "5", "10", "20"].map((perc) => (
                                                    <Radio key={perc} value={perc}>{perc}%</Radio>
                                                ))}
                                            </Stack>
                                        </RadioGroup>

                                        <FormHelperText>Any remaining tokens would be immediately refunded.</FormHelperText>
                                    </FormControl>

                                    {/* Add liquidity button */}
                                    <Button marginTop={8} colorScheme="blue" isLoading={addLiquidityProgress} loadingText="Adding" display="flex" marginLeft="auto" disabled={!(isConnected && pairSelected)} rightIcon={<SendIcon size={24} />} onClick={handleAddLiquidity}>
                                        Add liquidity
                                    </Button>

                                </TabPanel>

                                {/* For withdraw */}
                                <TabPanel>

                                    {/* Liquidity to withdraw */}
                                    <FormControl marginTop={2}>
                                        <FormLabel htmlFor="liquidity-to-withdraw">
                                            Liquidity to withdraw
                                        </FormLabel>
                                        <Input id="liquidity-to-withdraw" name="liquidity-to-withdraw" value={liquidityToWithdraw} onChange={(e) => { setLiquidityToWithdraw(e.target.value) }} colorScheme="blue" type="number" placeholder="XXX.XX" />
                                        <FormHelperText>You have: {new BN(ethers.utils.formatUnits(pairInfo?.liquidityAtomic || "0", 18)).toFixed(3)}</FormHelperText>
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