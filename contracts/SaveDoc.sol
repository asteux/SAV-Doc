// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AccountManager.sol";
import "./DocManager.sol";
import "./SaveDocToken.sol";
import "./SaveDocStruct.sol";

/**
 * @title SAV Doc
 * @notice Contract used to secure, transfer, share and certify document
 * @dev Main contract of SAV Doc
 */
contract SaveDoc is Ownable, SaveDocStruct
{
    mapping(address => mapping(uint256 => CertificationRequest)) private requests;
    SaveDocToken private saveDocToken;
    DocManager private docManager;
    AccountManager private accountManager;

    /**
     * @dev Create new Sav Doc contract
     * @param _docManager address of DocManager contract
     * @param _saveDocToken address of SaveDocToken contract
     * @param _accountManager address of AccountManager contract
     */
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

    /**
     * @dev modifier to check if token is owned by sender
     * @param tokenID ID of token
     */
    modifier isMyToken(uint256 tokenID)
    {
        require(saveDocToken.ownerOf(tokenID) == msg.sender, "SaveDoc: Cet NFT ne vous appartient pas !");
        _;
    }

    /**
     * @dev modifier to check if user exists
     * @param addressUser address of user
     */
    modifier userExist(address addressUser)
    {
        require(accountManager.checkIfUserExist(addressUser), "SaveDoc: Cette utilisateur n'existe pas.");
        _;
    }

    /**
     * @dev modifier to check if `_certifying` already receive a certification request
     * @param _certifying _certifying of document
     * @param _tokenID ID of token
     */
    modifier requestExist(address _certifying, uint256 _tokenID)
    {
        require(requests[_certifying][_tokenID].exist, "SavDoc: La demande de certification n'existe pas.");
        _;
    }

    /**
     * @dev modifier to check if `_certifying` not already receive a certification request
     * @param _certifying _certifying of document
     * @param _tokenID ID of token
     */
    modifier requestNotExist(address _certifying, uint256 _tokenID)
    {
        require(!requests[_certifying][_tokenID].exist, "SavDoc: La demande de certification existe.");
        _;
    }

    /**
     * @notice Subscribe to SAV Doc as user
     * @dev Create new user (emits a Subscribe event)
     * @param name name of user
     * @param pubKey public key of user
     * @param passwordMaster password master of user
     */
    function subscribe(string memory name, string memory pubKey, string memory passwordMaster) external
    {
        accountManager.addUser(msg.sender, name, pubKey, passwordMaster);
        emit Subscribe(msg.sender, name, pubKey);
    }

    /**
     * @dev Create new authority (emits a SubscribeAuthority event)
     * @param authority address of authority
     * @param name name of authority
     * @param pubKey public key of authority
     * @param passwordMaster password master of authority
     */
    function subscribeAuthority(address authority,string memory name, string memory pubKey, string memory passwordMaster) onlyOwner() external
    {
        accountManager.addAuthority(authority, name, pubKey, passwordMaster);
        emit SubscribeAuthority(authority, pubKey);
    }

    /**
     * @notice View my informations
     * @dev Get sender user informations
     * @return user informations
     */
    function viewMyProfil() view external userExist(msg.sender) returns(User memory)
    {
        return accountManager.getUser(msg.sender);
    }

    /**
     * @notice View informations of user by address
     * @dev Get informations of user
     * @param _address address of user
     * @return user informations of `address`
     */
    function viewProfil(address _address) view external returns(User memory)
    {
        return accountManager.getUser(_address);
    }

    /**
     * @notice Get my password master
     * @dev Get password master of sender
     * @return password master of sender
     */
    function getMyPasswordMaster() view external returns(string memory)
    {
        return accountManager.getPasswordMaster(msg.sender);
    }

    /**
     * @notice Set my name
     * @dev Set user name of sender (emits a ChangeUsername event)
     * @param name new name of user
     */
    function changeMyName(string memory name) external
    {
        accountManager.setUser(msg.sender, name);
        emit ChangeUsername(msg.sender, name);
    }

    /**
     * @notice Delete my account
     * @dev Remove account of sender (emits a Unsubcribe event)
     */
    function unsubscribe() external userExist(msg.sender)
    {
        docManager.deleteAllDocs(msg.sender);
        docManager.delAllCopyDoc(msg.sender);
        accountManager.delUser(msg.sender);
        emit Unsubcribe(msg.sender);
    }

    /**
     * @notice Secure a document
     * @dev Secure a document (emits a SecureDocument event)
     * @param tokenName name of document
     * @param tokenURI URI of token
     * @param tokenMime mime type of document
     * @param tokenLength size (in bytes) of document
     * @param filePath folder of document
     * @param passwordEncrypted encrypted password of document
     * @param hashNFT hash of document
     * @return secured document informations
     */
    function secureDocument(string memory tokenName, string memory tokenURI, string memory tokenMime, uint256 tokenLength, string memory filePath, string memory passwordEncrypted, string memory hashNFT) external userExist(msg.sender) returns (Document memory)
    {
        uint256 tokenID;
        Document memory document;

        tokenID = saveDocToken.mint(msg.sender, tokenURI);
        document = docManager.createDoc(msg.sender, tokenID, tokenName, tokenMime, tokenLength, filePath, passwordEncrypted, hashNFT);
        emit SecureDocument(msg.sender, tokenID);

       return document;
    }

    /**
     * @notice Delete a secured document by tokenID
     * @dev Delete a secured document of sender by tokenID (see _delMyDocument function) (emits a DeleteDocumment event)
     * @param tokenID ID of token
     * @param forTransfer true to burn token
     */
    function delMyDocument(uint256 tokenID, bool forTransfer) external isMyToken(tokenID)
    {
        _delMyDocument(msg.sender, tokenID, forTransfer);
    }

    /**
     * @dev Delete a secured document of `ownerDoc` by tokenID (emits a DeleteDocumment event)
     * @param ownerDoc owner of document
     * @param tokenID ID of token
     * @param forTransfer true to burn token
     */
    function _delMyDocument(address ownerDoc, uint256 tokenID, bool forTransfer) private
    {
        docManager.deleteDoc(ownerDoc, tokenID);

        if (!forTransfer)
        {
            saveDocToken.burn(tokenID, ownerDoc);
        }
        emit DeleteDocumment(ownerDoc, tokenID, forTransfer);
    }

    /**
     * @notice Get token URI of document
     * @dev Get token URI of document
     * @param tokenID ID of token
     * @return token URI of document
     */
    function getTokenURI(uint256 tokenID) external view isMyToken(tokenID) returns(string memory)
    {
        return saveDocToken.tokenURI(tokenID);
    }

    /**
     * @notice Transfer my secured document
     * @dev Transfer a secured document (emits a TransferDocument event)
     * @param to recipient of document
     * @param tokenID ID of token
     * @param tokenURITmp token URI to make the document visible by `to`
     */
    function transferDoc(address to, uint256 tokenID, string memory tokenURITmp) external isMyToken(tokenID) userExist(to)
    {
        docManager.createCopyDoc(msg.sender, to, tokenID, tokenURITmp, TypeDoc.CopyPendingTransfer);
        saveDocToken.transfer(msg.sender, to, tokenID);
        _delMyDocument(msg.sender, tokenID, true);
        emit TransferDocument(msg.sender, to, tokenID);
    }

    /**
     * @notice Share my secured document
     * @dev Share a secured document (emits a ShareDoc event)
     * @param tokenID ID of token
     * @param to recipient of document
     * @param tokenURI token URI to make the document visible by `to`
     */
    function shareDoc(uint256 tokenID, address to, string memory tokenURI) external isMyToken(tokenID) userExist(to)
    {
        docManager.createCopyDoc(msg.sender, to, tokenID, tokenURI, TypeDoc.CopyShared);
        emit ShareDoc(msg.sender, to, tokenID);
    }

    /**
     * @notice Accept a transfered document
     * @dev Accept a transfered document (emits a AcceptTransferDoc event)
     * @param tokenID ID of token
     * @param newTokenURI URI of token
     * @param passwordEncrypted encrypted password of document
     */
    function acceptNewDoc(uint256 tokenID, string memory newTokenURI, string memory passwordEncrypted) external isMyToken(tokenID)
    {
        docManager.convertTypeDoc(msg.sender, TypeDoc.CopyPendingTransfer, TypeDoc.Original, tokenID, passwordEncrypted);
        saveDocToken.setTokenURI(tokenID, newTokenURI, msg.sender);
        emit AcceptTransferDoc(msg.sender, tokenID);
    }

    /**
     * @notice Delete a shared document
     * @dev Delete a shared document (emits a DeleteMyDocCopy event)
     * @param tokenID ID of token
     */
    function delCopyDocShared(uint tokenID) external
    {
        int256 index = docManager.getIndexNFT(msg.sender, TypeDoc.CopyShared, tokenID);
        require(index > -1, "SaveDoc: Vous n'avez pas de copie a supprimer");

        docManager.delCopyDoc(msg.sender, TypeDoc.CopyShared, uint256(index));
        emit DeleteMyDocCopy(msg.sender, tokenID);
    }

    /**
     * @notice Send nex certification request
     * @dev Send nex certification request (emits a RequestCertification event)
     * @param _tokenID ID of document
     * @param _tokenURI URI of document
     * @param _certifying recipent of request
     */
    function requestCertification(uint256 _tokenID, string memory _tokenURI, address _certifying) isMyToken(_tokenID) external userExist(_certifying) requestNotExist(_certifying, _tokenID)
    {
        docManager.createCopyDoc(msg.sender, _certifying, _tokenID, _tokenURI, TypeDoc.CopyCertified);

        requests[_certifying][_tokenID].applicant = msg.sender;
        requests[_certifying][_tokenID].tokenID = _tokenID;
        requests[_certifying][_tokenID].exist = true;

        emit RequestCertification(requests[_certifying][_tokenID].applicant, requests[_certifying][_tokenID].tokenID);
    }

    /**
     * @notice View all my secured documents
     * @dev get all secured document of sender
     * @return secured documents
     */
    function viewMyDocs() view external userExist(msg.sender) returns(Document[] memory)
    {
        return docManager.getDocs(msg.sender);
    }

    /**
     * @notice View all my shared documents
     * @dev get all shared document of sender
     * @return shared documents
     */
    function viewMyCopyDocs() view external userExist(msg.sender) returns(Document[] memory)
    {
        return docManager.getAllCopyShared(msg.sender);
    }

    /**
     * @notice View all my documents being transferred
     * @dev get all documents being transferred of sender
     * @return documents being transferred
     */
    function viewDocPendingTransfer() view external userExist(msg.sender) returns(Document[] memory)
    {
        return docManager.getAllCopyPendingTransfer(msg.sender);
    }

    /**
     * @notice View all my certified documents
     * @dev get all certified document of sender
     * @return certified documents
     */
    function viewDocCertified() view external userExist(msg.sender) returns(Document[] memory)
    {
        return docManager.getAllCopyCertified(msg.sender);
    }

    /**
     * @notice View one of all certification requests of document
     * @dev Get certification request of document by token ID
     * @param _tokenID ID of token
     * @return certification request
     */
    function viewCertificationRequest(uint256 _tokenID) requestExist(msg.sender, _tokenID) view external returns(CertificationRequest memory)
    {
        return requests[msg.sender][_tokenID];
    }

    /**
     * @dev Delete certification request
     * @param _certifying certifying of document
     * @param _tokenID ID of token
     */
    function delRequest(address _certifying, uint256 _tokenID) private
    {
        delete requests[_certifying][_tokenID];
    }

    /**
     * @dev Certify a document
     * @param applicant owner of document
     * @param tokenID ID of token
     * @param hashNFT hash of document
     */
    function certifyDocument(address applicant, uint256 tokenID, string memory hashNFT) private
    {
        bool isAuthority;

        isAuthority = accountManager.isAuthority(msg.sender);
        docManager.certify(msg.sender, isAuthority, applicant, tokenID, hashNFT);
    }

    /**
     * @notice Accept a certification request
     * @dev Accept a certification request (emits a AcceptCertificationRequest event)
     * @param _tokenID ID of token
     * @param _hashNFT hash of document
     * @param _keepCopyDoc true if sender want to keep a copy of document
     */
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

    /**
     * @notice Reject a certification request
     * @dev Reject a certification request (emits a RejectCertificationRequest event)
     * @param _tokenID ID of token
     */
    function rejectCertificationRequest(uint256 _tokenID) requestExist(msg.sender, _tokenID) external
    {
        CertificationRequest memory request = requests[msg.sender][_tokenID];
        int256 index = docManager.getIndexNFT(msg.sender, TypeDoc.CopyCertified, request.tokenID);
        delRequest(msg.sender, _tokenID);
        docManager.delCopyDoc(msg.sender, TypeDoc.CopyCertified, uint256(index));

        emit RejectCertificationRequest(msg.sender, request.applicant, request.tokenID);
    }

    /**
     * @notice Check if token exist
     * @dev Check if token exist
     * @param tokenID ID of token
     * @return true if token exists
     */
    function tokenExist(uint256 tokenID) view onlyOwner() public returns(bool)
    {
        return saveDocToken.exist(tokenID);
    }
}
