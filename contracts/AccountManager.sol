// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SaveDocStruct.sol";

/**
 * @title Account manager for SAV Doc contract
 * @dev All functions are called by the SaveDoc contract
 */
contract AccountManager is Ownable, SaveDocStruct
{
    mapping(address => User) private users;
    mapping(address => string) private passwordMasters;

    /**
     * @dev modifier to check if `_address` is valid (!== address(0))
     * @param _address address of user
     */
    modifier addressIsValid(address _address)
    {
        require(_address != address(0), "AccountManager: Cette addresse n'existe pas !");
        _;
    }

    /**
     * @dev modifier to check if `_address` is not registered
     * @param _address address of user
     */
    modifier userNotExist(address _address)
    {
        require(!users[_address].exist, "AccountManager: Ce compte existe deja !");
        _;
    }

    /**
     * @dev modifier to check if `_address` is registered
     * @param _address address of user
     */
    modifier userExist(address _address)
    {
        require(users[_address].exist, "AccountManager: Ce compte n'existe pas !");
        _;
    }

    /**
     * @dev Set the user's master password
     * @param userAddress address of user
     * @param hashPasswordMaster password master hashed
     */
    function addPasswordMaster(address userAddress, string memory hashPasswordMaster) private addressIsValid(userAddress) userExist(userAddress)
    {
        require(bytes(passwordMasters[userAddress]).length == 0, "PasswordManager: Cette address possede deja un mot de passe maitre");
        passwordMasters[userAddress] = hashPasswordMaster;
    }

    /**
     * @dev Get the user's master password
     * @param addressUser owner of password master
     * @return password master of 'addressUser'
     */
    function getPasswordMaster(address addressUser) external view onlyOwner() returns(string memory)
    {
        require(bytes(passwordMasters[addressUser]).length != 0, "Cette address n'a pas de mot de passe maitre");
        return passwordMasters[addressUser];
    }

    /**
     * @dev Create an user
     * @param userAddress address of user
     * @param name username of 'userAddress'
     * @param pubKey public key of 'userAddress'
     * @param passwordMaster password master of 'userAddress'
     * @return created user
     */
    function addUser(address userAddress, string memory name, string memory pubKey, string memory passwordMaster) external onlyOwner() userNotExist(userAddress) returns(User memory)
    {
        users[userAddress] = User(name, pubKey, false, true);
        addPasswordMaster(userAddress, passwordMaster);
        return users[userAddress];
    }

    /**
     * @dev Create an authority
     * @param authorityAddress address of authority
     * @param name username of 'authorityAddress'
     * @param pubKey public key of 'authorityAddress'
     * @param passwordMaster password master of 'authorityAddress'
     * @return created authority
     */
    function addAuthority(address authorityAddress, string memory name, string memory pubKey, string memory passwordMaster) public onlyOwner() addressIsValid(authorityAddress) userNotExist(authorityAddress) returns(User memory)
    {
        users[authorityAddress] = User(name, pubKey, true, true);
        addPasswordMaster(authorityAddress, passwordMaster);
        return users[authorityAddress];
    }

    /**
     * @dev Get User by address
     * @param userAddress address of user
     * @return user
     */
    function getUser(address userAddress) public view addressIsValid(userAddress) onlyOwner() userExist(userAddress) returns(User memory)
    {
        return users[userAddress];
    }

    /**
     * @dev Set user's informations (name)
     * @param addressUser address of user
     * @param name new username of 'userAddress'
     * @return updated user
     */
    function setUser(address addressUser, string memory name) public onlyOwner() userExist(addressUser) returns(User memory)
    {
        users[addressUser].name = name;
        return users[addressUser];
    }

    /**
     * @dev Delete User by address
     * @param addressUser address of user
     */
    function delUser(address addressUser) public onlyOwner() userExist(addressUser)
    {
        delete passwordMasters[addressUser];
        delete users[addressUser];
    }

    /**
     * @notice check if user is an authority
     * @dev check if user is an authority
     * @param userAddress address of user
     * @return true if user is an authority
     */
    function isAuthority(address userAddress) public view addressIsValid(userAddress) userExist(userAddress) returns(bool)
    {
        return users[userAddress].isAuthority;
    }

    /**
     * @notice check if user exists
     * @dev check if user exists
     * @param userAddress address of user
     * @return true if user exists
     */
    function checkIfUserExist(address userAddress) public view  returns(bool)
    {
        return users[userAddress].exist;
    }
}
