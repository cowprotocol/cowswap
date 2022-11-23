// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.7.6;

/// @title Gnosis Protocol v2 Allow List Storage Reader
/// @author Gnosis Developers
contract AllowListStorageReader {
    address private manager;
    mapping(address => bool) private solvers;

    function areSolvers(address[] calldata prospectiveSolvers)
        external
        view
        returns (bool)
    {
        for (uint256 i = 0; i < prospectiveSolvers.length; i++) {
            if (!solvers[prospectiveSolvers[i]]) {
                return false;
            }
        }
        return true;
    }
}
