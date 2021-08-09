## `SaveDoc`

Contract used to secure, transfer, share and certify document


Main contract of SAV Doc

### `isMyToken(uint256 tokenID)`



modifier to check if token is owned by sender


### `userExist(address addressUser)`



modifier to check if user exists


### `requestExist(address _certifying, uint256 _tokenID)`



modifier to check if `_certifying` already receive a certification request


### `requestNotExist(address _certifying, uint256 _tokenID)`



modifier to check if `_certifying` not already receive a certification request



### `constructor(contract DocManager _docManager, contract SaveDocToken _saveDocToken, contract AccountManager _accountManager)` (public)



Create new Sav Doc contract


### `subscribe(string name, string pubKey, string passwordMaster)` (external)

Subscribe to SAV Doc as user


Create new user (emits a Subscribe event)


### `subscribeAuthority(address authority, string name, string pubKey, string passwordMaster)` (external)



Create new authority (emits a SubscribeAuthority event)


### `viewMyProfil() → struct SaveDocStruct.User` (external)

View my informations


Get sender user informations


### `viewProfil(address _address) → struct SaveDocStruct.User` (external)

View informations of user by address


Get informations of user


### `getMyPasswordMaster() → string` (external)

Get my password master


Get password master of sender


### `changeMyName(string name)` (external)

Set my name


Set user name of sender (emits a ChangeUsername event)


### `unsubscribe()` (external)

Delete my account


Remove account of sender (emits a Unsubcribe event)

### `secureDocument(string tokenName, string tokenURI, string tokenMime, uint256 tokenLength, string filePath, string passwordEncrypted, string hashNFT) → struct SaveDocStruct.Document` (external)

Secure a document


Secure a document (emits a SecureDocument event)


### `delMyDocument(uint256 tokenID, bool forTransfer)` (external)

Delete a secured document by tokenID


Delete a secured document of sender by tokenID (emits a DeleteDocumment event)


### `getTokenURI(uint256 tokenID) → string` (external)

Get token URI of document


Get token URI of document


### `transferDoc(address to, uint256 tokenID, string tokenURITmp)` (external)

Transfer my secured document


Transfer a secured document (emits a TransferDocument event)


### `shareDoc(uint256 tokenID, address to, string tokenURI)` (external)

Share my secured document


Share a secured document (emits a ShareDoc event)


### `acceptNewDoc(uint256 tokenID, string newTokenURI, string passwordEncrypted)` (external)

Accept a transfered document


Accept a transfered document (emits a AcceptTransferDoc event)


### `delCopyDocShared(uint256 tokenID)` (external)

Delete a shared document


Delete a shared document (emits a DeleteMyDocCopy event)


### `requestCertification(uint256 _tokenID, string _tokenURI, address _certifying)` (external)

Send nex certification request


Send nex certification request (emits a RequestCertification event)


### `viewMyDocs() → struct SaveDocStruct.Document[]` (external)

View all my secured documents


get all secured document of sender


### `viewMyCopyDocs() → struct SaveDocStruct.Document[]` (external)

View all my shared documents


get all shared document of sender


### `viewDocPendingTransfer() → struct SaveDocStruct.Document[]` (external)

View all my documents being transferred


get all documents being transferred of sender


### `viewDocCertified() → struct SaveDocStruct.Document[]` (external)

View all my certified documents


get all certified document of sender


### `viewCertificationRequest(uint256 _tokenID) → struct SaveDocStruct.CertificationRequest` (external)

View one of all certification requests of document


Get certification request of document by token ID


### `acceptCertificationRequest(uint256 _tokenID, string _hashNFT, bool _keepCopyDoc)` (public)

Accept a certification request


Accept a certification request (emits a AcceptCertificationRequest event)


### `rejectCertificationRequest(uint256 _tokenID)` (external)

Reject a certification request


Reject a certification request (emits a RejectCertificationRequest event)


### `tokenExist(uint256 tokenID) → bool` (public)

Check if token exist


Check if token exist



### `Subscribe(address newUser, string name, string pubkey)`





### `SubscribeAuthority(address newUser, string pubkey)`





### `ChangeUsername(address user, string newUsername)`





### `Unsubcribe(address user)`





### `SecureDocument(address user, uint256 tokenID)`





### `DeleteDocumment(address ownerDoc, uint256 tokenID, bool forTransfer)`





### `TransferDocument(address from, address to, uint256 tokenID)`





### `ShareDoc(address from, address to, uint256 tokenID)`





### `AcceptTransferDoc(address newOwner, uint256 tokenID)`





### `DeleteMyDocCopy(address ownerDoc, uint256 tokenID)`





### `RequestCertification(address applicant, uint256 tokenID)`





### `AcceptCertificationRequest(address certifying, address applicant, uint256 tokenID, bool keepCopy)`





### `RejectCertificationRequest(address certifying, address applicant, uint256 tokenID)`





