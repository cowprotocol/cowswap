import { useEffect } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

import { usePostHooksRecipientOverride } from 'modules/hooksStore'

import { useTradeStateFromUrl } from './setupTradeState/useTradeStateFromUrl'
import { useDerivedTradeState } from './useDerivedTradeState'

import { useIsAlternativeOrderModalVisible } from '../state/alternativeOrder'

export function useResetRecipient(onChangeRecipient: (recipient: string | null) => void): null {
  const isAlternativeOrderModalVisible = useIsAlternativeOrderModalVisible()
  const tradeState = useDerivedTradeState()
  const tradeStateFromUrl = useTradeStateFromUrl()
  const postHooksRecipientOverride = usePostHooksRecipientOverride()
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
    if (!postHooksRecipientOverride && recipient === prevPostHooksRecipientOverride) {
      onChangeRecipient(null)
    }
  }, [recipient, postHooksRecipientOverride, prevPostHooksRecipientOverride, onChangeRecipient])

  return null
}
