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
        require(from != to, "SaveMyDoc: L'address source et de destination sont identique");
        _;
    }

    function getIndexNFT(address ownerNFT, TypeDoc typeNft, uint tokenID) public view onlyOwner() returns(uint)
    {
        bool found;
        uint256 index;

        for (uint256 i = 0; i < documents[ownerNFT][typeNft].length; i++)
        {
            if (tokenID == documents[ownerNFT][typeNft][i].tokenID)
            {
                index = i;
                found = true;
                i = documents[ownerNFT][typeNft].length;
            }
        }

        require(found, "Cet NFT ne vous appartient pas !");
        return index;
    }

    function createDoc(address ownerNFT, uint256 tokenID, string memory tokenName, string memory tokenMime, uint256 tokenLength, string memory filePath, string memory passwordEncrypted, string memory hashNFT)onlyOwner() external returns (Document memory)
    {
        //check que l'utilisateur existe
       require(!isOfficielDoc(hashNFT), "TokenManager: Ce document correspond a un NFT officiel.");
       Document memory nft;
       address[] memory certifyings;

       nft = Document(tokenID, tokenLength, tokenName, tokenMime, block.timestamp, filePath, certifyings, "", passwordEncrypted, TypeDoc.Original);

       documents[ownerNFT][TypeDoc.Original].push(nft);
       return nft;
    }

/*    function createNFTCertified(string memory tokenName, string memory tokenURI, string memory tokenMime, uint256 tokenLength, string memory filePath, string memory passwordEncrypted) public returns(Document memory)
    {
       uint256 tokenID;
       Nft memory nft;
       address[] memory certifyings;

       certifyings[0] = msg.sender;
       tokenID = saveMyDocToken.addItem(ownerNFT, tokenURI);
       nft = Nft(tokenID, tokenLength, tokenName, tokenMime, block.timestamp, filePath, certifyings , "", passwordEncrypted, TypeNFT.Original, true);

       balance[ownerNFT].push(nft);

       return nft;
     }*/

    function getDocs(address addressUser) external view onlyOwner() returns(Document[] memory)

    {
        //check que l'utilisateur existe
      return documents[addressUser][TypeDoc.Original];
    }

    function deleteDoc(address ownerDoc, uint256 tokenID) external onlyOwner() returns(bool)
    {
        uint256 index = getIndexNFT(ownerDoc, TypeDoc.Original, tokenID);

        documents[ownerDoc][TypeDoc.Original][index] = documents[ownerDoc][TypeDoc.Original][documents[ownerDoc][TypeDoc.Original].length - 1];
        documents[ownerDoc][TypeDoc.Original].pop();
        return true;
    }

    // TODO how burn tokens
    function deleteAllDocs(address addressUser) external onlyOwner()
    {
        delete documents[addressUser][TypeDoc.Original];
    }

    function createCopyDoc(address provider, address ownerCopyNFT, uint256 tokenID, string memory tokenURI, TypeDoc typeNft) onlyOwner() addressesAreDifferent(provider, ownerCopyNFT) external
    {
        //TODO
        // check qu'une copie avec le meme tokenID n'exite pas deja
        Document memory nft;
        Document memory nftCopy;

        nft = documents[provider][TypeDoc.Original][getIndexNFT(provider, TypeDoc.Original, tokenID)];
        nftCopy = Document(tokenID, nft.fileSize, nft.filename, nft.fileMimeType, block.timestamp, nft.filePath, nft.certifying, tokenURI, "", typeNft);
        documents[ownerCopyNFT][typeNft].push(nftCopy);
    }

    function getAllCopyShared(address addressUser) public view onlyOwner() returns(Document[] memory)
    {
        // check si user exist
        return documents[addressUser][TypeDoc.CopyShared];
    }

    function getAllCopyPendingTransfer(address addressUser) public view onlyOwner() returns(Document[] memory)
    {
        // check si user exist
        return documents[addressUser][TypeDoc.CopyPendingTransfer];
    }

    function getAllCopyCertified(address addressUser) public view onlyOwner() returns(Document[] memory)
    {
        // check si user exist
        return documents[addressUser][TypeDoc.CopyCertified];
    }

    function convertTypeDoc(address ownerCopyNFT, TypeDoc typeDocSc, TypeDoc typeDocDst, uint256 tokenID, string memory passwordEncrypted) external onlyOwner()
    {
        require(bytes(passwordEncrypted).length != 0 && typeDocDst == TypeDoc.Original, "DocManager: Vous ne pouvez pas convertir ce documment");
        Document memory doc;
        uint256 index;

        index = getIndexNFT(ownerCopyNFT, typeDocSc, tokenID);
        doc = documents[ownerCopyNFT][typeDocSc][index];
        doc.typeNft = typeDocDst;

        if (bytes(passwordEncrypted).length != 0 && typeDocDst == TypeDoc.Original)
        {
            doc.tokenURI = "";
            doc.dateAdd = block.timestamp;
            doc.passwordEncrypted = passwordEncrypted;
        }

        documents[ownerCopyNFT][typeDocDst].push(doc);
        delCopyDoc(ownerCopyNFT, typeDocSc, index);
    }

    function delCopyDoc(address ownerNFT, TypeDoc typeNft, uint256 index) public onlyOwner()
    {
        // check si user exist
        Document memory substitute;

        substitute = documents[ownerNFT][typeNft][documents[ownerNFT][typeNft].length - 1];
        documents[ownerNFT][typeNft][index] = substitute;
        documents[ownerNFT][typeNft].pop();
    }

    function delAllCopyDoc(address ownerNFT) external onlyOwner()
    {
        // check si user exist
        delete documents[ownerNFT][TypeDoc.CopyShared];
        delete documents[ownerNFT][TypeDoc.CopyCertified];
        delete documents[ownerNFT][TypeDoc.CopyPendingTransfer];
    }

    function certify(address certifying, bool isAuthority, address dest, uint256 tokenID, string memory hashNFT) onlyOwner() external
    {
        // check certifiant existe
        uint256 index;

        if (isAuthority)
        {
            hashDocs[hashNFT] = true;
        }
        index = getIndexNFT(dest, TypeDoc.Original, tokenID);
        documents[dest][TypeDoc.Original][index].certifying.push(certifying);
    }

    function isOfficielDoc(string memory hashNFT) private onlyOwner() view returns(bool)
    {
        return hashDocs[hashNFT];
    }
}
