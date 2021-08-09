## `DocManager`



All functions are called by the SaveDoc contract

### `addressesAreDifferent(address from, address to)`



modifier to check if `from` and `to` are different



### `getIndexNFT(address ownerNFT, enum SaveDocStruct.TypeDoc typeNft, uint256 tokenID) → int256` (public)



Get index of document according to owner, type and tokenID


### `createDoc(address ownerNFT, uint256 tokenID, string tokenName, string tokenMime, uint256 tokenLength, string filePath, string passwordEncrypted, string hashNFT) → struct SaveDocStruct.Document` (external)



Create new document


### `getDocs(address addressUser) → struct SaveDocStruct.Document[]` (external)



Get secured documents


### `deleteDoc(address ownerDoc, uint256 tokenID) → bool` (external)



Delete secured document


### `deleteAllDocs(address addressUser)` (external)



Delete all secured documents


### `createCopyDoc(address provider, address ownerCopyNFT, uint256 tokenID, string tokenURI, enum SaveDocStruct.TypeDoc typeNft)` (external)



Copy Document


### `getAllCopyShared(address addressUser) → struct SaveDocStruct.Document[]` (public)



Get all copies of secured documents


### `getAllCopyPendingTransfer(address addressUser) → struct SaveDocStruct.Document[]` (public)



Get all secured documents in pending transfer state


### `getAllCopyCertified(address addressUser) → struct SaveDocStruct.Document[]` (public)



Get all certified secured documents


### `convertTypeDoc(address ownerCopyNFT, enum SaveDocStruct.TypeDoc typeDocSc, enum SaveDocStruct.TypeDoc typeDocDst, uint256 tokenID, string passwordEncrypted)` (external)



Change type of document (create a copy and delete the old one)


### `delCopyDoc(address ownerNFT, enum SaveDocStruct.TypeDoc typeNft, uint256 index)` (public)



Delete copy of secured document according owner, type and index


### `delAllCopyDoc(address ownerNFT)` (external)



Delete all copy, certified and pending transfered documents


### `certify(address certifying, bool isAuthority, address applicant, uint256 tokenID, string hashNFT)` (external)



Certify a document



