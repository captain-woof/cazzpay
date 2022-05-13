// SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;

import "./PairManager.sol";
import "../CazzPayToken/CazzPayToken.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract CazzPayDex is PairManager {
    ////////////////////////
    // STORAGE
    ////////////////////////
    IUniswapV2Factory immutable public factoryContract;
    IUniswapV2Router02 immutable public routerContract;
    CazzPayToken immutable public czpContract;

    ////////////////////////
    // FUNCTIONS
    ////////////////////////

    constructor(
        IUniswapV2Factory _factoryContractAddr,
        IUniswapV2Router02 _routerContractAddr,
        
    ) {
        factoryContract = _factoryContractAddr;
        routerContract = _routerContractAddr;
    }
}
