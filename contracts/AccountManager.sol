//SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SaveDocStruct.sol";

contract AccountManager is Ownable, SaveDocStruct
{
    mapping(address => User) private users;
    mapping(address => string) private passwordMasters;

    modifier addressIsValid(address _address)
    {
        require(_address != address(0), "AccountManager: Cette addresse n'existe pas !");
        _;
    }

    modifier userNotExist(address _address)
    {
        require(!users[_address].exist, "AccountManager: Ce compte existe deja !");
        _;
    }

    modifier userExist(address _address)
    {
        require(users[_address].exist, "AccountManager: Ce compte n'existe pas !");
        _;
    }


    function addPasswordMaster(address userAddress, string memory hashPasswordMaster) private addressIsValid(userAddress) userExist(userAddress)
    {
        require(bytes(passwordMasters[userAddress]).length == 0, "PasswordManager: Cette address possede deja un mot de passe maitre");
        passwordMasters[userAddress] = hashPasswordMaster;
    }

    function getPasswordMaster(address addressUser) external view onlyOwner() returns(string memory)
    {
        require(bytes(passwordMasters[addressUser]).length != 0, "Cette address n'a pas de mot de passe maitre");
        return passwordMasters[addressUser];
    }

    function addUser(address userAddress, string memory name, string memory pubKey, string memory passwordMaster) external onlyOwner() userNotExist(userAddress) returns(User memory)
    {
        users[userAddress] = User(name, pubKey, false, true);
        addPasswordMaster(userAddress, passwordMaster);
        return users[userAddress];
    }

    function addAuthority(string memory passwordMaster, address authorityAddress, string memory name, string memory pubKey) public onlyOwner() addressIsValid(authorityAddress) userNotExist(authorityAddress) returns(User memory)
    {
        users[authorityAddress] = User(name, pubKey, true, true);
        addPasswordMaster(authorityAddress, passwordMaster);
        return users[authorityAddress];
    }

    function getUser(address userAddress) public view addressIsValid(userAddress) onlyOwner() userExist(userAddress) returns(User memory)
    {
        return users[userAddress];
    }

    function setUser(address addressUser, string memory name) public onlyOwner() userExist(addressUser) returns(User memory)
    {
        users[addressUser].name = name;
        return users[addressUser];
    }

    function delUser(address addressUser) public onlyOwner() userExist(addressUser)
    {
        delete passwordMasters[addressUser];
        delete users[addressUser];
    }

    function isAuthority(address userAddress) public view addressIsValid(userAddress) userExist(userAddress) returns(bool)
    {
        return users[userAddress].isAuthority;
    }

    function checkIfUserExist(address userAddress) public view  returns(bool)
    {
        return users[userAddress].exist;
    }
}
