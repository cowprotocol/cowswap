import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import type { RwaAsset, RwaQuoteSide, RwaToken } from '@/entities/asset'

type TradeTokensFilters = Pick<CowSwapWidgetParams, 'sellTokensFilter' | 'buyTokensFilter'>

export function getTradeTokensFilters(
  asset: RwaAsset,
  assetToken: RwaToken,
  side: RwaQuoteSide,
  isConnected: boolean,
): TradeTokensFilters {
  const assetTokens = asset.tokens.map((token) => token.address)

  if (side === 'buy') {
    return {
      sellTokensFilter: {
        excludedTokens: assetTokens,
        onlyWithBalance: true,
        notice: isConnected
          ? `Only tokens with a positive balance in your wallet can be used to pay for ${asset.ticker}.`
          : undefined,
      },
      // The buy network can be changed in the widget (bridging), so the tokens of every network are allowed
      buyTokensFilter: {
        tokens: assetTokens,
        notice: `Only tokenized ${asset.ticker} on this network is listed. Pick another network above the widget for more tokens.`,
      },
    }
  }

  const networkAssetTokens = asset.tokens
    .filter((token) => token.chainId === assetToken.chainId)
    .map((token) => token.address)

  return {
    sellTokensFilter: isConnected
      ? {
          tokens: networkAssetTokens,
          onlyWithBalance: true,
          notice: `Only the tokenized ${asset.ticker} with a positive balance in your wallet on this network is listed.`,
        }
      : {
          tokens: [assetToken.address],
          notice: `Only the ${assetToken.symbol} token selected above is listed.`,
        },
    buyTokensFilter: { excludedTokens: assetTokens },
  }
}
