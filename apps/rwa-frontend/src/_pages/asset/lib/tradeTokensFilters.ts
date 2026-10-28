import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import type { RwaAsset, RwaQuoteSide } from '@/entities/asset'

type TradeTokensFilters = Pick<CowSwapWidgetParams, 'sellTokensFilter' | 'buyTokensFilter'>

export function getTradeTokensFilters(asset: RwaAsset, chainId: number, side: RwaQuoteSide): TradeTokensFilters {
  const assetTokens = asset.tokens.filter((token) => token.chainId === chainId).map((token) => token.address)

  if (side === 'buy') {
    return {
      sellTokensFilter: {
        onlyWithBalance: true,
        notice: `Only tokens in your wallet are listed, to pay for ${asset.ticker}.`,
      },
      buyTokensFilter: {
        tokens: assetTokens,
        notice: `Only tokenized ${asset.ticker} on this network is listed. Pick another network above the widget for more tokens.`,
      },
    }
  }

  return {
    sellTokensFilter: {
      tokens: assetTokens,
      onlyWithBalance: true,
      notice: `Only the tokenized ${asset.ticker} in your wallet on this network is listed.`,
    },
  }
}
