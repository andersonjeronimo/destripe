// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./INFTCollection.sol";

contract Destripe is Ownable {
    INFTCollection public nftCollection;
    IERC20 public acceptedToken;

    uint public monthlyFee = 0.001 ether;
    uint private constant oneMonthInSeconds = 30 * 24 * 60 * 60;

    struct Customer {
        uint tokenId;
        uint nextPayment;
        uint index;
    }

    mapping(address => Customer) public payments;
    address[] public customers;

    event Paid(address indexed customer, uint amount, uint date);
    event Granted(address indexed customer, uint tokenId, uint date);
    event Revoked(address indexed customer, uint tokenId, uint date);
    event Removed(address indexed customer, uint tokenId, uint date);

    constructor(
        address nftAddress,
        address tokenAddress,
        address initialOwner
    ) Ownable(initialOwner) {
        nftCollection = INFTCollection(nftAddress);
        acceptedToken = IERC20(tokenAddress);
    }

    function setMonthlyFee(uint newMonthlyFee) external onlyOwner {
        monthlyFee = newMonthlyFee;
    }

    function removeCustomer(address customer) external onlyOwner {
        uint tokenId = payments[customer].tokenId;
        nftCollection.burn(tokenId);

        delete customers[payments[customer].index];
        delete payments[customer];

        emit Removed(customer, tokenId, block.timestamp);
    }
}
