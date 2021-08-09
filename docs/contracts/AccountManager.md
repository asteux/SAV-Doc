## `AccountManager`



All functions are called by the SaveDoc contract

### `addressIsValid(address _address)`



modifier to check if `_address` is valid (!== address(0))


### `userNotExist(address _address)`



modifier to check if `_address` is not registered


### `userExist(address _address)`



modifier to check if `_address` is registered



### `getPasswordMaster(address addressUser) → string` (external)



Get the user's master password


### `addUser(address userAddress, string name, string pubKey, string passwordMaster) → struct SaveDocStruct.User` (external)



Create an user


### `addAuthority(address authorityAddress, string name, string pubKey, string passwordMaster) → struct SaveDocStruct.User` (public)



Create an authority


### `getUser(address userAddress) → struct SaveDocStruct.User` (public)



Get User by address


### `setUser(address addressUser, string name) → struct SaveDocStruct.User` (public)



Set user's informations (name)


### `delUser(address addressUser)` (public)



Delete User by address


### `isAuthority(address userAddress) → bool` (public)

check if user is an authority


check if user is an authority


### `checkIfUserExist(address userAddress) → bool` (public)

check if user exists


check if user exists



