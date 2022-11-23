// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.7.6;

import "../libraries/SafeMath.sol";

abstract contract NonStandardERC20 {
    using SafeMath for uint256;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] = balanceOf[to].add(amount);
    }

    function approve(address spender, uint256 amount) external {
        allowance[msg.sender][spender] = amount;
    }

    function transfer_(address to, uint256 amount) internal {
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(amount);
        balanceOf[to] = balanceOf[to].add(amount);
    }

    function transferFrom_(
        address from,
        address to,
        uint256 amount
    ) internal {
        allowance[from][msg.sender] = allowance[from][msg.sender].sub(amount);
        balanceOf[from] = balanceOf[from].sub(amount);
        balanceOf[to] = balanceOf[to].add(amount);
    }
}

contract ERC20NoReturn is NonStandardERC20 {
    function transfer(address to, uint256 amount) external {
        transfer_(to, amount);
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external {
        transferFrom_(from, to, amount);
    }
}

contract ERC20ReturningUint is NonStandardERC20 {
    // Largest 256-bit prime :)
    uint256 private constant OK =
        115792089237316195423570985008687907853269984665640564039457584007913129639747;

    function transfer(address to, uint256 amount) external returns (uint256) {
        transfer_(to, amount);
        return OK;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (uint256) {
        transferFrom_(from, to, amount);
        return OK;
    }
}
