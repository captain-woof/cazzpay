// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../Ownable/MultiOwnable.sol";

contract CazzPayToken is ERC20, MultiOwnable {
    // @title Constructor
    // @param _initialAmtToMint Initial amount of tokens to mint
    constructor(uint256 _initialAmtToMint) ERC20("CazzPayToken", "CZP") {
        _mint(msg.sender, _initialAmtToMint);
    }

    // @summary Mints specified amount of $CZP to an address
    // @notice Only callable by an owner
    // @dev MAKE SURE TO CALL THIS ALONG WITH FIAT TRANSFER
    // @param _mintTo Address to mint to
    // @param _amtToMint Amount of tokens to mint
    function mintTokens(address _mintTo, uint256 _amtToMint) public onlyOwner {
        _mint(_mintTo, _amtToMint);
    }

    // @summary Burns specified amount of tokens owned by someone
    // @notice This function is meant to be called when going off-ramp with $CZP
    // @dev MAKE SURE TO CALL THIS ALONG WITH FIAT TRANSFER
    // @param _tokenOwner Owner whose token is to be burnt
    // @param _amtToBurn Number of tokens to burn
    function burnTokensFromOwner(address _tokenOwner, uint256 _amtToBurn)
        public
        onlyOwner
    {
        _burn(_tokenOwner, _amtToBurn);
    }
}
