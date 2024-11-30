// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface INFTCollection is IERC721 {
    function setAuthorizedContract(address newAuthContract) external;

    function setBaseURI(string calldata newURI) external;

    function getLastTokenId() external view returns (uint256);

    function burn(uint tokenId) external;

    function safeMint(address customer) external returns (uint256);
}
