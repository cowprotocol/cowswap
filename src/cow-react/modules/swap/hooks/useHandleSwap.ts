import { useCallback } from 'react'
import confirmPriceImpactWithoutFee from 'components/swap/confirmPriceImpactWithoutFee'
import { signSwapAnalytics, swapAnalytics } from 'components/analytics'
import { getProviderErrorMessage, isRejectRequestProviderError } from 'utils/misc'
import { SwapCallbackParams, useSwapCallback } from 'hooks/useSwapCallback'
import { Percent } from '@uniswap/sdk-core'
import TradeGp from 'state/swap/TradeGp'
import { useCloseModals } from 'state/application/hooks'
import { useSwapConfirmManager } from 'cow-react/modules/swap/hooks/useSwapConfirmManager'

export interface HandleSwapInput {
  trade: TradeGp | undefined
  account: string | undefined
  recipient: string | null
  recipientAddress: string | null
  priceImpact: Percent | undefined
  allowedSlippage: Percent | undefined
}

export type HandleSwapCallback = () => void

/**
 * @deprecated, use `src/custom/pages/Swap/swapFlow/index.ts`
 */
export function useHandleSwap(input: HandleSwapInput): {
  swapCallbackError: string | null
  swapCallback: HandleSwapCallback
} {
  const { trade, recipient, account, recipientAddress, priceImpact, allowedSlippage } = input
  const closeModals = useCloseModals()
  const swapCallbackState: SwapCallbackParams = {
    trade,
    allowedSlippage,
    recipientAddressOrName: recipient,
    closeModals,
  }
  const { callback, error: swapCallbackError } = useSwapCallback(swapCallbackState)

  const { setSwapError, transactionSent, sendTransaction } = useSwapConfirmManager()

  const swapCallback = useCallback(() => {
    if (!callback || !trade) {
      return
    }

    if (priceImpact && !confirmPriceImpactWithoutFee(priceImpact)) {
      return
    }

    const marketLabel = [trade.inputAmount.currency.symbol, trade.outputAmount.currency.symbol].join(',')
    swapAnalytics('Send', marketLabel)

    sendTransaction(trade)
    callback()
      .then((hash) => {
        transactionSent(hash)

        if (recipient === null) {
          signSwapAnalytics('Sign', marketLabel)
        } else {
          ;(recipientAddress ?? recipient) === account
            ? signSwapAnalytics('SignAndSend', marketLabel)
            : signSwapAnalytics('SignToSelf', marketLabel)
        }
      })
      .catch((error) => {
        let swapErrorMessage, errorCode
        if (isRejectRequestProviderError(error)) {
          swapErrorMessage = 'User rejected signing the order'
          swapAnalytics('Reject', marketLabel)
        } else {
          swapErrorMessage = getProviderErrorMessage(error)

          if (error?.code && typeof error.code === 'number') {
            errorCode = error.code
          }
          console.error('Error Signing Order', error)
          swapAnalytics('Error', marketLabel, errorCode)
        }

        setSwapError(swapErrorMessage)
      })
  }, [
    setSwapError,
    sendTransaction,
    transactionSent,
    callback,
    priceImpact,
    recipient,
    recipientAddress,
    account,
    trade,
  ])

  return { swapCallback, swapCallbackError }
}
