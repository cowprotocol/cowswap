import { areAddressesEqual } from '@cowprotocol/cow-sdk'

import { getTokenKey, type RwaToken } from '@/entities/asset'

export interface TradeToken {
  assetToken: RwaToken
  /** `false` when the user picked `assetToken` */
  isAutoSelected: boolean
}

/**
 * The wallet network wins, because the widget follows the wallet. Then the network of the selected token, then the
 * network picked in the selector. `walletChainId` is `undefined` when no wallet is connected.
 */
export function resolveTradeChainId(
  tokens: RwaToken[],
  selectedTokenKey: string | null,
  preferredChainId: number | null,
  walletChainId: number | undefined,
): number | undefined {
  const hasTokensOn = (chainId: number | null | undefined): boolean => tokens.some((token) => token.chainId === chainId)

  if (hasTokensOn(walletChainId)) return walletChainId

  const selectedToken = tokens.find((token) => getTokenKey(token) === selectedTokenKey)

  if (selectedToken) return selectedToken.chainId
  if (preferredChainId !== null && hasTokensOn(preferredChainId)) return preferredChainId

  return tokens[0]?.chainId
}

/** `chainTokens` are the asset tokens on the traded network */
export function resolveTradeToken(
  chainTokens: RwaToken[],
  selectedTokenKey: string | null,
  bestTokenAddress: string | null,
): TradeToken | null {
  const selectedToken = chainTokens.find((token) => getTokenKey(token) === selectedTokenKey)

  if (selectedToken) return { assetToken: selectedToken, isAutoSelected: false }

  const bestToken = bestTokenAddress
    ? chainTokens.find((token) => areAddressesEqual(token.address, bestTokenAddress))
    : undefined
  const assetToken = bestToken ?? chainTokens[0]

  return assetToken ? { assetToken, isAutoSelected: true } : null
}
