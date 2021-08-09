# Sécurité

La plus part des failles de sécurité commun aux Dapps ne sont pas applicable à notre application car nous n'utilisons pas de transfert d'ether.

## Reetrancy

- Nous somme protégés par défaut contre cette vulnérabilité car nous ne utilisons faisons pas de transfert d'ether.

## Arithmetic Over/Under Flows

- Nous somme protégés contre cette vulnérabilité car nous n'effectuons pas de calcul arithmétique.

## Default Visibilities

- Nous avons spécifié la visibilité de toutes les fonctions dans les contracts pour ce protéger contre la vulnérabilité `Default Visibilities`

Exemple:

```sol
function addPasswordMaster(address userAddress, string memory hashPasswordMaster) private addressIsValid(userAddress) userExist(userAddress)
```

## Autre

- Restriction des accès en utilisant la librairie `Ownable` ou des modifiers comme `isMyToken`

Exemple :

```sol
modifier isMyToken(uint256 tokenID) {
  require(token.ownerOf(tokenID) == msg.sender, "Cet NFT ne vous appartient pas !");
  _;
}
```

- Protection contre les fraudes des documents officiels via une vérification des hashs

Exemple :

```sol
require(!isOfficielDoc(hashNFT), "DocManager: Ce document correspond a un NFT officiel.");
```

- Chiffrement du mot de passe maître avec la clée public du propriétaire

Exemple :

```js
const encryptedPasswordMaster = encryptWithPublicKey(SHA256(passwordMaster).toString(), publicKey);
```

- Chiffrement des mots de passe des documents

Exemple :

```js
const encryptedPasswordFile = encryptWithPublicKey(encryptWithPassword(password, passwordMaster), encryptionPublicKey);
```

- Chiffrement des documents uploader

Exemple :

```js
// utils/file.js
const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target.result);
    };

    reader.onerror = (event) => {
      reject(event.target.error);
    };

    reader.onabort = (event) => {
      reject('abort');
    };

    reader.readAsDataURL(file);
  });
};

// utils/encryption.js
const encryptWithPassword = (data, password) => {
  return AES.encrypt(data, password).toString();
};

// features/secureFile/secureFileSlice.js
const fileAsDataUrl = await readFileAsDataURL(file);
const encryptedFile = encryptWithPassword(fileAsDataUrl, password);
```
