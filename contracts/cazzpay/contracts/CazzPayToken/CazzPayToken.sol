// SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "../Ownable/MultiOwnable.sol";

contract CazzPayToken is MultiOwnable, ERC20Burnable {
    // @title Constructor
    // @param _initialAmtToMint Initial amount of tokens to mint
    constructor(uint256 _initialAmtToMint) ERC20("CazzPayToken", "CZP") public {
        _mint(msg.sender, _initialAmtToMint);
    }

    // @summary Mints specified amount of $CZP to an address
    // @notice Only callable by an owner
    // @dev MAKE SURE TO CALL THIS ALONG WITH FIAT TRANSFER
    // @param _mintTo Address to mint to
    // @param _amtToMint Amount of tokens to mint
    function mintTokens(address _mintTo, uint256 _amtToMint) public onlyOwners {
        _mint(_mintTo, _amtToMint);
    }
}
