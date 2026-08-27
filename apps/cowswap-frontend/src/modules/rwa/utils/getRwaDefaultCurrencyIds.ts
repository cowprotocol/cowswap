import { USDC } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { DEFAULT_TOKENS_LISTS, ONDO_TOKENS_LIST_SOURCE } from '@cowprotocol/tokens'

export interface RwaDefaultCurrencyIds {
  inputCurrencyId: string
  outputCurrencyId: string
}

export function getRwaDefaultCurrencyIds(
  chainId: SupportedChainId,
  isOndoListAvailable: boolean,
): RwaDefaultCurrencyIds | undefined {
  const hasOndoList = DEFAULT_TOKENS_LISTS[chainId]?.some(({ source }) => source === ONDO_TOKENS_LIST_SOURCE)
  const usdc = USDC[chainId]

  if (!hasOndoList || !usdc || !isOndoListAvailable) return undefined

  return {
    inputCurrencyId: usdc.address,
    outputCurrencyId: 'AAPLON',
  }
}
