import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { CowSwapWidgetAppParams, TokenSelectorFilter } from '@cowprotocol/widget-lib'

import { Field } from 'legacy/state/types'

/** `balances` is `null` when they don't narrow the tokens */
export function filterTokensForSelector(
  tokens: TokenWithLogo[],
  filter: TokenSelectorFilter | undefined,
  balances: Record<string, bigint | undefined> | null,
): TokenWithLogo[] {
  const allowedAddresses = filter?.tokens ? new Set(filter.tokens.map(getAddressKey)) : null

  if (!allowedAddresses && !balances) return tokens

  return tokens.filter((token) => {
    const address = getAddressKey(token.address)

    if (allowedAddresses && !allowedAddresses.has(address)) return false

    return !balances || (balances[address] ?? 0n) > 0n
  })
}

export function getTokenSelectorFilter(
  field: Field | undefined,
  { sellTokensFilter, buyTokensFilter }: Partial<CowSwapWidgetAppParams>,
): TokenSelectorFilter | undefined {
  if (field === Field.INPUT) return sellTokensFilter
  if (field === Field.OUTPUT) return buyTokensFilter

  return undefined
}
