//SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "./AccountManager.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DocManager.sol";
import "./SaveDocToken.sol";
import "./SaveDocStruct.sol";


contract SaveMyDoc is Ownable, SaveDocStruct
{
    mapping(address => CertificationRequest[]) private requests;
    SaveDocToken private saveDocToken;
    DocManager private docManager;
    AccountManager private accountManager;


    constructor(DocManager _docManager, SaveDocToken _saveDocToken, AccountManager _accountManager)
    {
        docManager = _docManager;
        saveDocToken = _saveDocToken;
        accountManager = _accountManager;
    }

    modifier isMyToken(uint256 tokenID)
    {
        require(saveDocToken.ownerOf(tokenID) == msg.sender, "TokenManager: Cet NFT ne vous appartient pas !");
        _;
    }

    modifier userExist(address addressUser)
    {
        require(accountManager.checkIfUserExist(addressUser), "DocManager: Cette utilisateur n'existe pas.");
        _;
    }

    function subscribe(string memory name, string memory pubKey, string memory passwordMaster) external
    {
        accountManager.addUser(msg.sender, name, pubKey, passwordMaster);
    }

    function subscribeAuthority(string memory name, string memory pubKey, string memory passwordMaster) onlyOwner() external
    {
        accountManager.addUser(msg.sender, name, pubKey, passwordMaster);
    }

    function viewMyProfil() view external returns(User memory)
    {
        return accountManager.getUser(msg.sender);
    }

    function getMyPasswordMaster() view external returns(string memory)
    {
        return accountManager.getPasswordMaster(msg.sender);
    }

    function changeMyName(string memory name) external
    {
        accountManager.setUser(msg.sender, name);
    }

    function unsubscribe() external userExist(msg.sender)
    {
        // Voir comment supprimer tout ces fichiers
        docManager.deleteAllDocs(msg.sender);
        docManager.delAllCopyDoc(msg.sender);
        accountManager.delUser(msg.sender);
    }

    function secureDocument(string memory tokenName, string memory tokenURI, string memory tokenMime, uint256 tokenLength, string memory filePath, string memory passwordEncrypted, string memory hashNFT) external returns (Document memory)
    {
       uint256 tokenID;
       Document memory document;

       tokenID = saveDocToken.mint(msg.sender, tokenURI);
       document = docManager.createDoc(msg.sender, tokenID, tokenName, tokenMime, tokenLength, filePath, passwordEncrypted, hashNFT);

       return document;
    }

    // TODO Review
    function delMyDocument(uint256 tokenID, bool forTransfer) isMyToken(tokenID) public
    {
        docManager.deleteDoc(msg.sender, tokenID);

        if (!forTransfer)
        {
            saveDocToken.burn(tokenID, msg.sender);
        }
    }


    function getTokenURI(uint256 tokenID) external view isMyToken(tokenID) returns(string memory)
    {
        return saveDocToken.tokenURI(tokenID);
    }

    function transferDoc(address to, uint256 tokenID, string memory tokenURITmp) isMyToken(tokenID) userExist(to) external
    {
        docManager.createCopyDoc(msg.sender, to, tokenID, tokenURITmp, TypeDoc.CopyPendingTransfer);
        saveDocToken.transferFrom(msg.sender, to, tokenID);
        delMyDocument(tokenID, true);
    }

    function shareDoc(uint256 tokenID, address to, string memory tokenURI) isMyToken(tokenID) userExist(to) external
    {
        docManager.createCopyDoc(msg.sender, to, tokenID, tokenURI, TypeDoc.CopyShared);
    }

    function acceptNewDoc(uint256 tokenID, string memory newTokenURI, string memory passwordEncrypted) isMyToken(tokenID) external
    {
        // check si msg.sender a bien déja une copie du Document
        docManager.convertTypeDoc(msg.sender, TypeDoc.CopyPendingTransfer, TypeDoc.Original, tokenID, passwordEncrypted);
        saveDocToken.setTokenURI(tokenID, newTokenURI, msg.sender);
    }


    function delCopyDocShared(uint tokenID) external isMyToken(tokenID)
    {
        docManager.delCopyDoc(msg.sender, TypeDoc.CopyShared, docManager.getIndexNFT(msg.sender, TypeDoc.CopyShared, tokenID));
    }

    function requestCertification(uint256 tokenID, string memory tokenURI, address certifying) isMyToken(tokenID) userExist(certifying) external
    {
        CertificationRequest memory request;

        docManager.createCopyDoc(msg.sender, certifying, tokenID, tokenURI, TypeDoc.CopyCertified);
        request = CertificationRequest(msg.sender, tokenID, requests[certifying].length);
        requests[certifying].push(request);
    }

    function viewMyDocs() view external returns(Document[] memory)
    {
        return docManager.getDocs(msg.sender);
    }

    function viewMyCopyDocs() view external returns(Document[] memory)
    {
        return docManager.getAllCopyShared(msg.sender);
    }

    function viewDocPendingTransfer() view external returns(Document[] memory)
    {
        return docManager.getAllCopyPendingTransfer(msg.sender);
    }

    function viewDocCertified() view external returns(Document[] memory)
    {
        return docManager.getAllCopyCertified(msg.sender);
    }

    function viewCertificationRequest() external view returns(CertificationRequest[] memory)
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

    function certifyDocument(address applicant, uint256 tokenID, string memory hashNFT) private
    {
        bool isAuthority;

        isAuthority = accountManager.isAuthority(msg.sender);
        docManager.certify(msg.sender, isAuthority, applicant, tokenID, hashNFT);
    }

    function acceptCertificationRequest(CertificationRequest memory request, string memory hashNFT, bool keepCopyDoc) public
    {
        // check si msg.sender a bien déja une copie du Document
        certifyDocument(request.applicant, request.tokenID, hashNFT);
        delRequest(msg.sender, request.index);

        if (keepCopyDoc)
        {
            docManager.convertTypeDoc(msg.sender, TypeDoc.CopyCertified, TypeDoc.CopyShared, request.tokenID, "");
        }
        else
        {
            docManager.delCopyDoc(msg.sender, TypeDoc.CopyCertified, docManager.getIndexNFT(msg.sender, TypeDoc.CopyCertified, request.tokenID));
        }
    }

    function rejectCertificationRequest(CertificationRequest memory request) external
    {
        // check si msg.sender à bien déja une copie du Document
        delRequest(msg.sender, request.index);
        docManager.delCopyDoc(msg.sender, TypeDoc.CopyCertified, docManager.getIndexNFT(msg.sender, TypeDoc.CopyCertified, request.tokenID));
    }
}
