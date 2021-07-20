//SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Counters.sol";

contract SecMyDocToken is ERC721URIStorage
{
    using Counters for Counters.Counter;
    Counters.Counter public _tokenIDs;
    
    constructor() ERC721("SecMyDoc", "SMD") {}
    
    function addItem(address owner, string memory tokenURI) public returns(uint)
    {
        _tokenIDs.increment();
        uint256 newItemID = _tokenIDs.current();
        _mint(owner, newItemID);
        _setTokenURI(newItemID, tokenURI);
        
        return newItemID;
    }
    
    function delItem(uint256 tokenID) public returns(bool)
    {
        _burn(tokenID);
        return true;
    }
}
