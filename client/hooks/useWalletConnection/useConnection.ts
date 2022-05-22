import { useCallback, useMemo } from "react"
import { WalletsSupported } from "../../types/wallet"
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { getChainsBasedOnEnv, getRpcUrls } from "./chains";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { actionGenerators as connectionActionGenerators } from "../../store/reducers/connection";
import { ethers } from "ethers";
import { useToast } from "@chakra-ui/react";

export const useWalletConnection = () => {
    const dispatch: AppDispatch = useDispatch();
    const { activate, active, deactivate, account, chainId, connector, library } = useWeb3React();
    const toast = useToast();
    const [isConnecting, setIsConnecting] = [
        useSelector((state: RootState) => (state.walletConnection.isConnecting)),
        (isConnecting: boolean) => { dispatch(connectionActionGenerators.setIsConnecting(isConnecting)) }
    ];
    const [connectDialogVisible, setShowConnectionDialog] = [
        useSelector((state: RootState) => (state.walletConnection.showConnectionDialog)),
        (showConnectionDialog: boolean) => { dispatch(connectionActionGenerators.setShowConnectionModal(showConnectionDialog)) }
    ];
    const chains = useMemo(() => (getChainsBasedOnEnv()), []);
    const [walletPreConnected, setWalletPreConnected] = [
        useSelector((state: RootState) => (state.walletConnection.walletPreConnected)),
        (newWalletPreConnected: WalletsSupported | "" | null) => { dispatch(connectionActionGenerators.setWalletPreConnected(newWalletPreConnected)); }
    ];

    /**
     * @summary Invoke to show connec dialog
     */
    const showConnectDialog = useCallback(() => {
        setShowConnectionDialog(true);
    }, [setShowConnectionDialog]);

    /**
     * @summary Invoke to hide connect dialog
     */
    const hideConnectDialog = useCallback(() => {
        setShowConnectionDialog(false);
    }, [setShowConnectionDialog]);

    /**
     * @summary Invoke to start the connection flow
     * @param walletType Wallet type to start connection with: "injected", "metamask", "wallet-connect", "wallet-link"
     */
    const connect = useCallback(async (walletType: WalletsSupported) => {
        try {
            setIsConnecting(true);

            // Create wallet connector
            let connector: InjectedConnector | WalletConnectConnector | WalletLinkConnector;
            const supportedChainIds = Object.keys(chains).map((chainId) => parseInt(chainId));
            let walletChosen: WalletsSupported;

            switch (walletType) {
                case "wallet-connect":
                    connector = new WalletConnectConnector({ rpc: getRpcUrls(), supportedChainIds });
                    walletChosen = "wallet-connect";
                    break;
                case "wallet-link":
                    connector = new WalletLinkConnector({ url: chains["4"].urls[0] as string, appName: 'CazzPay' })
                    walletChosen = "wallet-link";
                    break;
                case "metamask":
                    walletChosen = "metamask";
                    connector = new InjectedConnector({ supportedChainIds });
                    break;
                case "injected":
                default:
                    walletChosen = "injected";
                    connector = new InjectedConnector({ supportedChainIds });
                    break;
            }

            // Authenticate via wallet
            await activate(connector, (e) => { throw new Error(e.message) });

            const chainIdCorrect = Object.keys(chains)[0];
            const chainIdCurrent = "0x" + parseInt((await connector.getChainId()).toString()).toString(16);

            // Switch network
            if ("ethereum" in window && walletChosen === "metamask" && process.env.NEXT_PUBLIC_DEPLOY_ENV !== "local") {
                try {
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [{
                            chainId: chainIdCorrect,
                            rpcUrls: chains[chainIdCorrect].urls,
                            chainName: chains[chainIdCorrect].name,
                            nativeCurrency: chains[chainIdCorrect].nativeCurrency,
                            blockExplorerUrls: chains[chainIdCorrect].blockExplorerUrls
                        }]
                    });
                } catch {
                    if (chainIdCorrect.toLowerCase() !== chainIdCurrent.toLowerCase()) {
                        toast({
                            title: `Switch to ${chains[chainIdCorrect].name}`,
                            description: "Please switch to the correct chain and refresh!",
                            status: "error",
                            position: "bottom"
                        });
                    }
                }
            }

            setShowConnectionDialog(false);
            setWalletPreConnected(walletChosen);

            // Show success toast at the end
            toast({
                title: "Connected to CazzPay",
                status: "success",
                position: "bottom"
            });
        } catch (e: any) {
            toast({
                title: e?.message || "Error",
                status: "error",
                position: "bottom"
            });
            setShowConnectionDialog(false);
        } finally {
            setIsConnecting(false);
        }
    }, [activate, setIsConnecting, toast, chains, setShowConnectionDialog, setWalletPreConnected]);

    /**
     * @summary Disconnects from CazzPay
     */
    const disconnect = useCallback(() => {
        setShowConnectionDialog(false);
        deactivate();
        setWalletPreConnected("");

        toast({
            title: "Disconnected",
            status: "warning",
            position: "bottom"
        });
    }, [deactivate, setShowConnectionDialog, setWalletPreConnected, toast]);

    return {
        connect,
        disconnect,
        isConnected: active,
        isConnecting,
        chainId,
        signer: library?.getSigner() as ethers.Signer | null | undefined,
        signerAddr: account,
        providerWrapped: library as ethers.providers.Web3Provider | undefined,
        provider: connector,
        showConnectDialog,
        hideConnectDialog,
        connectDialogVisible
    }
}