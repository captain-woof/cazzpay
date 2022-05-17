// SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestCoin is ERC20 {
    /**
    @notice Constructor for contract
    @param _initialAmtToMint Number of tokens to mint to initial caller
     */
    constructor(uint256 _initialAmtToMint) ERC20("TestCoin", "TST") public {
        _mint(msg.sender, _initialAmtToMint);
    }

    /**
    @notice Mints specified number of $TST to a specified address
    @notice Allows free minting because this contract is only for local testing
    @param _recipient Address of the recipient
    @param _amtToMint Number of tokens to mint
     */
    function mintTo(address _recipient, uint256 _amtToMint) external {
        _mint(_recipient, _amtToMint);
    }
}