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
  const assetChainIds = [...new Set(asset.tokens.map((token) => token.chainId))]

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
        selectableChainIds: assetChainIds,
        notice: `Only tokenized ${asset.ticker} is listed. To buy it on a network it can't be bridged to, pick that network above the widget.`,
      },
    }
  }

  return {
    sellTokensFilter: isConnected
      ? {
          tokens: assetTokens,
          onlyWithBalance: true,
          selectableChainIds: assetChainIds,
          notice: `Only the tokenized ${asset.ticker} with a positive balance in your wallet is listed.`,
        }
      : {
          tokens: [assetToken.address],
          notice: `Only the ${assetToken.symbol} token selected above is listed.`,
        },
    buyTokensFilter: { excludedTokens: assetTokens },
  }
}
