export interface UniswapPair {
    pairAddr: string;
    otherTokenAddr: string;
    otherTokenName: string;
    otherTokenSymbol: string;
    otherTokenDigits: number;
}

export interface UniswapPairInfo {
    reserveOtherTokenAtomic: string;
    reserveCzpAtomic: string;
    liquidityAtomic: string;
    liquidityOtherTokenAtomic: string;
    liquidityCzp: string;
}