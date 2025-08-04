import { useMemo } from 'react'

import { isAddress } from '@cowprotocol/common-utils'
import { useWalletDetails } from '@cowprotocol/wallet'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { TradeDerivedState, useAmountsToSign, useDerivedTradeState, useIsCurrentTradeBridging, useWrapNativeFlow } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'

import { SUPPORTED_ENS_CHAINS } from '../services/validateTradeForm'
import { RecipientValidationResult, TradeFormButtonContext } from '../types'

const RECIPIENT_VALIDATION_MESSAGES = {
  ENS_NOT_SUPPORTED: 'Please use a blockchain address. ENS names are not supported on this chain.',
  INVALID_RECIPIENT: 'Enter a valid blockchain address or ENS name.',
  INVALID_ADDRESS: 'Enter a valid blockchain address.',
} as const

function createRecipientValidation(derivedState: TradeDerivedState, isBridging: boolean): RecipientValidationResult {
  const { inputCurrency, recipient } = derivedState
  const chainSupportsENS = inputCurrency && SUPPORTED_ENS_CHAINS.includes(inputCurrency.chainId)
  const isENSName = recipient && !isAddress(recipient) && recipient.endsWith('.eth')
  const ensNeverSupported = isBridging || !chainSupportsENS

  const validationMessage = isENSName && ensNeverSupported
    ? RECIPIENT_VALIDATION_MESSAGES.ENS_NOT_SUPPORTED
    : ensNeverSupported
    ? RECIPIENT_VALIDATION_MESSAGES.INVALID_ADDRESS
    : RECIPIENT_VALIDATION_MESSAGES.INVALID_RECIPIENT

  return {
    isBridging: !!isBridging,
    chainSupportsENS: !!chainSupportsENS,
    isENSName: !!isENSName,
    validationMessage,
  }
}

export function useTradeFormButtonContext(
  defaultText: string,
  confirmTrade: () => void,
): TradeFormButtonContext | null {
  const wrapNativeFlow = useWrapNativeFlow()
  const { isSupportedWallet } = useWalletDetails()
  const quote = useTradeQuote()
  const toggleWalletModal = useToggleWalletModal()
  const { standaloneMode } = useInjectedWidgetParams()
  const derivedState = useDerivedTradeState()
  const amountsToSign = useAmountsToSign()
  const isBridging = useIsCurrentTradeBridging()

  return useMemo(() => {
    if (!derivedState) return null

    return {
      defaultText,
      amountsToSign,
      derivedState,
      quote,
      isSupportedWallet,
      confirmTrade,
      wrapNativeFlow,
      connectWallet: toggleWalletModal,
      widgetStandaloneMode: standaloneMode,
      recipientValidation: createRecipientValidation(derivedState, isBridging),
    }
  }, [
    defaultText,
    amountsToSign,
    derivedState,
    quote,
    isSupportedWallet,
    confirmTrade,
    wrapNativeFlow,
    toggleWalletModal,
    standaloneMode,
    isBridging,
  ])
}
