import { Grid, GridItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text } from "@chakra-ui/react";
import useWalletConnection from "../../../hooks/useWalletConnection";
import MetamaskIcon from "../../../icons/MetamaskIcon";
import WalletConnectIcon from "../../../icons/WalletConnectIcon";
import WalletLinkIcon from "../../../icons/WalletLinkIcon";
import OtherWalletIcon from "../../../icons/OtherWalletIcon";

export default function ConnectWalletDialog() {
    const { connectDialogVisible, hideConnectDialog, connect } = useWalletConnection();

    return (
        <Modal isOpen={connectDialogVisible} onClose={hideConnectDialog} isCentered size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Connect your wallet</ModalHeader>
                <ModalCloseButton />

                {/* Connectors */}
                <ModalBody>
                    <Grid templateColumns="repeat(2, 1fr)" gap="6">
                        {/* Metamask */}
                        <GridItem width="full" padding="4" display="flex" flexDirection="column" justifyContent="center" alignItems="center" role="button" onClick={() => { connect("metamask"); }}>
                            <MetamaskIcon height="48" width="48" />
                            <Text marginTop="4" textAlign="center">Metamask</Text>
                        </GridItem>

                        {/* WalletConnect */}
                        <GridItem width="full" padding="4" display="flex" flexDirection="column" justifyContent="center" alignItems="center" role="button" onClick={() => { connect("wallet-connect"); }}>
                            <WalletConnectIcon height="48" width="48" />
                            <Text marginTop="4" textAlign="center">WalletConnect</Text>
                        </GridItem>

                        {/* WalletLink */}
                        <GridItem width="full" padding="4" display="flex" flexDirection="column" justifyContent="center" alignItems="center" role="button" onClick={() => { connect("wallet-link"); }}>
                            <WalletLinkIcon height="48" width="48" />
                            <Text marginTop="4" textAlign="center">Coinbase</Text>
                        </GridItem>

                        {/* Others */}
                        <GridItem width="full" padding="4" display="flex" flexDirection="column" justifyContent="center" alignItems="center" role="button" onClick={() => { connect("injected"); }}>
                            <OtherWalletIcon height="48" width="48" />
                            <Text marginTop="4" textAlign="center">Others (injected)</Text>
                        </GridItem>
                    </Grid>
                </ModalBody>

            </ModalContent>
        </Modal>
    )
}