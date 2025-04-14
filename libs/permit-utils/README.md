# @cowprotocol/permit-utils

Collection of utils for handling token permits.

## Installation

```bash
yarn add @cowprotocol/permit-utils
```

## Usage

### `getTokenPermitInfo`

```typescript
import { getTokenPermitInfo } from "@cowprotocol/permit-utils"

const permitInfo = await getTokenPermitInfo({
  spender, tokenAddress, tokenName, chainId, provider
})
```

### `getPermitUtilsInstance`

```typescript
import { getPermitUtilsInstance } from "@cowprotocol/permit-utils"

// Using a static account defined in the library
const staticEip2612PermitUtils = getPermitUtilsInstance(chainId, provider)

// Using a provided account address
const accountEip2612PermitUtils = getPermitUtilsInstance(chainId, provider, account)
```

### `generatePermitHook`

```typescript
import { generatePermitHook } from "@cowprotocol/permit-utils"

const hookData = await generatePermitHook({
  chainId,
  inputToken,
  spender,
  provider,
  permitInfo,
  eip2612Utils,
  account,
  nonce
})
```

### `checkIsCallDataAValidPermit`

```typescript
import { checkIsCallDataAValidPermit } from "@cowprotocol/permit-utils"

const isCallDataAValidPermit = await checkIsCallDataAValidPermit(
  account,
  chainId,
  eip2612Utils,
  tokenAddress,
  tokenName,
  callData,
  permitInfo
)
```

**Full flow example**

To illustrate, we'll show the flow of placing an order with a permit hook using the utils in this lib. 

1. Check whether a given token is permittable
2. If it is, generate a permit hook
3. Add permit hook to order's appData
4. Periodically check whether the permit is still valid

```typescript
import { checkIsCallDataAValidPermit, generatePermitHook, getPermitUtilsInstance, getTokenPermitInfo } from '@cowprotocol/permit-utils'
import { stringifyDeterministic } from '@cowprotocol/app-data'
import { OrderBookApi } from '@cowprotocol/cow-sdk'


// Check whether token is permittable.
// No account info is necessary.
// `spender` could in theory be any address
// `tokenName` must always match the contract
const permitInfo = await getTokenPermitInfo({
  spender, tokenAddress, tokenName, chainId, provider
})

// Not able to tell or not permittable
if (!permitInfo) {
  return
}

// Pass in an account address as we'll need the user to sign the actual permit
const eip2612Utils = getPermitUtilsInstance(chainId, provider, account)

// Need to know what the current permit nonce is
const nonce = await eip2612Utils.getTokenNonce(inputToken.address, account)

// Calling this fn should trigger the signature in the user's wallet
const hookData = await generatePermitHook({
  chainId,
  inputToken,
  spender, // Now `spender` must be the real one
  provider,
  permitInfo,
  eip2612Utils,
  account, // `account` should also be the user's
  nonce
})

// Add the hookData to the order's appData
// See the full reference on https://github.com/cowprotocol/app-data/
const appData = { version: '0.10.0', metadata: { hooks: { pre: [hookData] } } }

// The order expects the stringified JSON doc
const fullAppData = await stringifyDeterministic(appData)

// Build cow-sdk orderBookApi instance
const orderBookApi = new OrderBookApi()

// Note: price quoting is a required step before placing the order but has been left out of this example for brevity

// Place order
const orderId = await orderBookApi.sendOrder(
  {
    ...orderParameters,
    quoteId, // Must be fetched before hand, and also include the appData in the params
    appData: fullAppData // <-- The order will be placed with the permit info
  },
  { chainId }
)

// Now we check whether the permit included in the order is still valid
// It'll become invalid when another permit is executed
// This check does not consider whether the `address` has enough allowance, it purelly checks the permit validity.

// CallData is part of the hookData
const callData = hookData.callData

// All properties must match what was used when the hookData was generated
const isCallDataAValidPermit = await checkIsCallDataAValidPermit(
  account,
  chainId,
  eip2612Utils,
  tokenAddress,
  tokenName,
  callData,
  permitInfo
)
```
