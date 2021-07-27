//SPDX-License-Identifier: MIT

pragma solidity 0.8.6;


contract AccountManager
{
    address private owner;
    mapping(address => User) users;
    mapping(address => string) private passwordMasters;


    constructor()
    {
        owner = msg.sender;
    }

    modifier addressIsValid(address _address)
    {
        require(_address != address(0), "AccountManager: Cette addresse n'existe pas !");
        _;
    }

    modifier onlyOwner()
    {
        require(owner == msg.sender, "AccountManager: Vous n'avez pas les droits !");
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

    struct User
    {
        string name;
        string publicKey;
        bool isAuthority;
        bool exist;
    }

    function addPasswordMaster(address userAddress, string memory hashPasswordMaster) onlyOwner() public
    {
        require(bytes(passwordMasters[userAddress]).length == 0, "PasswordManager: Cette address possede deja un mot de passe maitre");
        passwordMasters[owner] = hashPasswordMaster;
    }

    function getPasswordMaster(address userAddress) public view onlyOwner() returns(string memory)
    {
        require(bytes(passwordMasters[userAddress]).length != 0, "Cette address n'a pas de mot de passe maitre");
        return passwordMasters[userAddress];
    }

    function addUser(address userAddress, string memory name, string memory pubKey, string memory passwordMaster) public onlyOwner() addressIsValid(userAddress) userNotExist(userAddress) returns(User memory)
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

    function getUser(address userAddress) public view addressIsValid(userAddress) userExist(userAddress) returns(User memory)
    {
        return users[userAddress];
    }

    function setUser(address userAddress, string memory name) public onlyOwner() returns(User memory)
    {
        users[userAddress].name = name;
        return users[userAddress];
    }

    function delUser(address userAddress) public onlyOwner() addressIsValid(userAddress) userExist(userAddress)
    {
        delete passwordMasters[userAddress];
        delete users[userAddress];
    }

    function isAuthority(address userAddress) public view returns(bool)
    {
        return users[userAddress].isAuthority;
    }

    function checkIfUserExist(address userAddress) public view onlyOwner() returns(bool)
    {
        return users[userAddress].exist;
    }
}
