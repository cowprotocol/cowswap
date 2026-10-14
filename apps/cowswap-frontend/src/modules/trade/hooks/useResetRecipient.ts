import { useEffect, useMemo } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { isEvmChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { usePostHooksRecipientOverride } from 'entities/orderHooks/usePostHooksRecipientOverride'
import { useLocation } from 'react-router'

import { useTradeStateFromUrl } from './setupTradeState/useTradeStateFromUrl'
import { useDerivedTradeState } from './useDerivedTradeState'
import { useIsCustomRecipientDisabled } from './useIsCustomRecipientDisabled'
import { useIsHooksTradeType } from './useIsHooksTradeType'
import { useIsNativeIn } from './useIsNativeInOrOut'

import { useIsAlternativeOrderModalVisible } from '../state/alternativeOrder'

export function useResetRecipient(onChangeRecipient: (recipient: string | null) => void): null {
  const isAlternativeOrderModalVisible = useIsAlternativeOrderModalVisible()
  const tradeState = useDerivedTradeState()
  const tradeStateFromUrl = useTradeStateFromUrl()
  const postHooksRecipientOverride = usePostHooksRecipientOverride()
  const isCustomRecipientDisabled = useIsCustomRecipientDisabled()
  const isHooksTradeType = useIsHooksTradeType()
  const isNativeIn = useIsNativeIn()
  const hasTradeState = !!tradeStateFromUrl
  const { chainId } = useWalletInfo()
  const location = useLocation()

  const prevPostHooksRecipientOverride = usePrevious(postHooksRecipientOverride)
  const recipient = tradeState?.recipient
  const hasRecipientInUrl = useMemo(() => hasRecipientSearchParam(location.search), [location.search])
  const shouldPreserveRecipientFromUrl = hasRecipientInUrl && !isCustomRecipientDisabled
  const outputCurrency = tradeState?.outputCurrency
  const inputCurrency = tradeState?.inputCurrency
  const isBridging = !!(inputCurrency && outputCurrency && inputCurrency.chainId !== outputCurrency.chainId)
  const isNonEvmBridging = isBridging && !!outputCurrency && !isEvmChain(outputCurrency.chainId)

  /**
   * Reset recipient value only once at App start if it's not set in URL
   */
  useEffect(() => {
    if (shouldPreserveRecipientFromUrl) {
      return
    }

    if (!isAlternativeOrderModalVisible && !postHooksRecipientOverride && !isNonEvmBridging) {
      onChangeRecipient(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTradeState])

  /**
   * Reset recipient whenever chainId or custom-recipient availability changes,
   * but preserve any recipient set via URL.
   */
  useEffect(() => {
    if (isCustomRecipientDisabled) {
      onChangeRecipient(null)
      return
    }

    if (shouldPreserveRecipientFromUrl) {
      return
    }

    if (!postHooksRecipientOverride && !isNonEvmBridging) {
      onChangeRecipient(null)
    }
  }, [
    chainId,
    isCustomRecipientDisabled,
    onChangeRecipient,
    postHooksRecipientOverride,
    isNonEvmBridging,
    shouldPreserveRecipientFromUrl,
  ])

  /**
   * Remove recipient override when its source hook was deleted
   */
  useEffect(() => {
    if (shouldPreserveRecipientFromUrl) {
      return
    }

    const recipientOverrideWasRemoved = !postHooksRecipientOverride && recipient === prevPostHooksRecipientOverride

    if (recipientOverrideWasRemoved) {
      onChangeRecipient(null)
    }
  }, [
    recipient,
    postHooksRecipientOverride,
    prevPostHooksRecipientOverride,
    onChangeRecipient,
    shouldPreserveRecipientFromUrl,
  ])

  /**
   * Remove recipient when going out from hooks-store page
   */
  useEffect(() => {
    if (shouldPreserveRecipientFromUrl) {
      return
    }

    if (!isHooksTradeType) {
      onChangeRecipient(null)
    }
  }, [isHooksTradeType, onChangeRecipient, shouldPreserveRecipientFromUrl])

  useEffect(() => {
    if (shouldPreserveRecipientFromUrl) {
      return
    }

    if (isHooksTradeType && isNativeIn) {
      onChangeRecipient(null)
    }
  }, [isHooksTradeType, isNativeIn, onChangeRecipient, shouldPreserveRecipientFromUrl])

  return null
}

function hasRecipientSearchParam(search: string): boolean {
  const searchParams = new URLSearchParams(search)
  return !!(searchParams.get('recipient') || searchParams.get('recipientAddress'))
}
