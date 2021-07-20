//SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";
 
contract PasswordManager
{
    mapping(address => mapping(uint256 => string)) private encryptedPasswords;
    
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
}
