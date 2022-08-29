import { useCallback } from 'react'
import confirmPriceImpactWithoutFee from '@src/components/swap/confirmPriceImpactWithoutFee'
import { signSwapAnalytics, swapAnalytics } from 'utils/analytics'
import { getProviderErrorMessage, isRejectRequestProviderError } from 'utils/misc'
import { SwapCallbackParams, useSwapCallback } from 'hooks/useSwapCallback'
import { Percent } from '@uniswap/sdk-core'
import TradeGp from 'state/swap/TradeGp'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { swapConfirmAtom } from 'pages/Swap/state/swapConfirmAtom'
import { useCloseModals } from 'state/application/hooks'

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
  const swapConfirmState = useAtomValue(swapConfirmAtom)
  const setSwapState = useUpdateAtom(swapConfirmAtom)
  const { showConfirm, tradeToConfirm } = swapConfirmState
  const closeModals = useCloseModals()
  const swapCallbackState: SwapCallbackParams = {
    trade,
    allowedSlippage,
    recipientAddressOrName: recipient,
    openTransactionConfirmationModal: () => {
      setSwapState({
        tradeToConfirm: trade,
        attemptingTxn: true,
        swapErrorMessage: undefined,
        showConfirm: true,
        txHash: undefined,
      })
    },
    closeModals,
  }
  const { callback, error: swapCallbackError } = useSwapCallback(swapCallbackState)

  const swapCallback = useCallback(
    (input?: HandleSwapType) => {
      if (input?.openConfirm) {
        setSwapState({
          tradeToConfirm: trade,
          attemptingTxn: false,
          swapErrorMessage: undefined,
          showConfirm: true,
          txHash: undefined,
        })
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

      setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
      callback()
        .then((hash) => {
          setSwapState({ attemptingTxn: false, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash })

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

          setSwapState({
            attemptingTxn: false,
            tradeToConfirm,
            showConfirm,
            swapErrorMessage,
            txHash: undefined,
          })
        })
    },
    [setSwapState, callback, priceImpact, tradeToConfirm, showConfirm, recipient, recipientAddress, account, trade]
  )

  return { swapCallback, swapCallbackError }
}
