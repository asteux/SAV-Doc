# Explication des tests

Les tests on principalement été réalisés avec le smart contract SaveDoc car il regroupe les fonctions principales du Dapp.

## Contrat SaveDoc

### Méthode `Subscribe`

- Vérifie que le `User` a bien ajouté
- Vérifier que les informations de `User` sont correctes

### Méthode `ChangeMyName`

- Vérifie que le `User` a bien un nouveau `name`


### Méthode `SecureDocument`

- Vérifie que le `Document` a bien été enregistré
- Vérifie que les informations du `Document` sont correctes


### Méthode `TransferDoc`

- Vérifie que le nouveau propriétaire du `TokenID` est bien le destinataire
- Vérifie que l'ancien propriétaire n'a plus accès au `Document`
- Vérifie que le destinataire à bien le `Document` en attente de validation du transfer

### Méthode `AcceptNewDoc`

- Vérifie que le `Document` n'est plus en attente de validation
- Vérifie que le destinataire a bien reçu le `Document`
- Vérifie que les informations du `Document` sont correctes

### Méthode `ShareDoc`

- Vérifie que le destinataire a bien reçu une copie du `Document`
- Vérifie que les informations de la copie du `Document` sont correctes

### Méthode `DeleteDocShared`

- Vérifie que la copie du `Document` n'existe plus

### Méthode `RequestCertification`

- Vérifie que le destinataire à bien reçu une `RequestCertification`
- Vérifie que les informations du `Document` à certifié sont correctes

### Méthode `AcceptCertificationRequest`

- Vérifie que la demande de certification a bien été supprimée après avoir été accepté la `RequestCertification`
- Vérifie que le `Document` a bien été certifié

### Méthode `RejectCertificationRequest`

- Vérifie que la demande de certification a bien été supprimée après avoir été refusé la `RequestCertification`

### Méthode `DeleteDocument`

- Vérifie que le `Document` n'existe plus
- Vérifie que le `TokenID` à bien été burn


### Méthode `Unsubscribe`

- Vérifie que le `User` n'existe plus
