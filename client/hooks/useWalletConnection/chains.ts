import { getValueBasedOnEnv } from "../../utils/env";

// Required types
type NativeCurrency = {
    symbol: string;
    decimals: number;
    name: string;
}

type ChainInfo = {
    urls: Array<string | undefined>;
    name: string;
    nativeCurrency?: NativeCurrency;
    blockExplorerUrls?: Array<string>;
}

// Native currencies
const ETH: NativeCurrency = {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
}

/**
 * @summary Mapping between chainIDs and their RPC urls, name, symbol, etc, only for Testnets
 */
export const CHAINS_TEST: { [chainId: string]: ChainInfo } = {
    "0x4": {
        urls: [`https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`],
        name: 'Rinkeby',
        nativeCurrency: ETH
    }
}

/**
 * @summary Mapping between chainIDs and their RPC urls, name, symbol, etc, only for Mainnets
 */
export const CHAINS_MAIN: { [chainId: string]: ChainInfo } = {
    "0x1": {
        urls: [`https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`],
        name: 'Mainnet',
        nativeCurrency: ETH
    }
}

/**
 * @summary Returns chains based on the deployment URL
 * @returns Mapping between chain ids and the chain details like name, rpc urls, etc
 */
export const getChainsBasedOnEnv = (): { [chainId: string]: ChainInfo } => getValueBasedOnEnv({
    local: CHAINS_TEST,
    development: CHAINS_TEST,
    production: CHAINS_MAIN
});

/**
 * @summary Returns mapping between chainIDs and their RPC url
 * @returns Mapping between chainIDs and array of RPC url
 */
export const getRpcUrls = (): { [chainId: string]: string } => {
    const rpcUrls: { [chainId: string]: string } = {};
    const chains = getValueBasedOnEnv({
        local: CHAINS_TEST,
        development: CHAINS_TEST,
        production: CHAINS_MAIN
    });

    Object.keys(chains).forEach((chainId) => {
        rpcUrls[chainId] = chains[chainId].urls[0] as string;
    });

    return rpcUrls;
}  