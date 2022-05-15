//SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

import "redstone-evm-connector/lib/contracts/message-based/PriceAware.sol";

contract CazzPayOracle is PriceAware {
    ////////////////////////////
    // FUNCTIONS
    ////////////////////////////

    /**
    @notice Function to get price of coin
    @param _tokenSymbol Symbol of the ERC20 token to know the price of
    @return priceOfTokenInCzp Price of the token, in $CZP (or $USD), in atomic form (10^18 = 1 $CZP)
     */
    function getPriceOfTokenInCzp(string calldata _tokenSymbol)
        public
        view
        returns (uint256)
    {
        return (getPriceFromMsg(_stringToBytes32(_tokenSymbol)) * (10**10));
    }

    ////////////////////////////
    // OVERRIDE FUNCTIONS
    ////////////////////////////

    /**
    @dev Checks to see if the signer of the received price feed is authorised
     */
    function isSignerAuthorized(address _receivedSigner)
        public
        view
        virtual
        override
        returns (bool)
    {
        return _receivedSigner == 0x0C39486f770B26F5527BBBf942726537986Cd7eb; // Redstone Demo signer
    }

    ////////////////////////////
    // INTERNAL FUNCTIONS
    ////////////////////////////

    /**
    @dev Converts a string to bytes32
    @return result Bytes32 form of the input string
     */
    function _stringToBytes32(string memory source)
        internal
        pure
        returns (bytes32 result)
    {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }
}
