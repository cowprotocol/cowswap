import { BuyTokenDestination, SellTokenSource } from '@cowprotocol/cow-sdk'

import type { TypedDataField } from './authWrapper.types'

/**
 * EIP-712 domain of every `CowAuthWrapper`. Hardcoded in
 * `CowAuthLibrary.computeDomainSeparator`, which hashes
 * `keccak256("CowAuthWrapper")` and `keccak256("1")` with the chain id and the
 * wrapper address.
 */
export const AUTH_WRAPPER_DOMAIN_NAME = 'CowAuthWrapper'
export const AUTH_WRAPPER_DOMAIN_VERSION = '1'

/** Name of the envelope struct that replaces the order's `appData` field. */
export const WRAPPER_AND_APP_DATA_TYPE = 'WrapperAndAppData'

/** Name of the (wrapper-domain) order struct. */
export const WRAPPER_ORDER_TYPE = 'Order'

/**
 * Struct names an integrator may not define: they are supplied by the protocol,
 * and redefining them would silently change the digest the wrapper recomputes.
 */
export const RESERVED_TYPE_NAMES: readonly string[] = [WRAPPER_ORDER_TYPE, WRAPPER_AND_APP_DATA_TYPE]

/**
 * The CoW `Order` type with its `appData` field replaced by a `WrapperAndAppData`
 * struct, mirroring `CowAuthLibrary.ORDER_TYPE_STRING`. Field order is
 * significant — it defines the 12 words of the 384-byte `orderData` the wrapper
 * hashes on-chain — so it must not be reordered.
 */
export const WRAPPER_ORDER_TYPE_FIELDS: readonly TypedDataField[] = [
  { name: 'sellToken', type: 'address' },
  { name: 'buyToken', type: 'address' },
  { name: 'receiver', type: 'address' },
  { name: 'sellAmount', type: 'uint256' },
  { name: 'buyAmount', type: 'uint256' },
  { name: 'validTo', type: 'uint32' },
  { name: 'wrapperAndAppData', type: WRAPPER_AND_APP_DATA_TYPE },
  { name: 'feeAmount', type: 'uint256' },
  { name: 'kind', type: 'string' },
  { name: 'partiallyFillable', type: 'bool' },
  { name: 'sellTokenBalance', type: 'string' },
  { name: 'buyTokenBalance', type: 'string' },
]

/** Field name of the `Order` struct that carries the envelope. */
export const WRAPPER_AND_APP_DATA_FIELD = 'wrapperAndAppData'

/** Field name of the nested (ordinary) app-data hash inside the envelope. */
export const NESTED_APP_DATA_FIELD = 'nestedAppData'

/**
 * GPv2's defaults for the two balance fields. `UnsignedOrder` leaves them optional,
 * but they are hashed into the order digest, so an omitted value must resolve to
 * whatever the settlement contract assumes.
 */
export const DEFAULT_SELL_TOKEN_BALANCE = SellTokenSource.ERC20
export const DEFAULT_BUY_TOKEN_BALANCE = BuyTokenDestination.ERC20
