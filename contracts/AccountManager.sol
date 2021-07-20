//SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

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
    
    struct User
    {
        string name;
        bool isAuthority;
    }
    
    function addUser(address _address, string memory name) public checkAddressValid(_address) returns(User memory)
    {
        require(_address != address(0), "Cette addresse n'existe pas !");
        User memory user = User(name, false);
        
        users[_address] = user;
        return user;
    }
    
    function addAuthority(address _address, string memory name) public onlyOwner() checkAddressValid(_address) returns(User memory)
    {
        User memory user = User(name, true);
        
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
