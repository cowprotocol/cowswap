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

// Using the a static account defined in the library
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
  eip2162Utils,
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

## Building

Run `nx build permit-utils` to build the library.

## Running unit tests

Run `nx test permit-utils` to execute the unit tests via [Jest](https://jestjs.io).
