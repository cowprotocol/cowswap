import { getIsNativeToken, getSwapBaseUrl } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'

import { Order } from 'api/operator'

import { getUiOrderType, UiOrderType } from './getUiOrderType'

/** CoW Swap URL that pre-fills the trade widget from an explorer order (pair, amounts, order kind). */
export function getCowSwapOrderUrl(chainId: SupportedChainId, order: Order): string | null {
  const { sellToken, buyToken, sellAmount, buyAmount, kind } = order
  if (!sellToken || !buyToken) {
    return null
  }

  const routeSegment = getTradeRouteSegment(getUiOrderType(order))
  const inputCurrencyId = getInputCurrencyId(chainId, sellToken)
  const outputCurrencyId = getInputCurrencyId(chainId, buyToken)

  const params = new URLSearchParams()
  const sellAmountParam = formatAtomicAmountForSwapUrl(sellAmount, sellToken.decimals)
  const buyAmountParam = formatAtomicAmountForSwapUrl(buyAmount, buyToken.decimals)

  if (sellAmountParam !== '0') {
    params.set('sellAmount', sellAmountParam)
  }
  if (buyAmountParam !== '0') {
    params.set('buyAmount', buyAmountParam)
  }
  params.set('orderKind', kind)

  const path = `${getSwapBaseUrl()}/#/${chainId}/${routeSegment}/${encodeURIComponent(inputCurrencyId)}/${encodeURIComponent(outputCurrencyId)}`
  return `${path}?${params.toString()}`
}

function formatAtomicAmountForSwapUrl(amount: BigNumber, tokenDecimals: number): string {
  const scaled = amount.shiftedBy(-tokenDecimals).toFixed(tokenDecimals)
  return scaled.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.$/, '')
}

function getInputCurrencyId(chainId: SupportedChainId, token: TokenErc20): string {
  return getIsNativeToken(chainId, token.address) ? token.symbol || token.address : token.address
}

function getTradeRouteSegment(uiType: UiOrderType): 'swap' | 'limit' | 'advanced' {
  switch (uiType) {
    case UiOrderType.MARKET:
      return 'swap'
    case UiOrderType.LIMIT:
    case UiOrderType.LIQUIDITY:
      return 'limit'
    case UiOrderType.TWAP:
      return 'advanced'
    default: {
      const _exhaustive: never = uiType
      return _exhaustive
    }
  }
}
