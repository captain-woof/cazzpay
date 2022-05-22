import { Box, Button, ButtonProps, FormControl, FormHelperText, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, Tooltip, useToast } from "@chakra-ui/react";
import { BsCoin as BuyCzpIcon } from "react-icons/bs";
import { useLiquidityProvider } from "../../../../hooks/useLiquidityProvider";
import useWalletConnection from "../../../../hooks/useWalletConnection";
import { IoWallet as WalletIcon } from "react-icons/io5";
import { PayPalButtons } from "@paypal/react-paypal-js";
import axios from "axios";

interface ISellerQRCode {
    buttonProps: ButtonProps;
}

export default function BuyCzp({ buttonProps }: ISellerQRCode) {

    // For liquidity provider
    const { buyCzpDialogVisible, setBuyCzpDialogVisible, czpBuyAmt, setCzpBuyAmt } = useLiquidityProvider();

    // For wallet connection
    const { isConnecting, isConnected, showConnectDialog, disconnect, signerAddr } = useWalletConnection();

    // For toast
    const toast = useToast();

    return (
        <>
            {/* Button to show Buy CZP dialog code */}
            <Tooltip label="Click here to buy $CZP!" aria-label='Buy $CZP to provide liquidity on CazzPay'>
                <Button {...buttonProps} leftIcon={<BuyCzpIcon size={24} />} variant="outline" colorScheme="blue" display="flex" onClick={() => { setBuyCzpDialogVisible(true); }}>
                    Buy CZP
                </Button>
            </Tooltip>

            {/* Buy CZP in a pop-up */}
            <Modal isOpen={buyCzpDialogVisible} onClose={() => { setBuyCzpDialogVisible(false); }} isCentered>
                <ModalOverlay />

                <ModalContent>
                    <ModalHeader>Buy $CZP</ModalHeader>
                    <ModalCloseButton />

                    <ModalBody>

                        {/* Connect wallet button */}
                        <Button isLoading={isConnecting} loadingText="Connecting" onClick={!isConnected ? showConnectDialog : disconnect} display="flex" marginX="auto" rightIcon={<WalletIcon size={24} />} colorScheme="blue" variant="outline">
                            {isConnected ? "Connected" : "Connect wallet"}
                        </Button>

                        {/* Input field for buy amount */}
                        <FormControl marginTop={4}>
                            <FormLabel>$CZP to buy</FormLabel>
                            <Input value={czpBuyAmt} onChange={(e) => { setCzpBuyAmt(e.target.value) }} colorScheme="blue" type="number" placeholder="XX.XX" />
                            <FormHelperText>$CZP:USD = 1:1</FormHelperText>
                        </FormControl>

                    </ModalBody>

                    {/* Interaction buttons */}
                    <ModalFooter flexDirection="column" alignItems="flex-end">

                        {/* Buy button */}
                        <PayPalButtons style={{
                            layout: "horizontal",
                            color: "blue",
                            shape: "pill",
                            label: "pay"
                        }} forceReRender={[czpBuyAmt, signerAddr, isConnected, setCzpBuyAmt, setBuyCzpDialogVisible]}
                            disabled={!(isConnected && !!czpBuyAmt)}
                            createOrder={async () => {
                                try {
                                    const res = await fetch("/api/orders", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                            Accept: "application/json",
                                        },
                                        body: JSON.stringify({
                                            price: czpBuyAmt,
                                        }),
                                    });
                                    const data = await res.json();
                                    return data.id;
                                } catch (e) {
                                    console.error(e);
                                }
                            }}
                            onCancel={(data) => {
                                console.error(data);
                                toast({
                                    position: "bottom",
                                    status: "error",
                                    title: "Could not send payment!"
                                });
                            }}
                            onApprove={async (data, actions) => {
                                const resp = await axios.post(`/api/orders/${data.orderID}`, {
                                    mintTo: signerAddr
                                }, {
                                    responseType: "json"
                                });

                                setCzpBuyAmt("0");
                                setBuyCzpDialogVisible(false);

                                toast({
                                    position: "bottom",
                                    status: "success",
                                    title: "Payment successful!"
                                });
                                
                            }}
                        />

                        <Text fontSize="sm" marginTop={2} fontWeight={500} color="gray.500">
                            $CZP bought would be deposited to your wallet
                        </Text>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}