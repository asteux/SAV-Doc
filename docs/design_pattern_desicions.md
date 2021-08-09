# design_pattern_desicions

## Access Restriction

On utilise le contrat [Ownable](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol) de la libraire `OpenZeppelin`.

Cela nous permet de restreindre facilement les fonctions pour qu'elles soient uniquement accessible à l'owner du contrat.

### Modifiers

Pour gérer les accès, on utilise aussi des modifiers (par exemple, le modifier `onlyOwner` du contrat `Ownable`).

Exemple d'un autre modifier utilisé (dans le contrat `SaveDoc`) :

```sol
modifier isMyToken(uint256 tokenID)
{
  require(token.ownerOf(tokenID) == msg.sender, "Cet NFT ne vous appartient pas !");
  _;
}
```

## Guard Check

On utilise le mot clè `require` pour vérifier certain paramètre de fonctions.

Par exemple :

```sol
require(_address != address(0), "Cette addresse n'existe pas !");
```
```sol
require(getIndexNFT(ownerCopyNFT, typeNft, tokenID) == -1, "DocManager: Le destinaire a deja une copie du document");
```
