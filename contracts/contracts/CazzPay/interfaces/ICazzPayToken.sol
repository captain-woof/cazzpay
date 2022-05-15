// SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;

import "@uniswap/v2-core/contracts/interfaces/IERC20.sol";

interface ICazzPayToken is IERC20 {
    // @summary Mints specified amount of $CZP to an address
    // @notice Only callable by an owner
    // @dev MAKE SURE TO CALL THIS ALONG WITH FIAT TRANSFER
    // @param _mintTo Address to mint to
    // @param _amtToMint Amount of tokens to mint
    function mintTokens(address _mintTo, uint256 _amtToMint) external;

    // @notice Burns tokens owned by msg.sender
    function burn(uint256 amount) external;
}
