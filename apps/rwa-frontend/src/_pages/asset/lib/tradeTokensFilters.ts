import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import type { RwaAsset, RwaQuoteSide } from '@/entities/asset'

type TradeTokensFilters = Pick<CowSwapWidgetParams, 'sellTokensFilter' | 'buyTokensFilter'>

export function getTradeTokensFilters(
  asset: RwaAsset,
  chainId: number,
  side: RwaQuoteSide,
  isConnected: boolean,
): TradeTokensFilters {
  if (side === 'buy') {
    return {
      sellTokensFilter: {
        onlyWithBalance: true,
        notice: isConnected ? `Only tokens in your wallet are listed, to pay for ${asset.ticker}.` : undefined,
      },
      // The buy network can be changed in the widget (bridging), so the tokens of every network are allowed
      buyTokensFilter: {
        tokens: asset.tokens.map((token) => token.address),
        notice: `Only tokenized ${asset.ticker} on this network is listed. Pick another network above the widget for more tokens.`,
      },
    }
  }

  return {
    sellTokensFilter: {
      tokens: asset.tokens.filter((token) => token.chainId === chainId).map((token) => token.address),
      onlyWithBalance: true,
      notice: isConnected
        ? `Only the tokenized ${asset.ticker} in your wallet on this network is listed.`
        : `Only the tokenized ${asset.ticker} on this network is listed.`,
    },
  }
}
