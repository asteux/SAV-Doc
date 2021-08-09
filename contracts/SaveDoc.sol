//SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "./AccountManager.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DocManager.sol";
import "./SaveDocToken.sol";
import "./SaveDocStruct.sol";


contract SaveDoc is Ownable, SaveDocStruct
{
    mapping(address => mapping(uint256 => CertificationRequest)) private requests;
    SaveDocToken private saveDocToken;
    DocManager private docManager;
    AccountManager private accountManager;


    constructor(DocManager _docManager, SaveDocToken _saveDocToken, AccountManager _accountManager)
    {
        docManager = _docManager;
        saveDocToken = _saveDocToken;
        accountManager = _accountManager;
    }

    event Subscribe(address newUser, string name, string pubkey);
    event SubscribeAuthority(address newUser, string pubkey);
    event ChangeUsername(address user, string newUsername);
    event Unsubcribe(address user);
    event SecureDocument(address user, uint256 tokenID);
    event DeleteDocumment(address ownerDoc, uint256 tokenID, bool forTransfer);
    event TransferDocument(address from, address to, uint256 tokenID);
    event ShareDoc(address from, address to, uint256 tokenID);
    event AcceptTransferDoc(address newOwner, uint256 tokenID);
    event DeleteMyDocCopy(address ownerDoc, uint256 tokenID);
    event RequestCertification(address applicant, uint256 tokenID);
    event AcceptCertificationRequest(address certifying, address applicant, uint256 tokenID, bool keepCopy);
    event RejectCertificationRequest(address certifying, address applicant, uint256 tokenID);

    modifier isMyToken(uint256 tokenID)
    {
        require(saveDocToken.ownerOf(tokenID) == msg.sender, "SaveDoc: Cet NFT ne vous appartient pas !");
        _;
    }

    modifier userExist(address addressUser)
    {
        require(accountManager.checkIfUserExist(addressUser), "SaveDoc: Cette utilisateur n'existe pas.");
        _;
    }

    modifier requestExist(address _certifying, uint256 _tokenID)
    {
        require(requests[_certifying][_tokenID].exist, "SavDoc: La demande de certification n'existe pas.");
        _;
    }

    modifier requestNotExist(address _certifying, uint256 _tokenID)
    {
        require(!requests[_certifying][_tokenID].exist, "SavDoc: La demande de certification existe.");
        _;
    }

    function subscribe(string memory name, string memory pubKey, string memory passwordMaster) external
    {
        accountManager.addUser(msg.sender, name, pubKey, passwordMaster);
        emit Subscribe(msg.sender, name, pubKey);
    }

    function subscribeAuthority(address authority,string memory name, string memory pubKey, string memory passwordMaster) onlyOwner() external
    {
        accountManager.addAuthority(authority, name, pubKey, passwordMaster);
        emit SubscribeAuthority(authority, pubKey);
    }

    function viewMyProfil() view external userExist(msg.sender) returns(User memory)
    {
        return accountManager.getUser(msg.sender);
    }

    function viewProfil(address _address) view external returns(User memory)
    {
        return accountManager.getUser(_address);
    }

    function getMyPasswordMaster() view external returns(string memory)
    {
        return accountManager.getPasswordMaster(msg.sender);
    }

    function changeMyName(string memory name) external
    {
        accountManager.setUser(msg.sender, name);
        emit ChangeUsername(msg.sender, name);
    }

    function unsubscribe() external userExist(msg.sender)
    {
        docManager.deleteAllDocs(msg.sender);
        docManager.delAllCopyDoc(msg.sender);
        accountManager.delUser(msg.sender);
        emit Unsubcribe(msg.sender);
    }

    function secureDocument(string memory tokenName, string memory tokenURI, string memory tokenMime, uint256 tokenLength, string memory filePath, string memory passwordEncrypted, string memory hashNFT) external userExist(msg.sender) returns (Document memory)
    {
        uint256 tokenID;
        Document memory document;

        tokenID = saveDocToken.mint(msg.sender, tokenURI);
        document = docManager.createDoc(msg.sender, tokenID, tokenName, tokenMime, tokenLength, filePath, passwordEncrypted, hashNFT);
        emit SecureDocument(msg.sender, tokenID);

       return document;
    }

    function delMyDocument(uint256 tokenID, bool forTransfer) external isMyToken(tokenID)
    {
        docManager.deleteDoc(msg.sender, tokenID);

        if (!forTransfer)
        {
            saveDocToken.burn(tokenID, msg.sender);
        }
        emit DeleteDocumment(msg.sender, tokenID, forTransfer);
    }

    function delMyDocument(address ownerDoc, uint256 tokenID, bool forTransfer) private
    {
        docManager.deleteDoc(ownerDoc, tokenID);

        if (!forTransfer)
        {
            saveDocToken.burn(tokenID, ownerDoc);
        }
        emit DeleteDocumment(ownerDoc, tokenID, forTransfer);
    }

    function getTokenURI(uint256 tokenID) external view isMyToken(tokenID) returns(string memory)
    {
        return saveDocToken.tokenURI(tokenID);
    }

    function transferDoc(address to, uint256 tokenID, string memory tokenURITmp) external isMyToken(tokenID) userExist(to)
    {
        docManager.createCopyDoc(msg.sender, to, tokenID, tokenURITmp, TypeDoc.CopyPendingTransfer);
        saveDocToken.transfer(msg.sender, to, tokenID);
        delMyDocument(msg.sender, tokenID, true);
        emit TransferDocument(msg.sender, to, tokenID);
    }

    function shareDoc(uint256 tokenID, address to, string memory tokenURI) external isMyToken(tokenID) userExist(to)
    {
        docManager.createCopyDoc(msg.sender, to, tokenID, tokenURI, TypeDoc.CopyShared);
        emit ShareDoc(msg.sender, to, tokenID);
    }

    function acceptNewDoc(uint256 tokenID, string memory newTokenURI, string memory passwordEncrypted) external isMyToken(tokenID)
    {
        docManager.convertTypeDoc(msg.sender, TypeDoc.CopyPendingTransfer, TypeDoc.Original, tokenID, passwordEncrypted);
        saveDocToken.setTokenURI(tokenID, newTokenURI, msg.sender);
        emit AcceptTransferDoc(msg.sender, tokenID);
    }

    function delCopyDocShared(uint tokenID) external
    {
        int256 index = docManager.getIndexNFT(msg.sender, TypeDoc.CopyShared, tokenID);
        require(index > -1, "SaveDoc: Vous n'avez pas de copie a supprimer");

        docManager.delCopyDoc(msg.sender, TypeDoc.CopyShared, uint256(index));
        emit DeleteMyDocCopy(msg.sender, tokenID);
    }

    function requestCertification(uint256 _tokenID, string memory _tokenURI, address _certifying) isMyToken(_tokenID) external userExist(_certifying) requestNotExist(_certifying, _tokenID)
    {
        docManager.createCopyDoc(msg.sender, _certifying, _tokenID, _tokenURI, TypeDoc.CopyCertified);

        requests[_certifying][_tokenID].applicant = msg.sender;
        requests[_certifying][_tokenID].tokenID = _tokenID;
        requests[_certifying][_tokenID].exist = true;

        emit RequestCertification(requests[_certifying][_tokenID].applicant, requests[_certifying][_tokenID].tokenID);
    }

    function viewMyDocs() view external userExist(msg.sender) returns(Document[] memory)
    {
        return docManager.getDocs(msg.sender);
    }

    function viewMyCopyDocs() view external userExist(msg.sender) returns(Document[] memory)
    {
        return docManager.getAllCopyShared(msg.sender);
    }

    function viewDocPendingTransfer() view external userExist(msg.sender) returns(Document[] memory)
    {
        return docManager.getAllCopyPendingTransfer(msg.sender);
    }

    function viewDocCertified() view external userExist(msg.sender) returns(Document[] memory)
    {
        return docManager.getAllCopyCertified(msg.sender);
    }


    function delRequest(address _certifying, uint256 _tokenID) private
    {
        delete requests[_certifying][_tokenID];
    }

    function certifyDocument(address applicant, uint256 tokenID, string memory hashNFT) private
    {
        bool isAuthority;

        isAuthority = accountManager.isAuthority(msg.sender);
        docManager.certify(msg.sender, isAuthority, applicant, tokenID, hashNFT);
    }

    function acceptCertificationRequest(uint256 _tokenID, string memory _hashNFT, bool _keepCopyDoc) requestExist(msg.sender, _tokenID) userExist(msg.sender) public
    {
        CertificationRequest memory request = requests[msg.sender][_tokenID];
        int256 index = docManager.getIndexNFT(msg.sender, TypeDoc.CopyCertified, request.tokenID);
        certifyDocument(request.applicant, request.tokenID, _hashNFT);
        delRequest(msg.sender, request.tokenID);

        if (_keepCopyDoc) {
            docManager.convertTypeDoc(msg.sender, TypeDoc.CopyCertified, TypeDoc.CopyShared, request.tokenID, "");
        } else {
            docManager.delCopyDoc(msg.sender, TypeDoc.CopyCertified, uint256(index));
        }

        emit AcceptCertificationRequest(msg.sender, request.applicant, request.tokenID, _keepCopyDoc);
    }

    function rejectCertificationRequest(uint256 _tokenID) requestExist(msg.sender, _tokenID) external
    {
        CertificationRequest memory request = requests[msg.sender][_tokenID];
        int256 index = docManager.getIndexNFT(msg.sender, TypeDoc.CopyCertified, request.tokenID);
        delRequest(msg.sender, _tokenID);
        docManager.delCopyDoc(msg.sender, TypeDoc.CopyCertified, uint256(index));

        emit RejectCertificationRequest(msg.sender, request.applicant, request.tokenID);
    }

    function tokenExist(uint256 tokenID) view onlyOwner() public returns(bool)
    {
        return saveDocToken.exist(tokenID);
    }
}
