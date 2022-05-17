// SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;

import "@openzeppelin/contracts/utils/EnumerableSet.sol";

contract MultiOwnable {
    // Add the library methods
    using EnumerableSet for EnumerableSet.AddressSet;

    // Stores array of owners
    EnumerableSet.AddressSet private _owners;

    // Modifier
    modifier onlyOwners() {
        require(_owners.contains(msg.sender), "NOT OWNER");
        _;
    }

    // Constructor
    constructor() public {
        _owners.add(msg.sender);
    }

    // @summary Adds an owner
    // @notice Only callable by an existing owner
    // @param _newOwner Address of the new owner
    function addOwner(address _newOwner) external onlyOwners {
        _addOwner(_newOwner);
    }

    // @summary Removes an owner
    // @notice Only callable by an existing owner
    // @param _ownerToRemove Address of the new owner
    function removeOwner(address _ownerToRemove) external onlyOwners {
        _removeOwner(_ownerToRemove);
    }

    // @summary Checks to see if an address is an owner
    // @param _ownerToVerify Address of the owner to verify
    // @returns True, if the address is an owner, else false
    function isOwner(address _ownerToVerify) public view returns (bool) {
        return _owners.contains(_ownerToVerify);
    }

    /////////////////////////////
    // Internal mirror functions
    /////////////////////////////

    function _addOwner(address _newOwner) internal {
        _owners.add(_newOwner);
    }

    function _removeOwner(address _ownerToRemove) internal {
        _owners.remove(_ownerToRemove);
    }
}
