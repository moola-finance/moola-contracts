# Moola Finance Contracts

## Mainnet 
$MOOLA - [0x6510f4477CD695AeB191092793309adE51e0D14D](https://bscscan.com/address/0x6510f4477CD695AeB191092793309adE51e0D14D#code)

## Testnet 
$MOOLA - [0x769173eDb5572c0f4E77A3a6f5CE20784F986bba](https://testnet.bscscan.com/address/0x769173eDb5572c0f4E77A3a6f5CE20784F986bba)

$pMOOLA - [0xab6C85aBF7Ec7264E633448eeDAfa963210fe822](https://testnet.bscscan.com/address/0xab6C85aBF7Ec7264E633448eeDAfa963210fe822)

# Deployment

```shell
npx hardhat run scripts/deploy.ts --network testnet
```

# Contract verification

```shell
npx hardhat verify --network testnet 0x769173eDb5572c0f4E77A3a6f5CE20784F986bba --libraries libraries.ts
```

# Performance optimizations

For faster runs of your tests and scripts, consider skipping ts-node's type checking by setting the environment variable `TS_NODE_TRANSPILE_ONLY` to `1` in hardhat's environment. For more details see [the documentation](https://hardhat.org/guides/typescript.html#performance-optimizations).
