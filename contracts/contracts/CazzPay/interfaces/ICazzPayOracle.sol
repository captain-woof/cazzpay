//SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;

interface ICazzPayOracle {
    /**
    @notice Function to get price of coin
    @param _tokenSymbol Symbol of the ERC20 token to know the price of
    @return priceOfTokenInCzp Price of the token, in $CZP (or $USD), in atomic form (10^18 = 1 $CZP)
     */
    function getPriceOfTokenInCzp(string calldata _tokenSymbol)
        external
        view
        returns (uint256);
}
