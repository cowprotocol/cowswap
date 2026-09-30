import { getTokenKey } from './tokenKey'

import type { RwaToken } from '@/entities/asset'

export interface TradeToken {
  assetToken: RwaToken
  /** Asset tokens on the network of `assetToken` */
  chainTokens: RwaToken[]
}

/**
 * The wallet network wins over the selected token's one, because the widget follows the wallet.
 * `walletChainId` is `undefined` when no wallet is connected.
 */
export function resolveTradeToken(
  tokens: RwaToken[],
  selectedTokenKey: string | null,
  walletChainId: number | undefined,
): TradeToken | null {
  const selectedToken = tokens.find((token) => getTokenKey(token) === selectedTokenKey)
  const isWalletChainTraded = tokens.some((token) => token.chainId === walletChainId)
  const chainId = isWalletChainTraded ? walletChainId : (selectedToken?.chainId ?? tokens[0]?.chainId)
  const chainTokens = tokens.filter((token) => token.chainId === chainId)
  const assetToken = selectedToken?.chainId === chainId ? selectedToken : chainTokens[0]

  return assetToken ? { assetToken, chainTokens } : null
}
