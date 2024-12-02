// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "./INFTCollection.sol";

contract Destripe is ERC721Holder, Ownable {
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

    function payMonthlyFee(address customer) external onlyOwner {
        bool thirtyDaysHasPassed = payments[customer].nextPayment <= block.timestamp;
        bool firstPayment = payments[customer].nextPayment == 0;
        bool hasAmount = acceptedToken.balanceOf(customer) >= monthlyFee;
        bool hasAllowance = acceptedToken.allowance(customer, address(this)) >= monthlyFee;

        if ((thirtyDaysHasPassed || firstPayment) && (!hasAmount || !hasAllowance)) {
            if (!firstPayment) {
                nftCollection.safeTransferFrom(customer, address(this), payments[customer].tokenId);
                emit Revoked(customer, payments[customer].tokenId, block.timestamp);
                return;
            } else {
                revert("Insufficient balance and/or allowance.");
            }
        }

        if (firstPayment) {
            nftCollection.safeMint(customer);
            payments[customer].tokenId = nftCollection.getLastTokenId();
            payments[customer].index = customers.length;            
            customers.push(customer);

            emit Granted(customer, payments[customer].tokenId, block.timestamp);
        }

        if (thirtyDaysHasPassed || firstPayment) {
            acceptedToken.transferFrom(customer, address(this), monthlyFee);

            if (firstPayment) {
                payments[customer].nextPayment = oneMonthInSeconds + block.timestamp;
            } else
                payments[customer].nextPayment += oneMonthInSeconds;
            
            emit Paid(customer, monthlyFee, block.timestamp);

            //verificar se o token está no nome do cliente, 
            //pois ele poderia estar inadimplente e pagando para recuperar acesso
            //
            //Também verificar se cliente não deiva mais que 1 parcela
            if (payments[customer].nextPayment > block.timestamp && nftCollection.ownerOf(payments[customer].tokenId) != customer) {
                nftCollection.safeTransferFrom(
                    address(this),
                    customer,
                    payments[customer].tokenId
                );
                emit Granted(
                    customer,
                    payments[customer].tokenId,
                    block.timestamp
                );                                
            }
            
        }
    }
}
