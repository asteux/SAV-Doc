//SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SaveDocToken.sol";
import "./AccountManager.sol";
import "./NFT.sol";

contract DocManager is Ownable, NFT
{
    mapping(string => bool) hashDocs;
    SaveDocToken private saveDocToken;
    AccountManager private accountManager;
    mapping(address => mapping(TypeDoc => Document[])) private documents;

    constructor(SaveDocToken _saveDocToken, AccountManager _accountManager)
    {
        saveDocToken = _saveDocToken;
        accountManager = _accountManager;
    }

    modifier userExist(address addressUser)
    {
        require(accountManager.checkIfUserExist(addressUser), "DocManager: Cette utilisateur n'existe pas.");
        _;
    }

    modifier isMyToken(uint256 tokenID, address ownerNFT)
    {
        require(saveDocToken.ownerOf(tokenID) == ownerNFT, "TokenManager: Cet NFT ne vous appartient pas !");
        _;
    }

    modifier addressesAreDifferent(address from, address to)
    {
        require(from != to, "SaveMyDoc: L'address source et de destination sont identique");
        _;
    }

    function getIndexNFT(address ownerNFT, TypeDoc typeNft, uint tokenID) public view onlyOwner() returns(uint)
    {
        bool found;
        uint256 index;
        // Document[] memory nft;

        // if (isCopy)
        // {
        //     nft = documents[ownerNFT][typeNft];
        // }
        // else
        // {
        //     nft = documents[ownerNFT][TypeDoc.Original];
        // }

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

    function createDoc(address ownerNFT, string memory tokenName, string memory tokenURI, string memory tokenMime, uint256 tokenLength, string memory filePath, string memory passwordEncrypted, string memory hashNFT) public returns (Document memory)
    {
        //check que l'utilisateur existe
       require(!isOfficielDoc(hashNFT), "TokenManager: Ce document correspond a un NFT officiel.");
       uint256 tokenID;
       Document memory nft;
       address[] memory certifyings;


       tokenID = saveDocToken.mint(ownerNFT, tokenURI);
       nft = Document(tokenID, tokenLength, tokenName, tokenMime, block.timestamp, filePath, certifyings, "", passwordEncrypted, TypeDoc.Original);

       documents[ownerNFT][TypeDoc.Original].push(nft);
       return nft;
    }

    // function createNFTCertified(string memory tokenName, string memory tokenURI, string memory tokenMime, uint256 tokenLength, string memory filePath, string memory passwordEncrypted) public returns(Nft memory)
    // {
    //   uint256 tokenID;
    //   Nft memory nft;
    //   address[] memory certifyings;

    //   certifyings[0] = msg.sender;
    //   tokenID = saveMyDocToken.addItem(ownerNFT, tokenURI);
    //   nft = Nft(tokenID, tokenLength, tokenName, tokenMime, block.timestamp, filePath, certifyings , "", passwordEncrypted, TypeNFT.Original, true);

    //   balance[ownerNFT].push(nft);

    //   return nft;
    // }

    function getDocs() public view returns(Document[] memory)
    {
        //check que l'utilisateur existe
      return documents[msg.sender][TypeDoc.Original];
    }

    function deleteDoc(address ownerDoc, uint256 tokenID, bool isCopyDoc) external onlyOwner() isMyToken(tokenID, ownerDoc) returns(bool)
    {
        uint256 index = getIndexNFT(ownerDoc, TypeDoc.Original, tokenID);

        documents[ownerDoc][TypeDoc.Original][index] = documents[ownerDoc][TypeDoc.Original][documents[ownerDoc][TypeDoc.Original].length - 1];
        documents[ownerDoc][TypeDoc.Original].pop();

        if (!isCopyDoc)
        {
            saveDocToken.burn(tokenID, msg.sender);
        }
        return true;
    }

    // TODO how burn tokens
    function deleteAllDocs() public
    {
        delete documents[msg.sender][TypeDoc.Original];
    }

    function createCopyDoc(address provider, address ownerCopyNFT, uint256 tokenID, string memory tokenURI, TypeDoc typeNft) onlyOwner() addressesAreDifferent(provider, ownerCopyNFT) isMyToken(tokenID, provider) userExist(provider) userExist(ownerCopyNFT) public
    {
        //TODO
        // check qu'une copie avec le meme tokenID n'exite pas deja
        Document memory nft;
        Document memory nftCopy;

        nft = documents[provider][TypeDoc.Original][getIndexNFT(provider, TypeDoc.Original, tokenID)];
        nftCopy = Document(tokenID, nft.fileSize, nft.filename, nft.fileMimeType, block.timestamp, nft.filePath, nft.certifying, tokenURI, "", typeNft);
        documents[ownerCopyNFT][typeNft].push(nftCopy);
    }

    function getAllCopyShared() public view returns(Document[] memory)
    {
        // check si user exist
        return documents[msg.sender][TypeDoc.CopyShared];
    }

    function getAllCopyPendingTransfer() public view returns(Document[] memory)
    {
        // check si user exist
        return documents[msg.sender][TypeDoc.CopyPendingTransfer];
    }

    function getAllCopyCertified() public view returns(Document[] memory)
    {
        // check si user exist
        return documents[msg.sender][TypeDoc.CopyCertified];
    }

    function delCopyDoc(address ownerNFT, TypeDoc typeNft, uint256 index) public onlyOwner()
    {
        // check si user exist
        Document memory substitute;

        substitute = documents[ownerNFT][typeNft][documents[ownerNFT][typeNft].length - 1];
        documents[ownerNFT][typeNft][index] = substitute;
        documents[ownerNFT][typeNft].pop();
    }

    function delAllCopyNFT(address ownerNFT) public onlyOwner()
    {
        // check si user exist
        delete documents[ownerNFT][TypeDoc.CopyShared];
        delete documents[ownerNFT][TypeDoc.CopyCertified];
        delete documents[ownerNFT][TypeDoc.CopyPendingTransfer];
    }

    function certify(address certifying, address dest, uint256 tokenID, string memory hashNFT) onlyOwner() public
    {
        uint256 index;

        if (accountManager.isAuthority(certifying))
        {
            hashDocs[hashNFT] = true;
        }
        index = getIndexNFT(dest, TypeDoc.Original, tokenID);
        documents[dest][TypeDoc.Original][index].certifying.push(certifying);
    }

    function copyDocToOriginal(address ownerCopyNFT, TypeDoc typeNft, string memory passwordEncrypted, uint256 tokenID) public isMyToken(tokenID, ownerCopyNFT) onlyOwner()
    {
        Document memory newNFT;
        uint256 index;

        index = getIndexNFT(ownerCopyNFT, typeNft, tokenID);
        newNFT = documents[ownerCopyNFT][typeNft][index];
        newNFT.tokenURI = "";
        newNFT.typeNft = TypeDoc.Original;
        newNFT.dateAdd = block.timestamp;
        newNFT.passwordEncrypted = passwordEncrypted;
        documents[ownerCopyNFT][TypeDoc.Original].push(newNFT);
        delCopyDoc(ownerCopyNFT, typeNft, index);
    }

    function getOwnerToken(uint256 tokenID) public view returns(address)
    {
        return saveDocToken.ownerOf(tokenID);
    }

    function isOfficielDoc(string memory hashNFT) public view returns(bool)
    {
        return hashDocs[hashNFT];
    }
}
