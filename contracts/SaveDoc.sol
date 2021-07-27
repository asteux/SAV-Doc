//SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "./DocManager.sol";
import "./AccountManager.sol";
import "./SaveDocToken.sol";
import "./NFT.sol";


contract SaveMyDoc is NFT
{
    mapping(address => CertificationRequest[]) private requests;
    SaveDocToken private saveDocToken;
    DocManager private docManager;
    AccountManager private accountManager;


    constructor(DocManager _docManager, AccountManager  _accountManager, SaveDocToken _saveDocToken)
    {
        docManager = _docManager;
        accountManager = _accountManager;
        saveDocToken = _saveDocToken;
    }

    struct CertificationRequest
    {
        address applicant;
        uint256 tokenID;
        uint256 index;
    }


    modifier isMyToken(uint256 tokenID)
    {
        require(docManager.getOwnerToken(tokenID) == msg.sender, "SaveMyDoc: Cet NFT ne vous appartient pas !");
        _;
    }

    modifier addressesAreDifferent(address from, address to)
    {
        require(from != to, "SaveMyDoc: L'address source et de destination sont identique");
        _;
    }

    modifier userExist(address addressUser)
    {
        require(accountManager.checkIfUserExist(addressUser), "SaveMyDoc: Cette utilisateur n'existe pas.");
        _;
    }

    function transferNFT(address to, uint256 tokenID, string memory tokenURITmp) addressesAreDifferent(msg.sender, to) isMyToken(tokenID) userExist(to) public
    {
        docManager.createCopyDoc(msg.sender, to, tokenID, tokenURITmp, TypeDoc.CopyPendingTransfer);
        saveDocToken.transferFrom(msg.sender, to, tokenID);
        docManager.deleteDoc(msg.sender, tokenID, true);
    }

    function acceptNewNFT(uint256 tokenID, string memory newTokenURI, string memory passwordEncrypted) public
    {
        // check si msg.sender est proprietaire du tokenID
        // check si msg.sender a bien déja une copie du Document
        docManager.copyDocToOriginal(msg.sender, passwordEncrypted, tokenID);
        saveDocToken.setTokenURI(tokenID, newTokenURI, msg.sender);
    }

    function shareNFT(uint256 tokenID, address to, string memory tokenURI) public isMyToken(tokenID) userExist(to) addressesAreDifferent(msg.sender, to)
    {
        docManager.createCopyDoc(msg.sender, to, tokenID, tokenURI, TypeDoc.CopyShared);
    }

    function requestCertification(uint256 tokenID, string memory tokenURI, address certifying) public addressesAreDifferent(msg.sender, certifying) userExist(certifying) isMyToken(tokenID)
    {
        CertificationRequest memory request;

        docManager.createCopyDoc(msg.sender, certifying, tokenID, tokenURI, TypeDoc.CopyCertified);
        request = CertificationRequest(msg.sender, tokenID, requests[certifying].length);
        requests[certifying].push(request);
    }

    function getRequests() public view returns(CertificationRequest[] memory)
    {
        return requests[msg.sender];
    }

    function delRequest(address owner, uint256 index) private
    {
        CertificationRequest memory substitute;

        substitute = requests[owner][requests[owner].length - 1];
        substitute.index = index;
        requests[owner][index] = substitute;
        requests[owner].pop();
    }

    function acceptCertificationRequest(CertificationRequest memory request, string memory hashNFT) public
    {
        // check si msg.sender a bien déja une copie du Document
        docManager.certify(msg.sender, request.applicant, request.tokenID, hashNFT);
        delRequest(msg.sender, request.index);
        docManager.delCopyDoc(msg.sender, docManager.getIndexNFT(msg.sender, request.tokenID, true));
    }

    function rejectCertificationRequest(CertificationRequest memory request) public
    {
        // check si msg.sender à bien déja une copie du Document
        delRequest(msg.sender, request.index);
        docManager.delCopyDoc(msg.sender, docManager.getIndexNFT(msg.sender, request.tokenID, true));
    }

    function getTokenURI(uint256 tokenID) public view isMyToken(tokenID) returns(string memory)
    {
        return saveDocToken.tokenURI(tokenID);
    }
}
