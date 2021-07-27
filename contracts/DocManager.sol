//SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "./SaveDocToken.sol";
import "./AccountManager.sol";
import "./NFT.sol";

contract DocManager is NFT
{
    address private owner;
    mapping(string => bool) hashDocs;
    SaveDocToken private saveDocToken;
    AccountManager private accountManager;
    mapping(address => Document[]) private balance;
    mapping(address => Document[]) private balanceCopyDoc;

    constructor(SaveDocToken _saveDocToken, AccountManager _accountManager)
    {
        owner = msg.sender;
        saveDocToken = _saveDocToken;
        accountManager = _accountManager;
    }


    modifier isMyToken(uint256 tokenID, address ownerNFT)
    {
        require(saveDocToken.ownerOf(tokenID) == ownerNFT, "TokenManager: Cet NFT ne vous appartient pas !");
        _;
    }

    modifier onlyOwner()
    {
        require(owner == msg.sender, "AccountManager: Vous n'avez pas les droits !");
        _;
    }

    function getIndexNFT(address ownerNFT, uint tokenID, bool isCopy) public view onlyOwner() returns(uint)
    {
        bool found;
        uint256 index;
        Document[] memory nft;

        if (isCopy)
        {
            nft = balanceCopyDoc[ownerNFT];
        }
        else
        {
            nft = balance[ownerNFT];
        }

        for (uint256 i = 0; i < balance[ownerNFT].length; i++)
        {
            if (tokenID == balance[ownerNFT][i].tokenID)
            {
                index = i;
                found = true;
                i = balance[ownerNFT].length;
            }
        }

        require(found, "Cet NFT ne vous appartient pas !");
        return index;
    }

    function createDoc(address ownerNFT, string memory tokenName, string memory tokenURI, string memory tokenMime, uint256 tokenLength, string memory filePath, string memory passwordEncrypted, string memory hashNFT) public returns (Document memory)
    {
       require(!isOfficielDoc(hashNFT), "TokenManager: Ce hash correspond a un NFT officiel.");
       uint256 tokenID;
       Document memory nft;
       address[] memory certifyings;


       tokenID = saveDocToken.mint(ownerNFT, tokenURI);
       nft = Document(tokenID, tokenLength, tokenName, tokenMime, block.timestamp, filePath, certifyings, "", passwordEncrypted, TypeDoc.Original);

       balance[ownerNFT].push(nft);
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

    function getDocs(address ownerNFT) public view returns(Document[] memory)
    {
      return balance[ownerNFT];
    }

    function deleteDoc(address ownerDoc, uint256 tokenID, bool isCopyDoc) public onlyOwner() isMyToken(tokenID, ownerDoc) returns(bool)
    {
        uint256 index = getIndexNFT(ownerDoc, tokenID, false);

        balance[ownerDoc][index] = balance[ownerDoc][balance[ownerDoc].length - 1];
        balance[ownerDoc].pop();

        if (!isCopyDoc)
        {
            saveDocToken.burn(tokenID, msg.sender);
        }
        return true;
    }

    // TODO how burn tokens
    function deleteAllDocs() public
    {
        delete balance[msg.sender];
    }

    function createCopyDoc(address provider, address ownerCopyNFT, uint256 tokenID, string memory tokenURI, TypeDoc typeNft) onlyOwner() isMyToken(tokenID, provider) public
    {
        //TODO
        // check qu'une copie avec le meme tokenID n'exite pas deja
        Document memory nft;
        Document memory nftCopy;

        nft = balance[provider][getIndexNFT(provider, tokenID, false)];
        nftCopy = Document(tokenID, nft.fileSize, nft.filename, nft.fileMimeType, block.timestamp, nft.filePath, nft.certifying, tokenURI, "", typeNft);
        balanceCopyDoc[ownerCopyNFT].push(nftCopy);
    }

    function getAllCopyShared() public view returns(Document[] memory)
    {
        // check si user exist
        Document[] memory nfts;
        uint256 y;

        for (uint256 i = 0; i < balanceCopyDoc[msg.sender].length; i++)
        {
            if (balanceCopyDoc[msg.sender][i].typeNft == TypeDoc.CopyShared)
            {
                nfts[y] = balanceCopyDoc[msg.sender][i];
                y++;
            }
        }
        return nfts;
    }

    function getAllCopyPendingTransfer() public view returns(Document[] memory)
    {
        // check si user exist
        Document[] memory nfts;
        uint256 y;

        for (uint256 i = 0; i < balanceCopyDoc[msg.sender].length; i++)
        {
            if (balanceCopyDoc[msg.sender][i].typeNft == TypeDoc.CopyPendingTransfer)
            {
                nfts[y] = balanceCopyDoc[msg.sender][i];
                y++;
            }
        }
        return nfts;
    }

    function getAllCopyCertified() public view returns(Document[] memory)
    {
        // check si user exist
        Document[] memory nfts;
        uint256 y;

        for (uint256 i = 0; i < balanceCopyDoc[msg.sender].length; i++)
        {
            if (balanceCopyDoc[msg.sender][i].typeNft == TypeDoc.CopyCertified)
            {
                nfts[y] = balanceCopyDoc[msg.sender][i];
                y++;
            }
        }
        return nfts;
    }

    function delCopyDoc(address ownerNFT, uint256 index) public onlyOwner()
    {
        // check si user exist
        Document memory substitute;

        substitute = balanceCopyDoc[ownerNFT][balanceCopyDoc[ownerNFT].length - 1];
        balanceCopyDoc[ownerNFT][index] = substitute;
        balanceCopyDoc[ownerNFT].pop();
    }

    function delAllCopyNFT(address ownerNFT) public onlyOwner()
    {
        // check si user exist
        delete balanceCopyDoc[ownerNFT];
    }

    function certify(address certifying, address dest, uint256 tokenID, string memory hashNFT) onlyOwner() public
    {
        uint256 index;

        if (accountManager.isAuthority(certifying))
        {
            hashDocs[hashNFT] = true;
        }
        index = getIndexNFT(dest, tokenID, false);
        balance[dest][index].certifying.push(certifying);
    }

    function copyDocToOriginal(address ownerCopyNFT, string memory passwordEncrypted, uint256 tokenID) public onlyOwner()
    {
        Document memory newNFT;
        uint256 index;

        index = getIndexNFT(ownerCopyNFT, tokenID, true);
        newNFT = balanceCopyDoc[ownerCopyNFT][index];
        newNFT.tokenURI = "";
        newNFT.typeNft = TypeDoc.Original;
        newNFT.dateAdd = block.timestamp;
        newNFT.passwordEncrypted = passwordEncrypted;
        balance[ownerCopyNFT].push(newNFT);
        delCopyDoc(ownerCopyNFT, index);
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
