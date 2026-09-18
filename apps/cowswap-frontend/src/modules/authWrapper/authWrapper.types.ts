import type { Address, Hex } from 'viem'

import type { UnsignedOrder } from '@cowprotocol/cow-sdk'
import type { CowAuthWrapperConfig } from '@cowprotocol/widget-lib'

export type { CowAuthWrapperConfig }

/**
 * Everything a solver needs to rebuild the wrapper's on-chain `wrapperData` blob
 * (`nestedAppData ‖ orderData ‖ signature ‖ params`). Posted alongside the order.
 */
export interface AuthWrapperOrderAuthorization {
  /** The `CowAuthWrapper` contract. */
  address: Address
  /** The ordinary CoW app-data hash, i.e. `keccak256(fullAppData)`. */
  nestedAppData: Hex
  /** The value placed in the order's on-chain `appData` field. */
  orderAppData: Hex
  /** `abi.encode(params)` — the wrapper-specific tail of `wrapperData`. */
  params: Hex
  /** The user's 65-byte `[r ‖ s ‖ v]` authorization over the wrapper-domain order digest. */
  signature: Hex
}

/**
 * The order the wrapper hashes. This is the ordinary unsigned CoW order — its
 * `appData` field is ignored here and replaced by the `orderAppData` envelope, which
 * is what turns it into the 12 words of `orderData` in
 * `CowAuthWrapper._computeOrderDigests`.
 */
export type AuthWrapperOrderToSign = UnsignedOrder

/**
 * A {@link CowAuthWrapperConfig} that has passed validation, together with the
 * derived values every later step needs. Producing one is the only supported way
 * to reach the signing/posting services, so those services can assume the
 * canonical-ordering invariants the `CowAuthWrapper` contract relies on.
 */
export interface ResolvedAuthWrapper {
  config: CowAuthWrapperConfig
  address: Address
  /** `keccak256(wrapperStructDef ‖ referencedTypeDefs)`, i.e. `WRAPPER_AND_APP_DATA_TYPE_HASH`. */
  wrapperAndAppDataTypeHash: Hex
  /** EIP-712 types for signing a wrapper-domain order: `Order`, `WrapperAndAppData` and the integrator's structs. */
  orderTypes: TypedDataTypes
  /** The integrator's struct definitions, keyed by name. */
  paramsTypes: TypedDataTypes
}

export interface TypedDataField {
  name: string
  type: string
}

export type TypedDataTypes = Record<string, TypedDataField[]>
