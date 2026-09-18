import { concatHex, hashStruct, keccak256, type Hex } from 'viem'

import { NESTED_APP_DATA_FIELD, WRAPPER_AND_APP_DATA_TYPE } from '../authWrapper.constants'

import type { ResolvedAuthWrapper } from '../authWrapper.types'

/**
 * Computes the `orderAppData` an order must carry in its `appData` field to settle
 * through the wrapper — the on-chain `CowAuthWrapper._computeOrderAppData` /
 * `computeOrderAppData(nestedAppData ‖ params)`:
 *
 * `keccak256(WRAPPER_AND_APP_DATA_TYPE_HASH ‖ nestedAppData ‖ hashStruct(params))`
 *
 * @param nestedAppData the ordinary CoW app-data hash, `keccak256(fullAppData)`
 */
export function computeOrderAppData(wrapper: ResolvedAuthWrapper, nestedAppData: Hex): Hex {
  return hashStruct({
    data: {
      [NESTED_APP_DATA_FIELD]: nestedAppData,
      [wrapper.config.paramsField]: wrapper.config.params,
    },
    primaryType: WRAPPER_AND_APP_DATA_TYPE,
    types: wrapper.orderTypes,
  })
}

/**
 * The same value as {@link computeOrderAppData}, assembled from the three words the
 * contract concatenates rather than through viem's encoder.
 *
 * Kept as an independent cross-check of the derived `WRAPPER_AND_APP_DATA_TYPE_HASH`:
 * `computeOrderAppData` goes through viem's canonical `encodeType`, this one through
 * the type hash we build ourselves. If they disagree, the digest the wallet signs does
 * not match the one the wrapper recomputes on-chain, and the order would settle
 * against a signature the user never gave.
 */
export function computeOrderAppDataFromParts(wrapper: ResolvedAuthWrapper, nestedAppData: Hex): Hex {
  return keccak256(concatHex([wrapper.wrapperAndAppDataTypeHash, nestedAppData, hashWrapperParams(wrapper)]))
}

/**
 * `hashStruct(params)` — the EIP-712 struct hash of the wrapper's own params,
 * matching `keccak256(_wrapperSigningData(params))` on-chain.
 */
export function hashWrapperParams(wrapper: ResolvedAuthWrapper): Hex {
  return hashStruct({
    data: wrapper.config.params,
    primaryType: wrapper.config.paramsType,
    types: wrapper.paramsTypes,
  })
}
