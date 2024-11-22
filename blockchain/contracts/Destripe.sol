// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Destripe {
    
    address payable public owner;    

    constructor() payable {        
        owner = payable(msg.sender);
    }
    
}
