// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SaveDocStruct.sol";

/**
 * @title Document manager for SAV Doc contract
 * @dev All functions are called by the SaveDoc contract
 */
contract DocManager is Ownable, SaveDocStruct
{
    mapping(string => bool) hashDocs;
    mapping(address => mapping(TypeDoc => Document[])) private documents;

    /**
     * @dev modifier to check if `from` and `to` are different
     * @param from address of user 1
     * @param to address of user 2
     */
    modifier addressesAreDifferent(address from, address to)
    {
        require(from != to, "DocManager: L'address source et de destination sont identique");
        _;
    }

    /**
     * @dev Get index of document according to owner, type and tokenID
     * @param ownerNFT owner of document
     * @param typeNft type of document
     * @param tokenID ID of token
     * @return index of document
     */
    function getIndexNFT(address ownerNFT, TypeDoc typeNft, uint tokenID) public view onlyOwner() returns(int256)
    {
        bool found;
        int256 index = -1;

        for (uint256 i = 0; i < documents[ownerNFT][typeNft].length; i++)
        {
            if (tokenID == documents[ownerNFT][typeNft][i].tokenID)
            {
                index = int256(i);
                found = true;
                i = documents[ownerNFT][typeNft].length;
            }
        }
        return index;
    }

    /**
     * @dev Create new document
     * @param ownerNFT owner of document
     * @param tokenID ID of token
     * @param tokenName name of document
     * @param tokenMime mime type of document
     * @param tokenLength size (in bytes) of document
     * @param filePath folder of document
     * @param passwordEncrypted encrypted password of document
     * @param hashNFT hash (SHA256) of document
     * @return created Document
     */
    function createDoc(address ownerNFT, uint256 tokenID, string memory tokenName, string memory tokenMime, uint256 tokenLength, string memory filePath, string memory passwordEncrypted, string memory hashNFT) onlyOwner() external returns (Document memory)
    {
       require(!isOfficielDoc(hashNFT), "DocManager: Ce document correspond a un NFT officiel.");
       Document memory nft;
       address[] memory certifyings;

       nft = Document(tokenID, tokenLength, tokenName, tokenMime, block.timestamp, filePath, certifyings, "", passwordEncrypted, TypeDoc.Original);

       documents[ownerNFT][TypeDoc.Original].push(nft);
       return nft;
    }

    /**
     * @dev Get secured documents
     * @param addressUser owner of documents
     * @return secured documents
     */
    function getDocs(address addressUser) external view onlyOwner() returns(Document[] memory)
    {
      return documents[addressUser][TypeDoc.Original];
    }

    /**
     * @dev Delete secured document
     * @param ownerDoc owner of document
     * @param tokenID ID of token
     * @return true
     */
    function deleteDoc(address ownerDoc, uint256 tokenID) external onlyOwner() returns(bool)
    {
        int index = getIndexNFT(ownerDoc, TypeDoc.Original, tokenID);
        require(index > -1, "DocManager: Cet NFT ne vous appartient pas !");

        documents[ownerDoc][TypeDoc.Original][uint256(index)] = documents[ownerDoc][TypeDoc.Original][documents[ownerDoc][TypeDoc.Original].length - 1];
        documents[ownerDoc][TypeDoc.Original].pop();
        return true;
    }

    /**
     * @dev Delete all secured documents
     * @param addressUser owner of documents
     */
    function deleteAllDocs(address addressUser) external onlyOwner()
    {
        delete documents[addressUser][TypeDoc.Original];
    }

    /**
     * @dev Copy Document
     * @param provider owner of copy
     * @param ownerCopyNFT owner of document
     * @param tokenID ID of token
     * @param tokenURI URI of token
     * @param typeNft type of document (see TypeDoc struct)
     */
    function createCopyDoc(address provider, address ownerCopyNFT, uint256 tokenID, string memory tokenURI, TypeDoc typeNft) onlyOwner() addressesAreDifferent(provider, ownerCopyNFT) external
    {
        int index = getIndexNFT(provider, TypeDoc.Original, tokenID);
        require(getIndexNFT(ownerCopyNFT, typeNft, tokenID) == -1, "DocManager: Le destinaire a deja une copie du document");
        Document memory nft;
        Document memory nftCopy;

        nft = documents[provider][TypeDoc.Original][uint256(index)];
        nftCopy = Document(tokenID, nft.fileSize, nft.filename, nft.fileMimeType, block.timestamp, nft.filePath, nft.certifying, tokenURI, "", typeNft);
        documents[ownerCopyNFT][typeNft].push(nftCopy);
    }

    /**
     * @dev Get all copies of secured documents
     * @param addressUser owner of copies
     * @return all copies of secured documents
     */
    function getAllCopyShared(address addressUser) public view onlyOwner() returns(Document[] memory)
    {
        return documents[addressUser][TypeDoc.CopyShared];
    }

    /**
     * @dev Get all secured documents in pending transfer state
     * @param addressUser owner of copies
     * @return all secured documents in pending transfer state
     */
    function getAllCopyPendingTransfer(address addressUser) public view onlyOwner() returns(Document[] memory)
    {
        return documents[addressUser][TypeDoc.CopyPendingTransfer];
    }

    /**
     * @dev Get all certified secured documents
     * @param addressUser owner of copies
     * @return all certified secured documents
     */
    function getAllCopyCertified(address addressUser) public view onlyOwner() returns(Document[] memory)
    {
        return documents[addressUser][TypeDoc.CopyCertified];
    }

    /**
     * @dev Change type of document (create a copy and delete the old one)
     * @param ownerCopyNFT owner of the copy of the document
     * @param typeDocSc actual type of document
     * @param typeDocDst new type of document
     * @param tokenID ID of token
     * @param passwordEncrypted encrypted password of document
     */
    function convertTypeDoc(address ownerCopyNFT, TypeDoc typeDocSc, TypeDoc typeDocDst, uint256 tokenID, string memory passwordEncrypted) external onlyOwner()
    {
        int index = getIndexNFT(ownerCopyNFT, typeDocSc, tokenID);
        Document memory doc;

        require(typeDocSc != typeDocDst, "DocManager: Le type source et de destination sont identique");
        require(index > -1, "DocManager: Vous n'avez pas de copie de document a convertir");
        require(getIndexNFT(ownerCopyNFT, typeDocDst, tokenID) == -1, "DocManager: Le destinaire a deja une copie du document");


        doc = documents[ownerCopyNFT][typeDocSc][uint256(index)];
        doc.typeNft = typeDocDst;

        if (typeDocDst == TypeDoc.Original)
        {
            require(bytes(passwordEncrypted).length != 0, "DocManager: Le password du document est vide");
            doc.tokenURI = "";
            doc.dateAdd = block.timestamp;
            doc.passwordEncrypted = passwordEncrypted;
        }
        documents[ownerCopyNFT][typeDocDst].push(doc);
        delCopyDoc(ownerCopyNFT, typeDocSc, uint256(index));
    }

    /**
     * @dev Delete copy of secured document according owner, type and index
     * @param ownerNFT owner of document
     * @param typeNft type of document
     * @param index index of item to delete
     */
    function delCopyDoc(address ownerNFT, TypeDoc typeNft, uint256 index) public onlyOwner()
    {
        Document memory substitute;

        substitute = documents[ownerNFT][typeNft][documents[ownerNFT][typeNft].length - 1];
        documents[ownerNFT][typeNft][index] = substitute;
        documents[ownerNFT][typeNft].pop();
    }

    /**
     * @dev Delete all copy, certified and pending transfered documents
     * @param ownerNFT owner of documents
     */
    function delAllCopyDoc(address ownerNFT) external onlyOwner()
    {
        delete documents[ownerNFT][TypeDoc.CopyShared];
        delete documents[ownerNFT][TypeDoc.CopyCertified];
        delete documents[ownerNFT][TypeDoc.CopyPendingTransfer];
    }

    /**
     * @dev Certify a document
     * @param certifying new certifying of document
     * @param isAuthority trus if `certifying` is an authority
     * @param applicant owner of document
     * @param tokenID ID of document
     * @param hashNFT hash of document
     */
    function certify(address certifying, bool isAuthority, address applicant, uint256 tokenID, string memory hashNFT) onlyOwner() external
    {
        uint256 length;
        int index = getIndexNFT(applicant, TypeDoc.Original, tokenID);

        if (isAuthority)
        {
            hashDocs[hashNFT] = true;
        }

        length = documents[applicant][TypeDoc.Original][uint256(index)].certifying.length;
        documents[applicant][TypeDoc.Original][uint256(index)].certifying.push(certifying);
    }

    /**
     * @dev Check if document is considered as official
     * @param hashNFT hash of document
     * @return trus if document is considered as official
     */
    function isOfficielDoc(string memory hashNFT) private onlyOwner() view returns(bool)
    {
        return hashDocs[hashNFT];
    }
}
