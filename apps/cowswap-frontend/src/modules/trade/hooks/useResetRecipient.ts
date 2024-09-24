import { useEffect } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

import { usePostHooksRecipientOverride } from 'modules/hooksStore'

import { useTradeStateFromUrl } from './setupTradeState/useTradeStateFromUrl'
import { useDerivedTradeState } from './useDerivedTradeState'

import { useIsAlternativeOrderModalVisible } from '../state/alternativeOrder'
import { useIsHooksTradeType } from './useIsHooksTradeType'

export function useResetRecipient(onChangeRecipient: (recipient: string | null) => void): null {
  const isAlternativeOrderModalVisible = useIsAlternativeOrderModalVisible()
  const tradeState = useDerivedTradeState()
  const tradeStateFromUrl = useTradeStateFromUrl()
  const postHooksRecipientOverride = usePostHooksRecipientOverride()
  const isHooksTradeType = useIsHooksTradeType()
  const hasTradeState = !!tradeStateFromUrl
  const { chainId } = useWalletInfo()

  const prevPostHooksRecipientOverride = usePrevious(postHooksRecipientOverride)
  const recipient = tradeState?.recipient
  const hasRecipientInUrl = !!tradeStateFromUrl?.recipient

  /**
   * Reset recipient value only once at App start if it's not set in URL
   */
  useEffect(() => {
    if (!hasRecipientInUrl && !isAlternativeOrderModalVisible && !postHooksRecipientOverride) {
      onChangeRecipient(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTradeState])

  /**
   * Reset recipient whenever chainId changes
   */
  useEffect(() => {
    if (!postHooksRecipientOverride) {
      onChangeRecipient(null)
    }
  }, [chainId, onChangeRecipient])

  /**
   * Remove recipient override when its source hook was deleted
   */
  useEffect(() => {
    const recipientOverrideWasRemoved = !postHooksRecipientOverride && recipient === prevPostHooksRecipientOverride

    if (recipientOverrideWasRemoved || !isHooksTradeType) {
      onChangeRecipient(null)
    }
  }, [recipient, isHooksTradeType, postHooksRecipientOverride, prevPostHooksRecipientOverride, onChangeRecipient])

  return null
}
