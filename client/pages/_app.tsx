import { ChakraProvider } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import AppBar from '../components/organisms/appbar';
import theme from '../theme';
import { Provider as ReduxProvider } from "react-redux";
import { store } from '../store';
import ConnectWalletDialog from '../components/organisms/connectWalletDialog';
import { Web3ReactProvider } from "@web3-react/core";
import { providers as providersEthers } from "ethers";

import "../styles/global.css";
import "../styles/react-paginate.css";
import "../styles/fonts.css";
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

/**
 * @summary Used by Web3-React's provider to initialise its provider
 * @param provider Actual provider (unwrapped, to-be-wrapped)
 * @returns Web3Provider (wrapped with ethers.providers.Web3Provider)
 */
const getLibrary = (provider: any) => {
  const wrappedProvider = new providersEthers.Web3Provider(provider);
  return wrappedProvider;
}

function CazzPayApp({ Component, pageProps }: AppProps) {
  return (
    <ReduxProvider store={store}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <ChakraProvider theme={theme}>
          <PayPalScriptProvider options={{
            "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID as string,
          }}>

            {/* AppBar */}
            <AppBar />

            {/* Component to display */}
            <Component {...pageProps} />

            {/* Wallet connection dialog */}
            <ConnectWalletDialog />

          </PayPalScriptProvider>
        </ChakraProvider >
      </Web3ReactProvider>
    </ReduxProvider>
  )
}

export default CazzPayApp;
