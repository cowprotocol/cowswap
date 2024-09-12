import { useEffect } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useTradeStateFromUrl } from './setupTradeState/useTradeStateFromUrl'

import { useIsAlternativeOrderModalVisible } from '../state/alternativeOrder'

import { usePostHooksRecipientOverride } from 'modules/hooksStore'
import { useDerivedTradeState } from './useDerivedTradeState'
import { usePrevious } from '@cowprotocol/common-hooks'

export function useResetRecipient(onChangeRecipient: (recipient: string | null) => void): null {
  const isAlternativeOrderModalVisible = useIsAlternativeOrderModalVisible()
  const tradeState = useDerivedTradeState()
  const tradeStateFromUrl = useTradeStateFromUrl()
  const postHooksRecipientOverride = usePostHooksRecipientOverride()
  const { chainId } = useWalletInfo()

  const prevPstHooksRecipientOverride = usePrevious(postHooksRecipientOverride)
  const recipient = tradeState?.recipient
  const hasRecipientInUrl = !!tradeStateFromUrl.recipient

  /**
   * Reset recipient value only once at App start if it's not set in URL
   */
  useEffect(() => {
    if (!hasRecipientInUrl && !isAlternativeOrderModalVisible && !postHooksRecipientOverride) {
      onChangeRecipient(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    if (!postHooksRecipientOverride && recipient === prevPstHooksRecipientOverride) {
      onChangeRecipient(null)
    }
  }, [recipient, postHooksRecipientOverride, prevPstHooksRecipientOverride, onChangeRecipient])

  return null
}
