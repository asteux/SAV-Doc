// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

/**
 * @title Structs used by SAV Doc contracts
 */
contract SaveDocStruct
{
    /**
     * @dev Different types of document
     */
    enum TypeDoc
    {
        Original,
        CopyShared,
        CopyCertified,
        CopyPendingTransfer
    }

    /**
     * @dev Document struct
     */
    struct Document
    {
       uint256 tokenID; // ID of token
       uint256 fileSize; // size of document
       string filename; // name of document
       string fileMimeType; // mime type of document
       uint256 dateAdd; // date the document was added
       string filePath; // folder of document
       address[] certifying; // list of certifying
       string tokenURI; // URI document
       string passwordEncrypted; // encrypted password of document
       TypeDoc typeNft; // type of document (see TypeDoc struct)
    }

    /**
     * @dev Certification request struct
     */
    struct CertificationRequest
    {
        address applicant;
        uint256 tokenID;
        bool exist;
    }

    /**
     * @dev User struct
     */
    struct User
    {
        string name; // username
        string publicKey; // public key
        bool isAuthority; // true if user is an authority
        bool exist; // true if user is registered
    }
}
