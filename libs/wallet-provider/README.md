# CoW Swap Wallet provider

At the first glance, this lib should be a part of `@cowprtocol/wallet`, but it is separated to avoid circular dependencies.  
For example, `BlockNumberProvider` in `@cowprotocol/common-hooks` uses `useWalletProvider` and obviously the lib should not depend on `@cowprotocol/wallet`.  
In the uniswap-fork era we didn't have this issue, because the wallet provider we used `import { useWeb3React } from '@web3-react/core'` instead.  

## Quick start

```
npm install @cowprotocol/wallet-provider --save
```

```
yarn add @cowprotocol/wallet-provider
```

## Developers

#### Test

```
nx test wallet-provider
```

#### Build the library

```
nx build wallet-provider
```
