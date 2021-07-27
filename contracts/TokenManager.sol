//SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "./SaveMyDocToken.sol";
import "./NFT.sol";

contract TokenManager is NFT
{
    address private owner;
    mapping(string => bool) hashNFTs;
    SaveMyDocToken private saveMyDocToken;
    mapping(address => Nft[]) private balance;
    mapping(address => Nft[]) private balanceCopyNFT;

    constructor(SaveMyDocToken _saveMyDocToken)
    {
        owner = msg.sender;
        saveMyDocToken = _saveMyDocToken;
    }


    modifier isMyToken(uint256 tokenID, address ownerNFT)
    {
        require(saveMyDocToken.ownerOf(tokenID) == ownerNFT, "TokenManager: Cet NFT ne vous appartient pas !");
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
        Nft[] memory nft;

        if (isCopy)
        {
            nft = balanceCopyNFT[ownerNFT];
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

    function createNFT(address ownerNFT,string memory tokenName, string memory tokenURI, string memory tokenMime, uint256 tokenLength, string memory filePath, string memory passwordEncrypted, string memory hashNFT) public returns (Nft memory)
    {
       require(!isOfficielNFT(hashNFT), "TokenManager: Ce hash correspond a un NFT officiel.");
       uint256 tokenID;
       Nft memory nft;
       address[] memory certifyings;


       tokenID = saveMyDocToken.addItem(ownerNFT, tokenURI);
       nft = Nft(tokenID, tokenLength, tokenName, tokenMime, block.timestamp, filePath, certifyings, "", passwordEncrypted, TypeNFT.Original, false);

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

    function getNFTs(address ownerNFT) public view returns(Nft[] memory)
    {
      require(balance[ownerNFT].length > 0 , "TokenManager: Vous n'avez pas de NFT !");
      return balance[ownerNFT];
    }

    function deleteNFT(address ownerNFT, uint256 tokenID, bool isNFTCopy) public onlyOwner() isMyToken(tokenID, ownerNFT) returns(bool)
    {
        uint256 index = getIndexNFT(ownerNFT, tokenID, false);

        balance[ownerNFT][index] = balance[ownerNFT][balance[ownerNFT].length - 1];
        balance[ownerNFT].pop();

        if (!isNFTCopy)
        {
            saveMyDocToken.delItem(tokenID, ownerNFT);
        }
        return true;
    }

    function deleteAllNFT(address ownerNFT) public onlyOwner()
    {
        delete balance[ownerNFT];
    }

    function createCopyNFT(address provider, address ownerCopyNFT, uint256 tokenID, string memory tokenURI, TypeNFT typeNft) isMyToken(tokenID, provider) onlyOwner() public
    {
        //TODO
        //require(getIndexNFT(, tokenID, true));
        Nft memory nft;
        Nft memory nftCopy;

        nft = balance[provider][getIndexNFT(provider, tokenID, false)];
        nftCopy = Nft(tokenID, nft.tokenLength, nft.tokenName, nft.tokenMime, block.timestamp, nft.filePath, nft.certifying, tokenURI, "", typeNft, nft.isCertified);
        balanceCopyNFT[ownerCopyNFT].push(nftCopy);
    }

    function getAllCopyNFT(address ownerNFT) public view onlyOwner() returns(Nft[] memory)
    {
        Nft[] memory nfts;
        uint256 y;

        for (uint256 i = 0; i < balanceCopyNFT[ownerNFT].length; i++)
        {
            if (balanceCopyNFT[ownerNFT][i].typeNft == TypeNFT.Copy)
            {
                nfts[y] = balanceCopyNFT[ownerNFT][i];
                y++;
            }
        }
        return nfts;
    }

    function getAllCopyNFTTransfer(address ownerCopyNFT) public view onlyOwner() returns(Nft[] memory)
    {
        Nft[] memory nfts;
        uint256 y;

        for (uint256 i = 0; i < balanceCopyNFT[ownerCopyNFT].length; i++)
        {
            if (balanceCopyNFT[ownerCopyNFT][i].typeNft == TypeNFT.CopyTransfer)
            {
                nfts[y] = balanceCopyNFT[ownerCopyNFT][i];
                y++;
            }
        }
        return nfts;
    }

    function getAllCopyNFTCertification(address ownerNFT) public view onlyOwner() returns(Nft[] memory)
    {
        Nft[] memory nfts;
        uint256 y;

        for (uint256 i = 0; i < balanceCopyNFT[ownerNFT].length; i++)
        {
            if (balanceCopyNFT[ownerNFT][i].typeNft == TypeNFT.CopyCertification)
            {
                nfts[y] = balanceCopyNFT[ownerNFT][i];
                y++;
            }
        }
        return nfts;
    }

    function delCopyNFT(address ownerNFT, uint256 index) public onlyOwner()
    {
        Nft memory substitute;

        substitute = balanceCopyNFT[ownerNFT][balanceCopyNFT[ownerNFT].length - 1];
        balanceCopyNFT[ownerNFT][index] = substitute;
        balanceCopyNFT[ownerNFT].pop();
    }

    function delAllCopyNFT(address ownerNFT) public onlyOwner()
    {
        delete balanceCopyNFT[ownerNFT];
    }

    function certify(address certifying, bool isAuthority, address dest, uint256 tokenID, string memory hashNFT) onlyOwner() public
    {
        uint256 index;

        if (isAuthority)
        {
            hashNFTs[hashNFT] = true;
        }
        index = getIndexNFT(dest, tokenID, false);
        balance[dest][index].isCertified = true;
        balance[dest][index].certifying.push(certifying);
    }

    function copyNFTToOriginal(address ownerCopyNFT, string memory passwordEncrypted, uint256 tokenID) public onlyOwner()
    {
        Nft memory newNFT;
        uint256 index;

        index = getIndexNFT(ownerCopyNFT, tokenID, true);
        newNFT = balanceCopyNFT[ownerCopyNFT][index];
        newNFT.tokenURI = "";
        newNFT.typeNft = TypeNFT.Original;
        newNFT.dateAdd = block.timestamp;
        newNFT.passwordEncrypted = passwordEncrypted;
        balance[msg.sender].push(newNFT);
        delCopyNFT(ownerCopyNFT, index);
    }

    function getOwnerToken(uint256 tokenID) public view returns(address)
    {
        return saveMyDocToken.ownerOf(tokenID);
    }

    function isOfficielNFT(string memory hashNFT) public view onlyOwner() returns(bool)
    {
        return hashNFTs[hashNFT];
    }
}
