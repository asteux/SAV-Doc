//SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "./ERC721Token.sol";
import "./AccountManager.sol";
import "./PasswordManager.sol";

contract SecMyDoc is AccountManager, PasswordManager 
{
    SecMyDocToken private token;
    mapping(address => Nft[]) private balance;
    
    constructor()
    {
        token = new SecMyDocToken();
    }
    
    struct Nft
    {
       uint256 tokenID;
       uint256 tokenLength;
       string tokenName;
       string tokenMime;
       string dateAdd;
       string folderName;
       string tokenURI;
       bool isCertified;
       address certifying;
    }
    
    modifier isMyToken(uint256 tokenID)
    {
        require(token.ownerOf(tokenID) == msg.sender, "Cet NFT ne vous appartient pas !");
        _;
    }
    
    function getIndexNFT(uint tokenID) private view returns(uint)
    {
        bool found;
        uint256 index;

        for (uint256 i = 0; i < balance[msg.sender].length; i++)
        {
            if (tokenID == balance[msg.sender][i].tokenID)
            {
                index = i;
                found = true;
                i = balance[msg.sender].length;
            }
        }
        
        require(found, "Cet NFT ne vous appartient pas !");
        return index;
    }
    
    
    function getCountNFT() public view returns(uint256)
    {
        return token.balanceOf(msg.sender);
    }
    
    function createNFT(string memory tokenName, string memory tokenURI, string memory tokenMime, uint256 tokenLength, string memory dateAdd, string memory folderName) public returns (Nft memory)
    {
       uint256 tokenID;
       Nft memory nft;
       
       tokenID = token.addItem(msg.sender, tokenURI);
       nft = Nft(tokenID, tokenLength, tokenName, tokenMime, dateAdd, folderName, "", false, address(0));
       
       balance[msg.sender].push(nft);
       return nft;
    }
    
    function createNFTCertified(string memory tokenName, string memory tokenURI, string memory tokenMime, uint256 tokenLength, string memory dateAdd, string memory folderName) public onlyAuthority(msg.sender) returns(bool)
    {
        Nft memory nft;

       nft = createNFT(tokenName, tokenURI, tokenMime, tokenLength, dateAdd, folderName);
       certified(nft);
       
       return true;
    }
    
    function getNFT(uint256 index) public view returns(Nft memory) 
    {
        require(balance[msg.sender].length > 0 && index < balance[msg.sender].length, "Vous n'avez pas de NFT ou NFT de l'index n'existe pas");
        
        Nft memory nft;
        
        nft = balance[msg.sender][index];
        nft.tokenURI = token.tokenURI(nft.tokenID);
        
        return nft;
    }
    
    function deleteNFT(uint256 tokenID) public returns(bool)
    {
        require(token.ownerOf(tokenID) == msg.sender, "Cet NFT ne vous appartient pas !");
        uint256 index = getIndexNFT(tokenID);
        
        balance[msg.sender][index] = balance[msg.sender][balance[msg.sender].length - 1];
        balance[msg.sender].pop();

        token.delItem(tokenID);
        return true;
    }
    
    function certified(Nft memory nft) public view returns(Nft memory)
    {
        nft.isCertified = true;
        nft.certifying = msg.sender;
        
        return nft;
    }
    
    function requestCertification(uint256 tokenID, address certifying) public view isMyToken(tokenID) returns(bool)
    {
        return true;
    }
}
