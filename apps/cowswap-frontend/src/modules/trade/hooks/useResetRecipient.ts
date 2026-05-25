import { useEffect, useMemo } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { isEvmChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { usePostHooksRecipientOverride } from 'entities/orderHooks/usePostHooksRecipientOverride'
import { useLocation } from 'react-router'

import { useTradeStateFromUrl } from './setupTradeState/useTradeStateFromUrl'
import { useDerivedTradeState } from './useDerivedTradeState'
import { useIsHooksTradeType } from './useIsHooksTradeType'
import { useIsNativeIn } from './useIsNativeInOrOut'

import { useIsAlternativeOrderModalVisible } from '../state/alternativeOrder'

export function useResetRecipient(onChangeRecipient: (recipient: string | null) => void): null {
  const isAlternativeOrderModalVisible = useIsAlternativeOrderModalVisible()
  const tradeState = useDerivedTradeState()
  const tradeStateFromUrl = useTradeStateFromUrl()
  const postHooksRecipientOverride = usePostHooksRecipientOverride()
  const isHooksTradeType = useIsHooksTradeType()
  const isNativeIn = useIsNativeIn()
  const hasTradeState = !!tradeStateFromUrl
  const { chainId } = useWalletInfo()
  const location = useLocation()

  const prevPostHooksRecipientOverride = usePrevious(postHooksRecipientOverride)
  const recipient = tradeState?.recipient
  /**
   * Derived synchronously from the URL rather than from the tradeStateFromUrl atom,
   * which is only populated a render later. By the time the atom updates, the reset
   * effects below have already wiped a recipient that was explicitly set in the URL.
   */
  const hasRecipientInUrl = useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    return !!(searchParams.get('recipient') || searchParams.get('recipientAddress'))
  }, [location.search])
  const outputCurrency = tradeState?.outputCurrency
  const inputCurrency = tradeState?.inputCurrency
  const isBridging = !!(inputCurrency && outputCurrency && inputCurrency.chainId !== outputCurrency.chainId)
  const isNonEvmBridging = isBridging && !!outputCurrency && !isEvmChain(outputCurrency.chainId)

  /**
   * Reset recipient value only once at App start if it's not set in URL
   */
  useEffect(() => {
    if (!hasRecipientInUrl && !isAlternativeOrderModalVisible && !postHooksRecipientOverride && !isNonEvmBridging) {
      onChangeRecipient(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTradeState])

  /**
   * Reset recipient whenever chainId changes, but preserve any recipient set via URL
   */
  useEffect(() => {
    if (!postHooksRecipientOverride && !isNonEvmBridging && !hasRecipientInUrl) {
      onChangeRecipient(null)
    }
  }, [chainId, onChangeRecipient, postHooksRecipientOverride, isNonEvmBridging, hasRecipientInUrl])

  /**
   * Remove recipient override when its source hook was deleted
   */
  useEffect(() => {
    const recipientOverrideWasRemoved = !postHooksRecipientOverride && recipient === prevPostHooksRecipientOverride

    if (recipientOverrideWasRemoved && !hasRecipientInUrl) {
      onChangeRecipient(null)
    }
  }, [recipient, postHooksRecipientOverride, prevPostHooksRecipientOverride, hasRecipientInUrl, onChangeRecipient])

  /**
   * Remove recipient when going out from hooks-store page, but preserve any recipient set via URL
   */
  useEffect(() => {
    if (!isHooksTradeType && !hasRecipientInUrl) {
      onChangeRecipient(null)
    }
  }, [isHooksTradeType, hasRecipientInUrl, onChangeRecipient])

  useEffect(() => {
    if (isHooksTradeType && isNativeIn && !hasRecipientInUrl) {
      onChangeRecipient(null)
    }
  }, [isHooksTradeType, isNativeIn, hasRecipientInUrl, onChangeRecipient])

  return null
}
