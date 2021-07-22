# design_pattern_desicions

## Sécurité

### Contrat `Ownable` d'OpenZeppelin

On utilise le contrat [Ownable](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol) de la libraire `OpenZeppelin`.

Cela nous permet de restreindre facilement les fonctions pour qu'elles soient uniquement accessible à l'owner du contrat.

### Modifiers

Pour gérer les accès, on utilise aussi des modifiers (par exemple, le modifier `onlyOwner` du contrat `Ownable`).

Exemple d'un autre modifier utilisé (dans le contrat `SecMyDoc`) :

```sol
modifier isMyToken(uint256 tokenID)
{
  require(token.ownerOf(tokenID) == msg.sender, "Cet NFT ne vous appartient pas !");
  _;
}
```

### Checks Effects Interactions

Dans le contrat `SecMyDoc`, nous avons des appels vers le contrat `SecMyDocToken`. Le design-pattern `Checks Effects Interactions` préconise de mettre les appels externes en fin de fonction. Cela n'a pas été fait mais cela sera corrigé.

## Autres

### Vérification des paramètres des fonctions

On utilise le mot clè `require` pour vérifier certain paramètre de fonctions.

Par exemple :

```sol
require(_address != address(0), "Cette addresse n'existe pas !");
```
