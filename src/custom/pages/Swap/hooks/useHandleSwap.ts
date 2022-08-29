import { useCallback } from 'react'
import confirmPriceImpactWithoutFee from '@src/components/swap/confirmPriceImpactWithoutFee'
import { signSwapAnalytics, swapAnalytics } from 'utils/analytics'
import { getProviderErrorMessage, isRejectRequestProviderError } from 'utils/misc'
import { SwapCallbackParams, useSwapCallback } from 'hooks/useSwapCallback'
import { Percent } from '@uniswap/sdk-core'
import TradeGp from 'state/swap/TradeGp'
import { useCloseModals } from 'state/application/hooks'
import { useSwapConfirmManager } from 'pages/Swap/hooks/useSwapConfirmManager'

export interface HandleSwapInput {
  trade: TradeGp | undefined
  account: string | undefined
  recipient: string | null
  recipientAddress: string | null
  priceImpact: Percent | undefined
  allowedSlippage: Percent | undefined
}

export interface HandleSwapType {
  openConfirm?: boolean
}

export type HandleSwapCallback = (input?: HandleSwapType) => void

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

  const { openSwapConfirmModal, setSwapError, transactionSent, sendTransaction } = useSwapConfirmManager()

  const swapCallback = useCallback(
    (input?: HandleSwapType) => {
      if (input?.openConfirm) {
        openSwapConfirmModal(trade!)
        return
      }

      if (!callback) {
        return
      }

      if (priceImpact && !confirmPriceImpactWithoutFee(priceImpact)) {
        return
      }

      const marketLabel = [trade?.inputAmount?.currency?.symbol, trade?.outputAmount?.currency?.symbol].join(',')
      swapAnalytics('Send', marketLabel)

      sendTransaction(trade!)
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
    },
    [
      openSwapConfirmModal,
      setSwapError,
      sendTransaction,
      transactionSent,
      callback,
      priceImpact,
      recipient,
      recipientAddress,
      account,
      trade,
    ]
  )

  return { swapCallback, swapCallbackError }
}
