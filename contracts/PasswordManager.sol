//SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

contract PasswordManager
{
    mapping(address => mapping(uint256 => string)) private encryptedPasswords;
    mapping(address => string) passwordMasters;

    function addEncryptedPasswords(uint256 tokenID, string memory encryptedPassword) public returns(bool)
    {
        require(tokenID != 0, "Ce token n'existe pas !");
        encryptedPasswords[msg.sender][tokenID] = encryptedPassword;
        return true;
    }

    function getEncryptedPassword(uint256 tokenID) public view returns(string memory)
    {
        return encryptedPasswords[msg.sender][tokenID];
    }

    function delEncryptedPassword(uint256 tokenID) public returns(bool)
    {
        delete encryptedPasswords[msg.sender][tokenID];
        return true;
    }

    function addPasswordMaster(string memory hashPasswordMaster) public returns(bool)
    {
        passwordMasters[msg.sender] = hashPasswordMaster;
        return true;
    }

    function getPasswordMaster() public view returns(string memory)
    {
        return passwordMasters[msg.sender];
    }

    function transfertPassword(address to, uint256 tokenID) internal returns(bool)
    {
        encryptedPasswords[to][tokenID] = encryptedPasswords[msg.sender][tokenID];
        delEncryptedPassword(tokenID);

        return true;
    }
}
