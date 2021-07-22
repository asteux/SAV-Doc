# Explication des tests

Les tests n'ont pas été réalisés mais voici une partie de liste des tests que l'on a prévue de faire.

## Contrat AccountManager

### Méthode `addUser`

- Vérifier que le `User` a bien ajouté
- Vérifier que les informations de `User` sont correctes
- Vérifier que l'on peut pas créer un `User` avec une adresse qui n'est pas la sienne

### Méthode `addAuthority`

- Vérifier que le `Authority` a bien ajoutée
- Vérifier que les informations de `Authority` sont correctes
- Vérifier que seul l'owner peut ajouter des `Authority`  

### Méthode `getUser`

- Vérifier que la valeur renvoyé est bien la bonne

### Méthode `delUser`

- Vérifier que l'utilisateur a bien été supprimée

### Méthode `isAuthority`

- Vérifier que la valeur renvoyé est bien la bonne

## Contrat SecMyDocToken

### Méthode `addItem`

- Vérifier que l'ajout d'un NFT se fait uniquement via le contract `SecMyDoc`
- Vérifier qu'un nouveau NFT est créé
- Vérifier que le `tokenURI` du token est bien modifié
- Vérifier que l'évènement `Transfer` à bien été envoyé avec les bonnes informations

### Méthode `delItem`

- Vérifier que la suppression d'un NFT se fait uniquement via le contract `SecMyDoc`
- Vérifier que le NFT est bien burn
- Vérifier que l'évènement `Transfer` à bien été envoyé avec les bonnes informations

## Contrat PasswordManager

### Méthode `addEncryptedPasswords`

- Vérifier que la valeur a bien été ajoutée

### Méthode `getEncryptedPassword`

- Vérifier que la valeur renvoyé est bien la bonne

### Méthode `delEncryptedPassword`

- Vérifier que la valeur a bien été supprimée

### Méthode `addPasswordMaster`

- Vérifier que la valeur a bien été modifiée

### Méthode `getPasswordMaster`

- Vérifier que la valeur renvoyé est bien la bonne

## Contrat SecMyDoc

### Méthode `getCountNFT`

- Vérifier que la valeur est bien la bonne

### Méthode `createNFT`

- Vérifier que le NFT a bien été "minté"
- Vérifier que l'auteur de la transaction est bien le propriétaire du NFT "minté"
- Vérifier que les informations du document ont bien été sauvegardé
- Vérifier que le nombre de NFT du propriétaire a bien augmenté de 1
- Vérifier qu'un évènement à bien été envoyé avec les bonnes informations (pour notifier de la suppression du document et NFT)

### Méthode `createNFTCertified`

- Vérifier tout ce qui & été vérifié pour la méthode `createNFT`
- Vérifier que le document a bien été certifier par l'auteur de la transaction

### Méthode `getNFTs`

- Vérifier que les NFTs renvoyés appartiennent bien à l'auteur de la transaction

### Méthode `getNFT`

- Vérifier que le NFT contient les bonnes valeurs

### Méthode `getTokenURI`

- Vérifier que la valeur renvoyé est bien la bonne

### Méthode `deleteNFT`

- Vérifier que le NFT a bien été "burné"
- Vérifier que le NFT qui a été supprimé est le bon
- Vérifier que seul le propriétaire du NFT puisse le supprimer
- Vérifier que le nombre de NFT du propriétaire a bien diminué de 1
- Vérifier qu'un évènement à bien été envoyé avec les bonnes informations (pour notifier de la suppression du document et NFT)

### Méthode `requestCertification`

- Vérifier que l'auteur est bien propriétaire du document
- Vérifier que la requête de certification contient les bonnes informations
- Vérifier qu'un événement qui indique l'auteur, le destinataire et le document concerné par cette demande de certification

### Méthode `getRequests`

- Vérifier que les Requests renvoyés appartiennent bien à l'auteur de la transaction

### Méthode `acceptRequest`

- Vérifier que seul le destinataire de la requête puisse l'accepté
- Vérifier que le document a bien été certifier par le destinataire de la transaction
