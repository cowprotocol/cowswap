import { useMemo } from 'react'

import { getCurrencyAddress, getIsNativeToken, getIsWrapOrUnwrap, isSellOrder } from '@cowprotocol/common-utils'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency } from '@uniswap/sdk-core'

import { ExtendedTradeRawState, useSwitchTokensPlaces } from 'modules/trade'

import { useSwapDerivedState } from './useSwapDerivedState'

import { SELL_ETH_RESET_STATE } from '../consts'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useOnSwitchTokens() {
  const { chainId } = useWalletInfo()
  const { inputCurrency, outputCurrency, orderKind } = useSwapDerivedState()

  const stateOverride = useMemo(
    () =>
      inputCurrency && outputCurrency
        ? getEthFlowOverridesOnSwitch(chainId, inputCurrency, outputCurrency, orderKind)
        : undefined,
    [chainId, inputCurrency, outputCurrency, orderKind],
  )

  return useSwitchTokensPlaces(stateOverride)
}

/**
 * Calculates the order kind when switching the tokens
 *
 * We don't support native token BUY orders
 * So if BUY currency is native and user is inverting tokens, force orderKind to SELL
 * to not end up with a BUY order
 * Special case when opposite token is wrapped native, then it's fine to invert as it's a wrap
 */
function getEthFlowOverridesOnSwitch(
  chainId: SupportedChainId,
  inputCurrency: Currency,
  outputCurrency: Currency,
  orderKind: OrderKind,
): Partial<ExtendedTradeRawState> {
  const isSell = isSellOrder(orderKind)
  const isNativeOut = getIsNativeToken(outputCurrency)
  const isWrapUnwrap = getIsWrapOrUnwrap(chainId, getCurrencyAddress(inputCurrency), getCurrencyAddress(outputCurrency))

  // If the sell token was Native, and it's not a wrap, and it was a SELL order
  // It would normally become a buy order, but there are no Native buy orders!
  // Set order type to SELL
  if (!isWrapUnwrap && isNativeOut && isSell) {
    return SELL_ETH_RESET_STATE
  }
  // Otherwise (it was a buy order and will become a sell order)
  // Keep the same typed in value. Pretty much keeping the original behaviour
  return {
    orderKind: isSell ? OrderKind.BUY : OrderKind.SELL,
  }
}
