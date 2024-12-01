// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./INFTCollection.sol";

contract DestripeCollection is INFTCollection, ERC721, Ownable {
    uint256 private _nextTokenId;
    address public authorizedContract;
    string public baseURI = "https://localhost:3000/nfts/";

    constructor(
        address initialOwner
    ) ERC721("Destripe", "DSC") Ownable(initialOwner) {}

    function setAuthorizedContract(address newAuthContract) external onlyOwner {
        authorizedContract = newAuthContract;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string calldata newURI) external onlyOwner {
        baseURI = newURI;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721) returns (string memory) {
        return string.concat(_baseURI(), Strings.toString(tokenId), ".json");
    }

    function getLastTokenId() external view returns (uint256) {
        return _nextTokenId;
    }

    function burn(uint tokenId) external onlyOwner {
        _burn(tokenId);
    }

    function setApprovalForAll(
        address operator,
        bool approved
    ) public virtual override(IERC721, ERC721) onlyOwner {
        _setApprovalForAll(msg.sender, operator, approved);
    }

    function safeMint(address customer) external returns (uint256) {
        require(msg.sender == owner() || msg.sender == authorizedContract, "Only the owner or authorized contract can mint.");
        uint256 tokenId = ++_nextTokenId;
        _safeMint(customer, tokenId);
        _setApprovalForAll(customer, authorizedContract, true);
        return tokenId;  
    }
}
