//SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

contract NFT
{
    enum TypeNFT
    {
        Original,
        Copy,
        CopyCertification,
        CopyTransfer
    }

    struct Nft
    {
       uint256 tokenID;
       uint256 tokenLength;
       string tokenName;
       string tokenMime;
       uint256 dateAdd;
       string filePath;
       address[] certifying;
       string tokenURI;
       string passwordEncrypted;
       TypeNFT typeNft;
       bool isCertified;
    }
}
