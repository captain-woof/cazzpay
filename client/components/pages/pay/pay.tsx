import { Box, Button, FormControl, FormHelperText, FormLabel, Grid, Heading, Input, Radio, RadioGroup, Stack, Text } from "@chakra-ui/react";
import { usePayWithCrypto } from "../../../hooks/usePayWithCrypto";
import useWalletConnection from "../../../hooks/useWalletConnection";
import Container from "../../atoms/container";
import Select from "react-select";
import { IoWallet as WalletIcon } from "react-icons/io5";
import { MdSend as SendIcon } from "react-icons/md";
import { ethers } from "ethers";
import { UniswapPair } from "../../../types/pair";

interface IPayPage {
    email: string;
    name: string;
    id: string;
    pairs: Array<UniswapPair>;
}

export default function PayPage({ email, id, name, pairs }: IPayPage) {
    // For Wallet connection
    const { isConnected, isConnecting, showConnectDialog, disconnect } = useWalletConnection();

    // For paying with crypto
    const { setPairSelectedForPayment, pairSelectedForPayment, tokenSelectedForPaymentPriceAtomic, numOfTokensToPayWith, setNumOfTokensToPayWith, fiatToBePaid, setFiatToBePaid, setWhatChanged, maxSlippage, setMaxSlippage, handlePayment, paymentInProgress, makeAnotherPayment, paymentDone, transactionHash } = usePayWithCrypto();

    return (
        <Container adjustForAppBar fullViewportHeight forReading display="flex" justifyContent="center" alignItems="center">

            <Box width="full" padding={{ base: "4", md: "8" }} borderRadius="md" boxShadow="md">

                {/* Heading */}
                <Heading fontSize="2xl" textAlign="center" color="gray.500">
                    {paymentDone ? "Paid to" : "Pay to"}
                </Heading>
                <Heading fontSize="5xl" textAlign="center">
                    {name}
                </Heading>

                {/* Connect wallet box */}
                {!paymentDone &&
                    <Button marginTop={4} isLoading={isConnecting} loadingText="Connecting" onClick={!isConnected ? showConnectDialog : disconnect} display="flex" marginLeft="auto" rightIcon={<WalletIcon size={24} />} colorScheme="blue" variant="outline">
                        {isConnected ? "Connected" : "Connect wallet"}
                    </Button>
                }

                {/* If not paid, show form, else show transaction details */}
                {!paymentDone ?

                    /* Payment form */
                    <form style={{ width: "100%" }} onSubmit={async (e) => {
                        e.preventDefault();
                        await handlePayment(id);
                    }}>

                        {/* Token to pay with */}
                        <FormControl marginTop={4} isDisabled={!isConnected}>
                            <FormLabel htmlFor='token-to-pay-with'>{pairSelectedForPayment?.otherTokenSymbol || "Token"} to pay with</FormLabel>

                            <Grid templateColumns="3fr 2fr" gap="2">

                                {/* Amount */}
                                <Input value={numOfTokensToPayWith} onChange={(e) => { setWhatChanged("tokenAmt"); setNumOfTokensToPayWith(e.target.value); }} placeholder={`Amount of ${pairSelectedForPayment?.otherTokenSymbol} to pay with`} colorScheme="blue" type="number" disabled={!(isConnected && pairSelectedForPayment)} />

                                {/* Token type */}
                                <Select id="token-to-pay-with" options={pairs} getOptionLabel={({ otherTokenName, otherTokenSymbol }) => `${otherTokenName} (${otherTokenSymbol})`} onChange={setPairSelectedForPayment} value={pairSelectedForPayment} isOptionSelected={(pair) => pair.otherTokenSymbol === pairSelectedForPayment?.otherTokenSymbol} isDisabled={!isConnected} isMulti={false} isSearchable={true} name="token-to-pay-with" placeholder="Token" />
                            </Grid>

                            <FormHelperText>
                                {!pairSelectedForPayment ?
                                    "Select a token to see its current price" :
                                    `1 ${pairSelectedForPayment?.otherTokenSymbol} = $${ethers.utils.formatUnits(tokenSelectedForPaymentPriceAtomic, 18)}`
                                }
                            </FormHelperText>
                        </FormControl>

                        {/* Slippage */}
                        <FormControl marginTop={8} isDisabled={!(isConnected && pairSelectedForPayment)}>
                            <FormLabel htmlFor="max-slippage-percentage">Max slippage</FormLabel>

                            <RadioGroup id="max-slippage-percentage" name="max-slippage-percentage" onChange={setMaxSlippage} value={maxSlippage} colorScheme="blue">
                                <Stack direction='row' spacing={{ base: 2, md: 6 }} justifyContent={{ base: "center", md: "flex-start" }}>
                                    {["0", "2", "5", "10", "20"].map((perc) => (
                                        <Radio key={perc} value={perc}>{perc}%</Radio>
                                    ))}
                                </Stack>
                            </RadioGroup>

                            <FormHelperText>Any remaining tokens would be immediately refunded.</FormHelperText>
                        </FormControl>

                        {/* FIAT to be paid */}
                        <FormControl marginTop={8} isDisabled={!isConnected && !pairSelectedForPayment}>
                            <FormLabel htmlFor='fiat-to-be-paid'>FIAT to be paid</FormLabel>

                            <Input value={fiatToBePaid} onChange={(e) => { setWhatChanged("fiatAmt"); setFiatToBePaid(e.target.value); }} placeholder="FIAT to be paid" colorScheme="blue" type="number" disabled={!(isConnected && pairSelectedForPayment)} id="fiat-to-be-paid" />

                            <FormHelperText>Amount of FIAT after conversion</FormHelperText>
                        </FormControl>

                        {/* Submit button */}
                        <Button marginTop={8} colorScheme="blue" isLoading={paymentInProgress} loadingText="Paying" type="submit" display="flex" marginLeft="auto" disabled={!(isConnected && pairSelectedForPayment)} rightIcon={<SendIcon size={24} />}>
                            Pay
                        </Button>
                    </form> :

                    /* Payment details */
                    <Box width="full">
                        <Heading fontSize="8xl" textAlign="center" marginTop={4} fontWeight={400} color="blue.400">
                            {numOfTokensToPayWith} ${pairSelectedForPayment?.otherTokenSymbol}
                        </Heading>

                        <Heading fontSize="4xl" color="gray.500" textAlign="center" fontWeight={400}>
                            ${fiatToBePaid}
                        </Heading>

                        <Text textAlign="center" marginTop={2} fontWeight={500}>
                            Transfer transaction hash: {transactionHash}
                        </Text>

                        <Button marginTop={8} colorScheme="blue" display="flex" marginLeft="auto" disabled={!(isConnected)} marginX="auto" onClick={makeAnotherPayment}>
                            Make another payment
                        </Button>
                    </Box>
                }
            </Box>
        </Container>
    )
}