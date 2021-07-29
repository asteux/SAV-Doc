//SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "./DocManager.sol";
import "./SaveDocToken.sol";
import "./NFT.sol";


contract SaveMyDoc is NFT
{
    mapping(address => CertificationRequest[]) private requests;
    SaveDocToken private saveDocToken;
    DocManager private docManager;


    constructor(DocManager _docManager, SaveDocToken _saveDocToken)
    {
        docManager = _docManager;
        saveDocToken = _saveDocToken;
    }

    struct CertificationRequest
    {
        address applicant;
        uint256 tokenID;
        uint256 index;
    }

    function secureDocument(string memory tokenName, string memory tokenURI, string memory tokenMime, uint256 tokenLength, string memory filePath, string memory passwordEncrypted, string memory hashNFT) public returns (Document memory)
    {
       uint256 tokenID;
       Document memory document;

       tokenID = saveDocToken.mint(msg.sender, tokenURI);
       document = docManager.createDoc(msg.sender, tokenID, tokenName, tokenMime, tokenLength, filePath, passwordEncrypted, hashNFT);

       return document;
    }

    function transferNFT(address to, uint256 tokenID, string memory tokenURITmp) public
    {
        docManager.createCopyDoc(msg.sender, to, tokenID, tokenURITmp, TypeDoc.CopyPendingTransfer);
        saveDocToken.transferFrom(msg.sender, to, tokenID);
        deleteDoc(tokenID, true);
    }

    function acceptNewNFT(uint256 tokenID, string memory newTokenURI, string memory passwordEncrypted) public
    {
        // check si msg.sender a bien déja une copie du Document
        docManager.copyDocToOriginal(msg.sender, TypeDoc.CopyPendingTransfer, passwordEncrypted, tokenID);
        saveDocToken.setTokenURI(tokenID, newTokenURI, msg.sender);
    }

    function shareNFT(uint256 tokenID, address to, string memory tokenURI) public
    {
        docManager.createCopyDoc(msg.sender, to, tokenID, tokenURI, TypeDoc.CopyShared);
    }

    function requestCertification(uint256 tokenID, string memory tokenURI, address certifying) public
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
        docManager.delCopyDoc(msg.sender, TypeDoc.CopyCertified, docManager.getIndexNFT(msg.sender, TypeDoc.CopyCertified, request.tokenID));
    }

    function rejectCertificationRequest(CertificationRequest memory request) public
    {
        // check si msg.sender à bien déja une copie du Document
        delRequest(msg.sender, request.index);
        docManager.delCopyDoc(msg.sender, TypeDoc.CopyCertified, docManager.getIndexNFT(msg.sender, TypeDoc.CopyCertified, request.tokenID));
    }

    function getTokenURI(uint256 tokenID) public view returns(string memory)
    {
        require(docManager.getOwnerToken(tokenID) == msg.sender, "SaveMyDoc: Cet NFT ne vous appartient pas !");
        return saveDocToken.tokenURI(tokenID);
    }

    function deleteDoc(uint256 tokenID, bool isCopyDoc) public
    {
        docManager.deleteDoc(msg.sender, tokenID, isCopyDoc);
    }
}
