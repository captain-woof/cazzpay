import { ChakraProvider } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import AppBar from '../components/organisms/appbar';
import theme from '../theme';
import { Provider as ReduxProvider } from "react-redux";
import { store } from '../store';
import ConnectWalletDialog from '../components/organisms/connectWalletDialog';

import "../styles/global.css";
import "../styles/react-paginate.css";

function CazzPayApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <ReduxProvider store={store}>

        {/* AppBar */}
        <AppBar />

        {/* Component to display */}
        <Component {...pageProps} />

        {/* Wallet connection dialog */}
        <ConnectWalletDialog />

      </ReduxProvider>
    </ChakraProvider>
  )
}

export default CazzPayApp;
