// SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";

library PairManager {
    /*
    @title Create Pair with CZP and another token
    @notice Creates a pool with $CZP and another token
    @param _factoryContract Factory contract
    @param _czpContractAddr Contract address of CZP contract
    @param _otherTokenContractAddr Contract address of the other token to form pool with
    @returns Address of the pair created
    */
    function createPairWithCzp(
        IUniswapV2Factory _factoryContract,
        address _czpContractAddr,
        address _otherTokenContractAddr
    ) public returns (address poolAddr) {
        poolAddr = _factoryContract.createPair(
            _czpContractAddr,
            _otherTokenContractAddr
        );
    }

    /**
    @notice Fetches the pair address of a CZP-OtherToken pool
    @param _factoryContract Factory contract
    @param _czpContractAddr Address of the CZP contract
    @param _otherTokenContractAddr Address of the other token contract
    @return poolAddr Address of the pool
     */
    function getCzpAndOtherTokenPoolAddr(
        IUniswapV2Factory _factoryContract,
        address _czpContractAddr,
        address _otherTokenContractAddr
    ) public view returns (address poolAddr) {
        return
            _factoryContract.getPair(_czpContractAddr, _otherTokenContractAddr);
    }

    /**
    @notice Gets all Pairs with CZP
    @param _factoryContract Factory contract
    @param _czpContractAddr Address of the CZP contract
    @return pairAddrsWithCzpAndOtherToken List of all pairs that contains CZP
     */
    function getAllPairsWithCzpAndOtherToken(
        IUniswapV2Factory _factoryContract,
        address _czpContractAddr
    ) public view returns (address[] memory pairAddrsWithCzpAndOtherToken) {
        uint256 totalPairsNum = _factoryContract.allPairsLength();
        address[] memory pairAddrs = new address[](totalPairsNum);

        uint256 index = 0;
        IUniswapV2Pair pairContract;
        for (uint256 i = 0; i < totalPairsNum; i++) {
            pairContract = IUniswapV2Pair(_factoryContract.allPairs(i));
            if (
                pairContract.token0() == _czpContractAddr ||
                pairContract.token1() == _czpContractAddr
            ) {
                pairAddrs[index] = address(pairContract);
                index += 1;
            }
        }

        pairAddrsWithCzpAndOtherToken = new address[](index);
        for (uint256 i = 0; i < totalPairsNum; i++) {
            pairAddrsWithCzpAndOtherToken[i] = pairAddrs[i];
        }
    }
}
