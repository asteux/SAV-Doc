//SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SaveDocToken is ERC721URIStorage, Ownable
{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIDs;

    constructor() ERC721("SaveDoc", "SDT") {}

    function mint(address owner, string memory tokenURI) external onlyOwner() returns(uint)
    {
        _tokenIDs.increment();
        uint256 newItemID = _tokenIDs.current();
        _safeMint(owner, newItemID);
        _setTokenURI(newItemID, tokenURI);

        return newItemID;
    }

    function setTokenURI(uint256 tokenID, string memory tokenURI, address ownerToken) onlyOwner() external
    {
        require(ownerOf(tokenID) == ownerToken, "SaveDocToken: Cet NFT ne vous appartient pas !");

        _setTokenURI(tokenID, tokenURI);
    }

    function burn(uint256 tokenID, address ownerToken) onlyOwner() external
    {
        require(ownerOf(tokenID) == ownerToken, "SaveDocToken: Cet NFT ne vous appartient pas !");
        _burn(tokenID);
    }

    function transfer(address from, address to, uint256 tokenID) public onlyOwner()
    {
        _transfer(from, to, tokenID);
    }

    function exist(uint256 tokenID) view onlyOwner() external returns(bool)
    {
        return _exists(tokenID);
    }
}
