# SAV-Doc

## Présentation

SAV-doc est un projet blockchain qui permet de sécuriser, partager et certifier des documents avec des NFTs.

## Status

- [x] Sécuriser un document
- [x] Consulter un document
- [x] Partager un document
- [x] Certifier un document
- [x] Transférer un document

## Technologies

Ce projet utilise les technologies suivantes

- Truffle (avec Truffle unbox react)
- Solidity 0.8
- Stockage IPFS via [NFT.Storage](https://nft.storage/)
- [Infura](https://infura.io/) pour le déploiement des contrats

### Smarts Contracts

- AccountManager : permet de gérer les comptes utilisateurs
- DocManager : permet de gérer les documents
- SaveDoc : est le contrat principal, permet de gérer les documents
- SaveDocToken : permet de gérer les NFT

### DApp

- [Redux](https://react-redux.js.org/)
- [Crypto-JS](https://github.com/brix/crypto-js)
- [Bootstrap](https://react-bootstrap.github.io/)
- [Material UI](https://material-ui.com/)

## Installation

Il faut commencer par cloner le projet :

```bash
git clone https://github.com/asteux/SAV-Doc
```

Il faut ensuite installer les dépendences (dans les dossier `\` et `\client`) :

```bash
yarn install
```

Il faut aussi définir les variables d'environnement

```env
# .env
INFURA_PROJECT_ID=
MNEMONIC_PHRASE=

# ./client/.env
REACT_APP_NFT_STORAGE_API_KEY=
```

Une fois que les variables d'environnement ont été définis, on peut déployer les contracts

```bash
truffle migrate
```

Et démarrer le client

```bash
# /client
yarn start
```

## Documentation

Pour mettre à jour la documentation, exécuter la commande suivante

```bash
# ./
yarn doc
```

## Déploiement

### Déploiement des Smarts Contracts

Pour le déploiement du contrat, il faut migrer vers le réseau de votre choix (pour le moment, seul Ropsten et Rinkeby sont configurés)

```bash
truffle migrate --network ropsten
```

### Déploiement du la DApp

Pour le client, le déploiement se fait avec [Heroku](https://www.heroku.com/))

Il faut exécuter les commandes suivantes

```bash
heroku login
heroku create --buildpack mars/create-react-app
git subtree push --prefix client/ heroku main
```

Pour une mise à jour, il suffit de ré-exécuter la dernière commande.
