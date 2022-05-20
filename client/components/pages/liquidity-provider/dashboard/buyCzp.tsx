import { Button, ButtonProps, Flex, FormControl, FormHelperText, FormLabel, Heading, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, Tooltip } from "@chakra-ui/react";
import { BsCoin as BuyCzpIcon } from "react-icons/bs";
import { GiTwoCoins as CoinIcon } from "react-icons/gi";
import { useLiquidityProvider } from "../../../../hooks/useLiquidityProvider";
import useWalletConnection from "../../../../hooks/useWalletConnection";
import { IoWallet as WalletIcon } from "react-icons/io5";

interface ISellerQRCode {
    buttonProps: ButtonProps;
}

export default function BuyCzp({ buttonProps }: ISellerQRCode) {

    // For liquidity provider
    const { handleBuyCzp, buyCzpDialogVisible, setBuyCzpDialogVisible, buyCzpProgress, czpBuyAmt, setCzpBuyAmt } = useLiquidityProvider();

    // For wallet connection
    const { isConnecting, isConnected, showConnectDialog, disconnect } = useWalletConnection();

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
                        <Button rightIcon={<CoinIcon size={24} />} variant="solid" colorScheme="blue" onClick={handleBuyCzp} isLoading={buyCzpProgress} loadingText="Buying" disabled={!(isConnected && !!czpBuyAmt)}>
                            Buy
                        </Button>
                        <Text fontSize="sm" marginTop={2} fontWeight={500} color="gray.500">
                            $CZP bought would be deposited to your wallet
                        </Text>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}