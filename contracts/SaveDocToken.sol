// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ERC 721 used by SAV Doc contract to secure document
 * @dev All functions are called by the SaveDoc contract
 */
contract SaveDocToken is ERC721URIStorage, Ownable
{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIDs;

    /**
     * @dev Create new ERC721
     */
    constructor() ERC721("SaveDoc", "SDT") {}

    /**
     * @dev mint new token
     * @param owner owner of token
     * @param tokenURI URI of token
     * @return ID of token
     */
    function mint(address owner, string memory tokenURI) external onlyOwner() returns(uint)
    {
        _tokenIDs.increment();
        uint256 newItemID = _tokenIDs.current();
        _safeMint(owner, newItemID);
        _setTokenURI(newItemID, tokenURI);

        return newItemID;
    }

    /**
     * @dev Set Token URI
     * @param tokenID ID of token
     * @param tokenURI URI of token
     * @param ownerToken owner of token
     */
    function setTokenURI(uint256 tokenID, string memory tokenURI, address ownerToken) onlyOwner() external
    {
        require(ownerOf(tokenID) == ownerToken, "SaveDocToken: Cet NFT ne vous appartient pas !");

        _setTokenURI(tokenID, tokenURI);
    }

    /**
     * @dev Burn a token
     * @param tokenID ID of token
     * @param ownerToken owner of token
     */
    function burn(uint256 tokenID, address ownerToken) onlyOwner() external
    {
        require(ownerOf(tokenID) == ownerToken, "SaveDocToken: Cet NFT ne vous appartient pas !");
        _burn(tokenID);
    }

    /**
     * @notice
     * @dev Transfer a token
     * @param from owner of token
     * @param to new owner
     * @param tokenID ID of token
     */
    function transfer(address from, address to, uint256 tokenID) public onlyOwner()
    {
        _transfer(from, to, tokenID);
    }

    /**
     * @dev Check if token exists
     * @param tokenID ID of token
     * @return trus if token exists
     */
    function exist(uint256 tokenID) view onlyOwner() external returns(bool)
    {
        return _exists(tokenID);
    }
}
