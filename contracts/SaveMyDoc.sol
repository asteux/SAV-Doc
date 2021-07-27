//SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "./TokenManager.sol";
import "./AccountManager.sol";
import "./SaveMyDocToken.sol";
import "./NFT.sol";


contract SaveMyDoc is NFT
{
    mapping(address => Request[]) private requests;
    SaveMyDocToken private saveMyDocToken;
    TokenManager private tokenManager;
    AccountManager private accountManager;


    constructor(TokenManager _tokenManager, AccountManager  _accountManager, SaveMyDocToken _saveMyDocToken)
    {
        tokenManager = _tokenManager;
        accountManager = _accountManager;
        saveMyDocToken = _saveMyDocToken;
    }

    struct Request
    {
        address applicant;
        uint256 tokenID;
        uint256 index;
    }


    modifier isMyToken(uint256 tokenID)
    {
        require(tokenManager.getOwnerToken(tokenID) == msg.sender, "SaveMyDoc: Cet NFT ne vous appartient pas !");
        _;
    }

    modifier userExist(address addressUser)
    {
        require(accountManager.checkIfUserExist(addressUser), "SaveMyDoc: Cette utilisateur n'existe pas.");
        _;
    }

    function transferNFT(address to, uint256 tokenID, string memory tokenURITmp) isMyToken(tokenID) userExist(to) public
    {
        tokenManager.createCopyNFT(msg.sender, to, tokenID, tokenURITmp, TypeNFT.CopyTransfer);
        saveMyDocToken.transferFrom(msg.sender, to, tokenID);
        tokenManager.deleteNFT(msg.sender, tokenID, true);
    }

    function acceptNewNFT(uint256 tokenID, string memory newTokenURI, string memory passwordEncrypted) public
    {
        tokenManager.copyNFTToOriginal(msg.sender, passwordEncrypted, tokenID);
        saveMyDocToken.modifItem(tokenID, newTokenURI, msg.sender);
    }

    function shareNFT(uint256 tokenID, address to, string memory tokenURI) public isMyToken(tokenID) userExist(to)
    {
        tokenManager.createCopyNFT(msg.sender, to, tokenID, tokenURI, TypeNFT.Copy);
    }

    function requestCertification(uint256 tokenID, string memory tokenURI, address certifying) public userExist(certifying) isMyToken(tokenID)
    {
        Request memory request;

        tokenManager.createCopyNFT(msg.sender, certifying, tokenID, tokenURI, TypeNFT.CopyCertification);
        request = Request(msg.sender, tokenID, requests[certifying].length + 1);
        requests[certifying].push(request);
    }

    function getRequests() public view returns(Request[] memory)
    {
        require(requests[msg.sender].length > 0, "SaveMyDoc: Vous n'avez aucune demande de cerification");
        return requests[msg.sender];
    }

    function delRequest(address owner, uint256 index) private
    {
        Request memory substitute;

        substitute = requests[owner][requests[owner].length - 1];
        substitute.index = index;
        requests[owner][index] = substitute;
        requests[owner].pop();
    }

    function acceptRequest(Request memory request, string memory hashNFT) public
    {
        tokenManager.certify(msg.sender, accountManager.isAuthority(msg.sender), request.applicant, request.tokenID, hashNFT);
        delRequest(msg.sender, request.index);
        tokenManager.delCopyNFT(msg.sender, tokenManager.getIndexNFT(msg.sender, request.tokenID, true));
    }

    function rejectRequest(Request memory request) public
    {
        delRequest(msg.sender, request.index);
        tokenManager.delCopyNFT(msg.sender, tokenManager.getIndexNFT(msg.sender, request.tokenID, true));
    }

    function getTokenURI(uint256 tokenID) public view isMyToken(tokenID) returns(string memory)
    {
        return saveMyDocToken.tokenURI(tokenID);
    }
}
