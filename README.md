# SAV-Doc

## Présentation

SAV-doc est un projet blockchain qui permet de sécuriser, partager et sécuriser des documents avec des NFTs.

## Status

- [] Sécuriser un document
  - [] Développement du contact ERC721
  - [] Développement de l'interface pour sécuriser un document
    - [x] Chiffrement du document
    - [x] Upload du document via IPFS
    - [] Intéraction avec les contrats (création du NFT)
- [] Partager un document
- [] Certifier un document

## Technologies

Ce projet utilise les technologies suivantes

- Truffle (avec trubble unbox react)
- Solidity 0.8
- Stockage IPFS via [NFT.Storage](https://nft.storage/)
- [Infura](https://infura.io/) pour le déploiement des contrats

### Smarts Contracts

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
