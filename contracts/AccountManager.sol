//SPDX-License-Identifier: MIT

pragma solidity 0.8.6;


contract AccountManager
{
    address private owner;
    mapping(address => User) private users;
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

    function addPasswordMaster(address userAddress, string memory hashPasswordMaster) private addressIsValid(userAddress) userExist(userAddress)
    {
        require(bytes(passwordMasters[userAddress]).length == 0, "PasswordManager: Cette address possede deja un mot de passe maitre");
        passwordMasters[userAddress] = hashPasswordMaster;
    }

    function getPasswordMaster(address userAddress) public view returns(string memory)
    {
        require(bytes(passwordMasters[msg.sender]).length != 0, "Cette address n'a pas de mot de passe maitre");
        return passwordMasters[userAddress];
    }

    function addUser(string memory name, string memory pubKey, string memory passwordMaster) public userNotExist(msg.sender) returns(User memory)
    {
        users[msg.sender] = User(name, pubKey, false, true);
        addPasswordMaster(msg.sender, passwordMaster);
        return users[msg.sender];
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

    function setUser(string memory name) public returns(User memory)
    {
        users[msg.sender].name = name;
        return users[msg.sender];
    }

    function delUser() public userExist(msg.sender)
    {

        delete passwordMasters[msg.sender];
        delete users[msg.sender];
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
