import { BigNumber } from "ethers";
import { ERC20 } from "../typechain";

export interface UniswapPair {
    pairAddr: string;
    otherTokenAddr: string;
    otherTokenName: string;
    otherTokenSymbol: string;
    otherTokenDecimals: number;
}

export interface UniswapPairInfo {
    reserveOtherTokenAtomic: string;
    reserveCzpAtomic: string;
    liquidityAtomic: string;
    liquidityOtherTokenAtomic: string;
    liquidityCzp: string;
}

export interface UniswapV2PairContract extends ERC20 {
    token0: () => Promise<string>;
    token1: () => Promise<string>;
    getReserves: () => Promise<{
        _reserve0: BigNumber;
        _reserve1: BigNumber;
    }>;
}