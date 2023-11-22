# Balances and Allowances

This lib is responsible for fetching balances and allowances for all tokens in the app.

The most of the lib logic is concentrated in the `BalancesAndAllowancesUpdater`.  
The updater depends on two main libraries `@cowprotocol/tokens` and `@cowprotocol/multicall`.  
From tokens lib it gets the list of tokens using `useAllTokens()` hook and does multicall for them using `multicall` lib and just stores results into jotai stores.

## Usage

### Get balances
```ts
import { useTokensBalances } from '@cowprotocol/balances-and-allowances'

const { values: balances, isLoading } = useTokensBalances()
```

Using this hook you even can get balance of the native token, you don't need to use another hook.


### Get allowances
```ts
import { useTokensAllowances } from '@cowprotocol/balances-and-allowances'

const { values: allowances, isLoading } = useTokensAllowances()
```
