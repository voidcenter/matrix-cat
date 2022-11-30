# Matrix Cat 

This is a fun NFT project for the Matrix team @CertiK. It starts with 100 AI-generated cat avatars:

![NFT token images](res/all.png "")

## Usage

Create a .env file:

```
ALCHEMY_GOERLI_KEY=...
ALCHEMY_MAINNET_KEY=...
ACCOUNT_PRIVATE_KEY=...
ETHERSCAN_KEY=...
```

Then: 

```
nvm use 16.18.0
npm i
npx hardhat compile
npx hardhat test
npx hardhat run --network goerli scripts/deploy.ts
npx hardhat verify <contract-address> --network goerli
npx hardhat run --network mainnet scripts/deploy.ts
npx hardhat verify <contract-address> --network mainnet
```

## Utility

This NFT contract has some features built in to allow for utilitues like auth. It uses a "soft soul bound" approach where the NFTs can be transferred and sold but the utility is valid only when they are owned by certain predefined addresses. The owner and the admin can update such info. 

More on this later.
