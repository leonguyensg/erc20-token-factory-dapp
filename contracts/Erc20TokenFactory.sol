// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import "./ERC20Custom.sol";

contract Erc20TokenFactory {
    event TokenCreated(address indexed tokenAddress, address indexed owner, string name, string symbol, uint8 decimals, uint256 initialSupply);

    address[] public allTokens;

    function createToken(
        address owner,
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply,
        bool isMintable,
        bool isBurnable
    ) external returns (address) {
        ERC20Custom token = new ERC20Custom(name, symbol, decimals, initialSupply, owner, isMintable, isBurnable);
        allTokens.push(address(token));
        emit TokenCreated(address(token), msg.sender, name, symbol, decimals, initialSupply);
        return address(token);
    }
}
