import type { Hex, TypedDataDomain } from 'viem'

import {
  AUTH_WRAPPER_DOMAIN_NAME,
  DEFAULT_BUY_TOKEN_BALANCE,
  DEFAULT_SELL_TOKEN_BALANCE,
  AUTH_WRAPPER_DOMAIN_VERSION,
  NESTED_APP_DATA_FIELD,
  WRAPPER_AND_APP_DATA_FIELD,
  WRAPPER_ORDER_TYPE,
} from '../authWrapper.constants'

import type { AuthWrapperOrderToSign, ResolvedAuthWrapper, TypedDataTypes } from '../authWrapper.types'

export interface WrapperOrderTypedData {
  domain: TypedDataDomain
  types: TypedDataTypes
  primaryType: typeof WRAPPER_ORDER_TYPE
  message: Record<string, unknown>
}

/**
 * The wrapper's EIP-712 domain, matching `CowAuthLibrary.computeDomainSeparator`.
 *
 * It is deliberately NOT the settlement domain: signing under a distinct domain is
 * what stops an order signed for the wrapper from being replayed as a plain CoW
 * order, and vice versa.
 */
export function buildWrapperDomain(wrapper: ResolvedAuthWrapper, chainId: number): TypedDataDomain {
  return {
    name: AUTH_WRAPPER_DOMAIN_NAME,
    version: AUTH_WRAPPER_DOMAIN_VERSION,
    chainId,
    verifyingContract: wrapper.address,
  }
}

/**
 * Builds the typed data the user signs for a wrapper order: the ordinary CoW `Order`
 * struct with its `appData` field replaced by the `WrapperAndAppData` envelope, in
 * the wrapper's own domain.
 *
 * Because the referenced structs are validated to sort before `WrapperAndAppData`
 * (see `resolveAuthWrapper`), a standard wallet's `eth_signTypedData_v4` — which
 * always sorts referenced types alphabetically — reproduces exactly the
 * `ORDER_PLUS_WRAPPER_AND_APP_DATA_TYPE_HASH` the contract built in its constructor.
 * So the user signs readable, structured data rather than an opaque hash.
 */
export function buildWrapperOrderTypedData(
  wrapper: ResolvedAuthWrapper,
  chainId: number,
  order: AuthWrapperOrderToSign,
  nestedAppData: Hex,
): WrapperOrderTypedData {
  return {
    domain: buildWrapperDomain(wrapper, chainId),
    types: wrapper.orderTypes,
    primaryType: WRAPPER_ORDER_TYPE,
    message: {
      sellToken: order.sellToken,
      buyToken: order.buyToken,
      receiver: order.receiver,
      sellAmount: order.sellAmount,
      buyAmount: order.buyAmount,
      validTo: Number(order.validTo),
      [WRAPPER_AND_APP_DATA_FIELD]: {
        [NESTED_APP_DATA_FIELD]: nestedAppData,
        [wrapper.config.paramsField]: wrapper.config.params,
      },
      feeAmount: order.feeAmount,
      kind: order.kind,
      partiallyFillable: order.partiallyFillable,
      // GPv2 defaults both balance fields to `erc20`. They are hashed into the digest
      // either way, so an omitted field must resolve to the same value the settlement
      // contract will use rather than to `undefined`.
      sellTokenBalance: order.sellTokenBalance ?? DEFAULT_SELL_TOKEN_BALANCE,
      buyTokenBalance: order.buyTokenBalance ?? DEFAULT_BUY_TOKEN_BALANCE,
    },
  }
}
