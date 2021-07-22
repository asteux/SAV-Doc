//SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "./ERC721Token.sol";
import "./AccountManager.sol";
import "./PasswordManager.sol";

contract SecMyDoc is AccountManager, PasswordManager
{
    SecMyDocToken private token;
    mapping(address => Nft[]) private balance;
    mapping(address => Request[]) private requests;

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
       string filePath;
       bool isCertified;
       address certifying;
       //address 2 certifiant => type de document
       //address 1 certifiant => type de document
       //address 0 certifiant => type de document
    }

    struct Request
    {
        address applicant;
        uint256 tokenID;
        uint256 index;
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

    function createNFT(string memory tokenName, string memory tokenURI, string memory tokenMime, uint256 tokenLength, string memory dateAdd, string memory filePath) public returns (Nft memory)
    {
       uint256 tokenID;
       Nft memory nft;

       tokenID = token.addItem(msg.sender, tokenURI);
       nft = Nft(tokenID, tokenLength, tokenName, tokenMime, dateAdd, filePath, false, address(0));

       balance[msg.sender].push(nft);
       return nft;
    }

    function createNFTCertified(string memory tokenName, string memory tokenURI, string memory tokenMime, uint256 tokenLength, string memory dateAdd, string memory filePath) public onlyAuthority(msg.sender) returns(Nft memory)
    {
       uint256 tokenID;
       Nft memory nft;

       tokenID = token.addItem(msg.sender, tokenURI);
       nft = Nft(tokenID, tokenLength, tokenName, tokenMime, dateAdd, filePath, true, msg.sender);

       balance[msg.sender].push(nft);

       return nft;
    }

    function getNFTs() public view returns(Nft[] memory)
    {
      require(balance[msg.sender].length > 0 , "Vous n'avez pas de NFT !");
      return balance[msg.sender];
    }

    function getNFT(uint256 index) public view returns(Nft memory)
    {
        require(balance[msg.sender].length > 0 , "Vous n'avez pas de NFT !");
        require(index < balance[msg.sender].length, "Le NFT de l'index n'existe pas");

        Nft memory nft = balance[msg.sender][index];

        return nft;
    }

    function getTokenURI(uint256 tokenID) public view isMyToken(tokenID) returns(string memory)
    {
        return token.tokenURI(tokenID);
    }

    function deleteNFT(uint256 tokenID) public isMyToken(tokenID) returns(bool)
    {
        uint256 index = getIndexNFT(tokenID);

        balance[msg.sender][index] = balance[msg.sender][balance[msg.sender].length - 1];
        balance[msg.sender].pop();

        token.delItem(tokenID, msg.sender);
        return true;
    }

    function requestCertification(uint256 tokenID, address certifying) public userExist(certifying) isMyToken(tokenID) returns(bool)
    {
        require(isAuthority(certifying), "Le certifiant ne peut pas certifier votre NFT.");
        Request memory request;

        request = Request(msg.sender, tokenID, requests[certifying].length + 1);
        requests[certifying].push(request);

        return true;
    }

    function getRequests() public view onlyAuthority(msg.sender) returns(Request[] memory)
    {
        require(requests[msg.sender].length > 0, "Vous n'avez aucune demande de cerification");
        return requests[msg.sender];
    }

    function delRequest(uint256 index) private returns(bool)
    {
        Request memory substitute;

        substitute = requests[msg.sender][requests[msg.sender].length - 1];
        substitute.index = index;
        requests[msg.sender][index] = substitute;
        requests[msg.sender].pop();

        return true;
    }

    function acceptRequest(Request memory request) public onlyAuthority(msg.sender) returns(Nft memory)
    {
        Nft memory nft;
        uint256 index;

        index = getIndexNFT(request.tokenID);
        nft = getNFT(index);
        nft.isCertified = true;
        nft.certifying = msg.sender;

        balance[request.applicant][index] = nft;
        (bool success) = delRequest(request.index);

        return nft;
    }
}
