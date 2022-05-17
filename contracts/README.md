# CazzPay Contracts

## Contracts
- [TestCoin ($TST)](https://rinkeby.etherscan.io/address/0x6A308Fb8391Cecd7bb9570840239956f25C101F9) - **0x6A308Fb8391Cecd7bb9570840239956f25C101F9**
- [CazzPayToken ($CZP)](https://rinkeby.etherscan.io/address/0x8d7b5E919620D2C9742389bc1CeC671eaB0E3150) - **0x8d7b5E919620D2C9742389bc1CeC671eaB0E3150**
- [CazzPay](https://rinkeby.etherscan.io/address/0xd057D5A7Bc5403436AAB3CeEBfE72E5d781577Dc) - **0xd057D5A7Bc5403436AAB3CeEBfE72E5d781577Dc**

## Installing dependencies

```bash
pnpm install
```

## Running scripts (from `package.json`)

```bash
yarn NAME_OF_SCRIPT
```

## Running scripts

```bash
npx hardhat run PATH/TO/SCRIPT --network NETWORK
```

## Testing

```bash
npx hardhat test ./test/NAME_OF_FILE
```

## Environment variables

```env
INFURA_PROJECT_ID # From infura project
PRIVATE_KEY # To use for deploying contracts
ETHERSCAN_API_KEY # To verify contracts
```