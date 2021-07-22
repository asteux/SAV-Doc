//SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AccountManager is Ownable
{
    mapping(address => User) users;

    modifier checkAddressValid(address _address)
    {
        require(_address != address(0), "Cette addresse n'existe pas !");
        _;
    }

    modifier onlyAuthority(address _address)
    {
        User memory user = getUser(_address);
        require(user.isAuthority, "Vous n'avez pas le droit d'utiliser cette fonction");
        _;

    }

    modifier userExist(address _address)
    {
        User memory user = users[_address];
        require(user.exist, "Ce compte n'existe pas !");
        _;
    }

    struct User
    {
        string name;
        string publicKey;
        bool isAuthority;
        bool exist;
    }


    function addUser(address _address, string memory name, string memory pubKey) public checkAddressValid(_address) returns(User memory)
    {
        require(_address != address(0), "Cette addresse n'existe pas !");
        User memory user = User(name, pubKey, false, true);

        users[_address] = user;
        return user;
    }

    function addAuthority(address _address, string memory name, string memory pubKey) public onlyOwner() checkAddressValid(_address) returns(User memory)
    {
        User memory user = User(name, pubKey, true, true);

        users[_address] = user;
        return user;
    }

    function getUser(address _address) public view returns(User memory)
    {
        return users[_address];
    }

    function delUser(address _address) public onlyOwner() checkAddressValid(_address) returns(bool)
    {
        delete users[_address];
        return true;
    }

    function isAuthority(address _address) view public returns(bool)
    {
        return users[_address].isAuthority;
    }
}
