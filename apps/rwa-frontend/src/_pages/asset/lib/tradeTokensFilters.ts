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
  const sameTokens = asset.tokens.filter((token) => isSameIssuerToken(token, assetToken))
  const sameTokenAddresses = sameTokens.map((token) => token.address)

  if (side === 'buy') {
    return {
      sellTokensFilter: {
        excludedTokens: sameTokenAddresses,
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
          tokens: sameTokenAddresses,
          selectableChainIds: [...new Set(sameTokens.map((token) => token.chainId))],
          notice: `Only the ${assetToken.symbol} token selected above is listed.`,
        },
    buyTokensFilter: { excludedTokens: sameTokenAddresses },
  }
}

function isSameIssuerToken(token: RwaToken, assetToken: RwaToken): boolean {
  return token.issuer === assetToken.issuer && token.symbol.toLowerCase() === assetToken.symbol.toLowerCase()
}
