//SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SaveDocStruct.sol";

contract DocManager is Ownable, SaveDocStruct
{
    mapping(string => bool) hashDocs;
    mapping(address => mapping(TypeDoc => Document[])) private documents;

    modifier addressesAreDifferent(address from, address to)
    {
        require(from != to, "DocManager: L'address source et de destination sont identique");
        _;
    }

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

    function createDoc(address ownerNFT, uint256 tokenID, string memory tokenName, string memory tokenMime, uint256 tokenLength, string memory filePath, string memory passwordEncrypted, string memory hashNFT) onlyOwner() external returns (Document memory)
    {
       require(!isOfficielDoc(hashNFT), "DocManager: Ce document correspond a un NFT officiel.");
       Document memory nft;
       address[] memory certifyings;

       nft = Document(tokenID, tokenLength, tokenName, tokenMime, block.timestamp, filePath, certifyings, "", passwordEncrypted, TypeDoc.Original);

       documents[ownerNFT][TypeDoc.Original].push(nft);
       return nft;
    }

    function getDocs(address addressUser) external view onlyOwner() returns(Document[] memory)
    {
      return documents[addressUser][TypeDoc.Original];
    }

    function deleteDoc(address ownerDoc, uint256 tokenID) external onlyOwner() returns(bool)
    {
        int index = getIndexNFT(ownerDoc, TypeDoc.Original, tokenID);
        require(index > -1, "DocManager: Cet NFT ne vous appartient pas !");

        documents[ownerDoc][TypeDoc.Original][uint256(index)] = documents[ownerDoc][TypeDoc.Original][documents[ownerDoc][TypeDoc.Original].length - 1];
        documents[ownerDoc][TypeDoc.Original].pop();
        return true;
    }

    function deleteAllDocs(address addressUser) external onlyOwner()
    {
        delete documents[addressUser][TypeDoc.Original];
    }

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

    function getAllCopyShared(address addressUser) public view onlyOwner() returns(Document[] memory)
    {
        return documents[addressUser][TypeDoc.CopyShared];
    }

    function getAllCopyPendingTransfer(address addressUser) public view onlyOwner() returns(Document[] memory)
    {
        return documents[addressUser][TypeDoc.CopyPendingTransfer];
    }

    function getAllCopyCertified(address addressUser) public view onlyOwner() returns(Document[] memory)
    {
        return documents[addressUser][TypeDoc.CopyCertified];
    }

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

    function delCopyDoc(address ownerNFT, TypeDoc typeNft, uint256 index) public onlyOwner()
    {
        Document memory substitute;

        substitute = documents[ownerNFT][typeNft][documents[ownerNFT][typeNft].length - 1];
        documents[ownerNFT][typeNft][index] = substitute;
        documents[ownerNFT][typeNft].pop();
    }

    function delAllCopyDoc(address ownerNFT) external onlyOwner()
    {
        delete documents[ownerNFT][TypeDoc.CopyShared];
        delete documents[ownerNFT][TypeDoc.CopyCertified];
        delete documents[ownerNFT][TypeDoc.CopyPendingTransfer];
    }

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

    function isOfficielDoc(string memory hashNFT) private onlyOwner() view returns(bool)
    {
        return hashDocs[hashNFT];
    }
}
