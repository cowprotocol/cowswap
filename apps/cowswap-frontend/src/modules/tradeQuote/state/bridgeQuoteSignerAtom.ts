import { atomWithStorage } from 'jotai/utils'

import { isHex } from 'viem'
import { generatePrivateKey } from 'viem/accounts'

export type BridgeQuotePrivateKey = ReturnType<typeof generatePrivateKey>

export const BRIDGE_QUOTE_PRIVATE_KEY_STORAGE_KEY = 'bridgeQuotePrivateKeyAtom:v1'

export const bridgeQuotePrivateKeyAtom = atomWithStorage<BridgeQuotePrivateKey | null>(
  BRIDGE_QUOTE_PRIVATE_KEY_STORAGE_KEY,
  null,
  undefined,
  { getOnInit: true },
)

export function isBridgeQuotePrivateKey(value: unknown): value is BridgeQuotePrivateKey {
  return isHex(value, { strict: true }) && value.length === 66
}
