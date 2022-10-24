import { signSwapAnalytics, swapAnalytics } from 'components/analytics'
import TradeGp from 'state/swap/TradeGp'
import { USER_SWAP_REJECTED_ERROR } from '@cow/modules/swap/services/common/steps/swapErrorHelper'

function getMarketLabel(trade: TradeGp): string {
  return [trade.inputAmount.currency.symbol, trade.outputAmount.currency.symbol].join(',')
}

export interface SwapFlowAnalyticsContext {
  account: string | null
  recipient: string | null
  recipientAddress: string | null
  trade: TradeGp
}

export const swapFlowAnalytics = {
  swap(context: SwapFlowAnalyticsContext) {
    swapAnalytics('Send', getMarketLabel(context.trade))
  },
  sign(context: SwapFlowAnalyticsContext) {
    const { account, recipient, recipientAddress, trade } = context
    const marketLabel = getMarketLabel(trade)

    if (recipient === null) {
      signSwapAnalytics('Sign', marketLabel)
    } else {
      ;(recipientAddress ?? recipient) === account
        ? signSwapAnalytics('SignAndSend', marketLabel)
        : signSwapAnalytics('SignToSelf', marketLabel)
    }
  },
  error(error: any, errorMessage: string, context: SwapFlowAnalyticsContext) {
    const marketLabel = getMarketLabel(context.trade)

    if (errorMessage === USER_SWAP_REJECTED_ERROR) {
      swapAnalytics('Reject', marketLabel)
    } else {
      swapAnalytics('Error', marketLabel, error.code && typeof error.code === 'number' ? error.code : undefined)
    }
  },
}
