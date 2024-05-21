# CoW Swap Wallet provider

The library contains only two hooks:
 - `useWalletChainId()` returns actual wallet chainId. In 99% cases we use chainId from `useWalletInfo()` which returns always valid and supported chainId, but in some cases we need a real chainId from the wallet.
 - `useWalletProvider()` returns ethers `Web3Provider`.

Those hooks are actually wrappers around `useWeb3React()` from `@web3-react/core`.  
Once we decide to use other library, we can easily replace it.  

## Developers

#### Test

```
nx test wallet-provider
```

#### Build the library

```
nx build wallet-provider
```
