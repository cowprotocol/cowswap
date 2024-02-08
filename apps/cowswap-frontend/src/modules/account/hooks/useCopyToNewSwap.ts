import { useCallback } from 'react'

import { OrderKind } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { CONFIRMED_STATES, Order } from 'legacy/state/orders/actions'

import { Routes } from 'common/constants/routes'

import { useToggleAccountModal } from './useToggleAccountModal'

import { useTradeNavigate } from '../../trade/hooks/useTradeNavigate'

export function useCopyToNewSwap(order: Order | undefined): undefined | (() => void) {
  const navigate = useTradeNavigate()
  const { chainId } = useWalletInfo()
  const handleCloseOrdersPanel = useToggleAccountModal()

  const {
    sellToken: inputCurrencyId,
    buyToken: outputCurrencyId,
    kind,
    inputToken,
    outputToken,
    sellAmount,
    buyAmount,
    feeAmount,
    status,
  } = order || {}

  // Only return callback if order is in a final state
  const canRecreateOrder = status && CONFIRMED_STATES.includes(status)

  // Load CurrencyAmount instances for parsing the amounts in units rather than atoms
  const inputAmount = inputToken && sellAmount && CurrencyAmount.fromRawAmount(inputToken, sellAmount.toString())
  const outputAmount = outputToken && buyAmount && CurrencyAmount.fromRawAmount(outputToken, buyAmount.toString())
  const fee = inputToken && feeAmount && CurrencyAmount.fromRawAmount(inputToken, feeAmount.toString())

  // Get the currencyAmount according to order kind
  const currencyAmount = kind === OrderKind.SELL && inputAmount && fee ? inputAmount?.add(fee) : outputAmount
  // Get the amount units
  const amount =
    currencyAmount && currencyAmount.toFixed(kind === OrderKind.SELL ? inputToken?.decimals : outputToken?.decimals)

  const recreateOrder = useCallback(() => {
    if (!chainId || !canRecreateOrder || !inputCurrencyId || !outputCurrencyId || !amount || !kind) {
      return
    }

    // Move to SWAP with same order details filled in
    navigate(
      chainId,
      {
        inputCurrencyId,
        outputCurrencyId,
      },
      { kind, amount },
      Routes.SWAP
    )

    // TODO: should this be somewhere else?
    // Close account modal
    handleCloseOrdersPanel()
  }, [amount, canRecreateOrder, chainId, handleCloseOrdersPanel, inputCurrencyId, kind, navigate, outputCurrencyId])

  return canRecreateOrder ? recreateOrder : undefined
}
