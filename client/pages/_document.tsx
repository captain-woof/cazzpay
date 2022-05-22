import { ColorModeScript } from '@chakra-ui/react';
import NextDocument, { Html, Main, NextScript } from 'next/document';
import theme from '../theme';

export default class Document extends NextDocument {
    render() {
        return (
            <Html lang='en'>
                <body>
                    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}