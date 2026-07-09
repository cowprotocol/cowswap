import { TokenWithLogo } from '@cowprotocol/common-const'
import { CurrencyAmount } from '@cowprotocol/currency'

import { SerializedToken } from '../../user/types'
import { Order, OrderStatus, SerializedOrder } from '../actions'
import { OrderObject, V2OrderObject } from '../reducer'
import { isOrderExpired } from '../utils'

type PersistedOrder = SerializedOrder & { bridgeOutputAmount?: unknown }

export function deserializeOrder(orderObject: OrderObject | V2OrderObject | undefined): Order | undefined {
  let order: Order | undefined
  // we need to make sure the incoming order is a valid
  // V3 typed order as users can have stale data from V2
  if (isV3Order(orderObject)) {
    const { order: serialisedOrder } = orderObject

    const deserialisedInputToken = deserializeToken(serialisedOrder.inputToken)
    const deserialisedOutputToken = deserializeToken(serialisedOrder.outputToken)
    order = {
      ...serialisedOrder,
      inputToken: deserialisedInputToken,
      outputToken: deserialisedOutputToken,
      bridgeOutputAmount: deserializeBridgeOutputAmount((serialisedOrder as PersistedOrder).bridgeOutputAmount),
    }

    // Fix for edge-case, where for some reason the order is still pending but its actually expired
    if (order.status === OrderStatus.PENDING && isOrderExpired(order)) {
      order.status = OrderStatus.EXPIRED
    }
  } else {
    orderObject?.order &&
      console.debug('[Order::hooks] - V2 Order detected, skipping serialisation.', orderObject.order)
  }

  return order
}

function deserializeToken(serializedToken: SerializedToken): TokenWithLogo {
  return TokenWithLogo.fromToken(serializedToken, serializedToken.logoURI)
}

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isV3Order(orderObject: any): orderObject is OrderObject {
  return orderObject?.order?.inputToken !== undefined || orderObject?.order?.outputToken !== undefined
}

// Rebuild a CurrencyAmount instance from anything that *looks like* one.
// After Redux Persist's JSON round-trip the class methods are gone, and depending on when the
// order was created the underlying numerator/denominator can be a native bigint, a string,
// an array of 30-bit chunks left over from the legacy JSBI representation, or already a fresh
// instance from this session.
export function deserializeBridgeOutputAmount(value: unknown): CurrencyAmount<TokenWithLogo> | undefined {
  if (!value) return undefined
  if (value instanceof CurrencyAmount) return value

  if (typeof value !== 'object') return undefined
  const raw = value as { numerator?: unknown; denominator?: unknown; currency?: unknown }

  const numerator = toBigIntFromAnyFormat(raw.numerator)
  const denominator = toBigIntFromAnyFormat(raw.denominator)
  if (numerator === null || denominator === null || denominator === 0n) return undefined

  const currency = toTokenFromAnyFormat(raw.currency)
  if (!currency) return undefined

  try {
    return CurrencyAmount.fromFractionalAmount(currency, numerator, denominator)
  } catch {
    return undefined
  }
}

function toTokenFromAnyFormat(value: unknown): TokenWithLogo | undefined {
  if (!value || typeof value !== 'object') return undefined
  if (value instanceof TokenWithLogo) return value
  const c = value as Record<string, unknown>
  const tokenInfo = extractTokenInfo(c)
  if (!tokenInfo) return undefined
  try {
    return TokenWithLogo.fromToken(tokenInfo, typeof c.logoURI === 'string' ? c.logoURI : undefined)
  } catch {
    return undefined
  }
}

function extractTokenInfo(
  c: Record<string, unknown>,
): { chainId: number; address: string; decimals: number; symbol: string; name: string } | null {
  if (typeof c.chainId !== 'number' || typeof c.address !== 'string' || typeof c.decimals !== 'number') return null
  return {
    chainId: c.chainId,
    address: c.address,
    decimals: c.decimals,
    symbol: typeof c.symbol === 'string' ? c.symbol : '',
    name: typeof c.name === 'string' ? c.name : '',
  }
}

function toBigIntFromAnyFormat(value: unknown): bigint | null {
  if (typeof value === 'bigint') return value
  // Reject floats and values above MAX_SAFE_INTEGER (2^53 - 1) - they would
  // lose precision before reaching BigInt, silently corrupting amounts.
  if (typeof value === 'number') return Number.isSafeInteger(value) ? BigInt(value) : null
  if (typeof value === 'string') return parseBigIntString(value)
  // Legacy JSBI: instances extend Array<number> and store the magnitude as
  // little-endian 30-bit limbs (V8 SMI-friendly width). After JSON round-trip
  // this becomes either a plain array or an object keyed by numeric strings.
  if (Array.isArray(value)) return limbsToBigInt(value)
  if (value && typeof value === 'object') return jsbiObjectToBigInt(value as Record<string, unknown>)
  return null
}

function parseBigIntString(value: string): bigint | null {
  try {
    return BigInt(value)
  } catch {
    return null
  }
}

function jsbiObjectToBigInt(obj: Record<string, unknown>): bigint | null {
  const limbs: number[] = []
  for (let i = 0; `${i}` in obj; i++) {
    const limb = obj[`${i}`]
    if (typeof limb !== 'number') return null
    limbs.push(limb)
  }
  if (limbs.length === 0) return null
  return limbsToBigInt(limbs)
}

// JSBI internals: each limb holds the low 30 bits of the magnitude (mask 2^30 - 1).
const JSBI_LIMB_BITS = 30n
const JSBI_LIMB_MASK = (1 << 30) - 1

function limbsToBigInt(limbs: unknown[]): bigint | null {
  let result = 0n
  for (let i = limbs.length - 1; i >= 0; i--) {
    const limb = limbs[i]
    if (typeof limb !== 'number') return null
    result = (result << JSBI_LIMB_BITS) | BigInt(limb & JSBI_LIMB_MASK)
  }
  return result
}
