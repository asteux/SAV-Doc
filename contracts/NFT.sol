//SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

contract NFT
{
    enum TypeDoc
    {
        Original,
        CopyShared,
        CopyCertified,
        CopyPendingTransfer
    }

    struct Document
    {
       uint256 tokenID;
       uint256 fileSize;
       string filename;
       string fileMimeType;
       uint256 dateAdd;
       string filePath;
       address[] certifying;
       string tokenURI;
       string passwordEncrypted;
       TypeDoc typeNft;
    }  
}
