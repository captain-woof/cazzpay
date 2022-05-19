import { Button, ButtonProps, Flex, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, Tooltip, useToast } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { IoQrCodeSharp as QRCodeIcon } from "react-icons/io5";
import { MdPrint as PrintIcon } from "react-icons/md";
import { BiLink as LinkIcon } from "react-icons/bi";
import { usePaypal } from "../../../../hooks/usePaypal";
import QRCode from "react-qr-code";
import { useReactToPrint } from 'react-to-print';

interface ISellerQRCode {
    buttonProps: ButtonProps;
}

export default function SellerQRCode({ buttonProps }: ISellerQRCode) {

    // For logged in state
    const { paypalState } = usePaypal();

    // For QR code visible state
    const [qrVisible, setQrVisible] = useState<boolean>(false);

    // For qr code url
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
    useEffect(() => {
        setQrCodeUrl(`${document?.location?.origin}/pay/${paypalState.userInfo?.id}`);
    }, [paypalState.userInfo]);

    // QRCode ref
    const qrCodeRef = useRef<HTMLDivElement | null>(null);

    // For QRcode printing
    const handlePrintQrCode = useReactToPrint({
        content: () => qrCodeRef.current,
    });

    // For toast
    const toast = useToast();

    // For handling share
    const handleCopyLink = useCallback(() => {
        navigator.clipboard.writeText(qrCodeUrl);
        toast({
            status: "info",
            title: "Link copied!",
            variant: "solid",
            position: "bottom"
        });
    }, [toast, qrCodeUrl]);

    return (
        <>
            {/* Button to show QR code */}
            <Tooltip label="Share this QRCode with your customers to receive payments!" aria-label='Your QRCode for customers'>
                <Button {...buttonProps} leftIcon={<QRCodeIcon size={24} />} variant="outline" colorScheme="blue" display="flex" onClick={() => { setQrVisible(true); }}>
                    Show QR
                </Button>
            </Tooltip>

            {/* QR code in a pop-up */}
            <Modal isOpen={qrVisible} onClose={() => { setQrVisible(false); }} isCentered>
                <ModalOverlay />

                <ModalContent>
                    <ModalHeader>Your QRCode</ModalHeader>
                    <ModalCloseButton />

                    {/* QR code */}
                    <ModalBody>
                        <Flex flexDirection="column" justifyContent="center" alignItems="center" ref={qrCodeRef}>
                            <Heading fontSize="4xl" marginBottom={1} color="blue.400">CazzPay</Heading>
                            <QRCode title={`QRCode for ${paypalState.userInfo?.name}`} value={qrCodeUrl} id="seller-qr-code" level="M" />
                            <Text marginTop={2} fontWeight={500} color="gray.500">Pay in crypto to</Text>
                            <Heading marginTop={1} fontSize="3xl">{paypalState.userInfo?.name}</Heading>
                        </Flex>
                        <Text marginTop={2} fontWeight={500} textAlign="center">
                            Your customers can directly use this to pay you!
                        </Text>
                    </ModalBody>

                    {/* Print/share button */}
                    <ModalFooter>
                        <Flex gap="4" justifyContent="center" width="full">

                            <Button rightIcon={<LinkIcon size={24} />} variant="outline" colorScheme="blue" onClick={handleCopyLink}>
                                Copy
                            </Button>

                            <Button rightIcon={<PrintIcon size={24} />} variant="solid" colorScheme="blue" onClick={handlePrintQrCode}>
                                Print
                            </Button>

                        </Flex>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}